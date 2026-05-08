#!/bin/bash

# Traxx X Code OS V3 - ISO Build Script
# Created by Vincent Ganiza (Traxxion Tech)
# © 2026 All Rights Reserved

set -e

echo "==========================================="
echo "   Traxx X Code OS V3 - ISO Builder"
echo "   Created by Traxxion Tech"
echo "   © 2026 All Rights Reserved"
echo "==========================================="
echo ""

# Configuration
ISO_NAME="traxx-x-code-os-v3"
VERSION="3.0.0"
BUILD_DIR="./build/traxx-os-build"
ISO_DIR="./build/iso-output"
WORK_DIR="./build/work"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

# Clean previous build
clean_build() {
    echo -e "${ORANGE}Cleaning previous build...${NC}"
    sudo rm -rf "$BUILD_DIR" "$ISO_DIR" "$WORK_DIR"
    mkdir -p "$BUILD_DIR" "$ISO_DIR" "$WORK_DIR"
}

# Install required packages
install_dependencies() {
    echo -e "${ORANGE}Installing build dependencies...${NC}"
    sudo apt-get update
    sudo apt-get install -y \
        debootstrap \
        squashfs-tools \
        xorriso \
        isolinux \
        syslinux-common \
        grub-pc-bin \
        grub-efi-amd64-bin \
        mtools \
        xorriso
}

# Create base system
create_base_system() {
    echo -e "${ORANGE}Creating base Debian system...${NC}"
    sudo debootstrap --arch=amd64 bookworm "$BUILD_DIR/chroot" http://deb.debian.org/debian/
    
    # Configure chroot
    sudo cp /etc/resolv.conf "$BUILD_DIR/chroot/etc/resolv.conf"
    
    # Set up sources.list
    cat << EOF | sudo tee "$BUILD_DIR/chroot/etc/apt/sources.list"
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF
}

# Install Traxx OS packages
install_traxx_packages() {
    echo -e "${ORANGE}Installing Traxx OS packages and desktop environment...${NC}"
    
    # Create installation script for chroot
    cat << 'EOF' | sudo tee "$BUILD_DIR/chroot/tmp/install_traxx.sh"
#!/bin/bash
set -e

# Update system
apt-get update

# Install core desktop packages
apt-get install -y \
    linux-image-amd64 \
    grub-pc \
    grub-efi-amd64 \
    network-manager \
    pulseaudio \
    alsa-utils \
    xorg \
    lightdm \
    accountsservice

# Install Traxx Desktop Environment dependencies
apt-get install -y \
    nodejs \
    npm \
    python3 \
    python3-pip \
    git \
    curl \
    wget \
    vim \
    code \
    vlc \
    firefox-esr

# Install development tools
apt-get install -y \
    build-essential \
    docker.io \
    python3-venv \
    python3-dev

# Install Traxx OS branding
mkdir -p /usr/share/traxx
mkdir -p /usr/share/traxx/assets
mkdir -p /usr/share/traxx/themes

# Create Traxx OS wallpaper
mkdir -p /usr/share/backgrounds/traxx

# Configure LightDM for Traxx OS
cat > /etc/lightdm/lightdm-gtk-greeter.conf.d/99-traxx.conf << 'GREETER'
[greeter]
theme-name = Traxx-Dark
icon-theme-name = Traxx-Icons
background = /usr/share/backgrounds/traxx/traxx-wallpaper.png
GREETER

# Clean up
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF

    sudo chmod +x "$BUILD_DIR/chroot/tmp/install_traxx.sh"
    sudo chroot "$BUILD_DIR/chroot" /tmp/install_traxx.sh
}

# Install Traxx Desktop Engine
install_desktop_engine() {
    echo -e "${ORANGE}Installing Traxx Desktop Engine...${NC}"
    
    # Copy desktop engine files
    sudo mkdir -p "$BUILD_DIR/chroot/opt/traxx/desktop-engine"
    sudo cp -r ../desktop-engine/tde-core/* "$BUILD_DIR/chroot/opt/traxx/desktop-engine/"
    
    # Install npm dependencies in chroot
    sudo chroot "$BUILD_DIR/chroot" bash -c "cd /opt/traxx/desktop-engine && npm install"
    
    # Create desktop entry
    cat << 'EOF' | sudo tee "$BUILD_DIR/chroot/usr/share/xsessions/traxx.desktop"
[Desktop Entry]
Name=Traxx Desktop Engine
Comment=Traxx X Code OS Desktop Environment
Exec=/opt/traxx/desktop-engine/start-tde.sh
Icon=traxx-desktop
Type=Application
DesktopNames=TRAXX
EOF
}

# Create boot configuration
create_boot_config() {
    echo -e "${ORANGE}Creating boot configuration...${NC}"
    
    mkdir -p "$BUILD_DIR/iso/live"
    mkdir -p "$BUILD_DIR/iso/boot/grub"
    mkdir -p "$BUILD_DIR/iso/isolinux"
    
    # Create isolinux configuration
    cat << 'EOF' > "$BUILD_DIR/iso/isolinux/isolinux.cfg"
DEFAULT traxx
TIMEOUT 300
PROMPT 0

LABEL traxx
    KERNEL /boot/vmlinuz
    APPEND initrd=/boot/initrd.img boot=live components quiet splash
LABEL traxx-safe
    KERNEL /boot/vmlinuz
    APPEND initrd=/boot/initrd.img boot=live components quiet
EOF
    
    # Create GRUB configuration
    cat << 'EOF' > "$BUILD_DIR/iso/boot/grub/grub.cfg"
set default=0
set timeout=5

insmod all_video

menuentry "Traxx X Code OS V3" {
    linux /boot/vmlinuz boot=live components quiet splash
    initrd /boot/initrd.img
}

menuentry "Traxx X Code OS V3 (Safe Mode)" {
    linux /boot/vmlinuz boot=live components quiet
    initrd /boot/initrd.img
}

menuentry "Install Traxx X Code OS V3" {
    linux /boot/vmlinuz boot=live components install
    initrd /boot/initrd.img
}
EOF
    
    # Create Traxx splash screen
    cat << 'EOF' > "$BUILD_DIR/iso/boot/grub/splash.txt"
========================================
   Traxx X Code OS V3
   Created by Traxxion Tech
   Proudly Made in Zimbabwe
   © 2026 All Rights Reserved
========================================
EOF
}

# Create the live filesystem
create_live_filesystem() {
    echo -e "${ORANGE}Creating live filesystem...${NC}"
    
    # Copy kernel and initrd
    sudo cp "$BUILD_DIR/chroot/boot/vmlinuz-"* "$BUILD_DIR/iso/boot/vmlinuz"
    sudo cp "$BUILD_DIR/chroot/boot/initrd.img-"* "$BUILD_DIR/iso/boot/initrd.img"
    
    # Create squashfs
    sudo mksquashfs "$BUILD_DIR/chroot" "$BUILD_DIR/iso/live/filesystem.squashfs" \
        -comp xz -Xbcj x86 -b 1M -e boot
}

# Create the ISO
create_iso() {
    echo -e "${ORANGE}Creating bootable ISO...${NC}"
    
    # Install isolinux
    cp /usr/lib/ISOLINUX/isolinux.bin "$BUILD_DIR/iso/isolinux/"
    cp /usr/lib/syslinux/modules/bios/ldlinux.c32 "$BUILD_DIR/iso/isolinux/"
    cp /usr/lib/syslinux/modules/bios/libcom32.c32 "$BUILD_DIR/iso/isolinux/"
    cp /usr/lib/syslinux/modules/bios/libutil.c32 "$BUILD_DIR/iso/isolinux/"
    
    # Create EFI boot image
    mkdir -p "$BUILD_DIR/iso/boot/efi"
    grub-mkimage -o "$BUILD_DIR/iso/boot/efi/bootx64.efi" -O x86_64-efi \
        -p /boot/grub boot linux search normal configfile
    
    # Create the ISO with xorriso
    xorriso -as mkisofs \
        -o "$ISO_DIR/${ISO_NAME}-${VERSION}-amd64.iso" \
        -isohybrid-mbr /usr/lib/ISOLINUX/isohdpfx.bin \
        -c isolinux/boot.cat \
        -b isolinux/isolinux.bin \
        -no-emul-boot \
        -boot-load-size 4 \
        -boot-info-table \
        -eltorito-alt-boot \
        -e boot/efi/bootx64.efi \
        -no-emul-boot \
        -isohybrid-gpt-basdat \
        -V "TRAXX_OS_V3" \
        "$BUILD_DIR/iso"
    
    echo -e "${GREEN}ISO created successfully!${NC}"
    echo "Location: $ISO_DIR/${ISO_NAME}-${VERSION}-amd64.iso"
}

# Main build process
main() {
    echo -e "${ORANGE}Starting Traxx X Code OS build process...${NC}"
    
    clean_build
    install_dependencies
    create_base_system
    install_traxx_packages
    install_desktop_engine
    create_boot_config
    create_live_filesystem
    create_iso
    
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}   Build Complete!${NC}"
    echo -e "${GREEN}   Traxx X Code OS V3 ISO Ready${NC}"
    echo -e "${GREEN}   Created by Traxxion Tech${NC}"
    echo -e "${GREEN}   © 2026 All Rights Reserved${NC}"
    echo -e "${GREEN}=========================================${NC}"
}

# Run main function
main "$@"