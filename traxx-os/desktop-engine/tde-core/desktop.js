/**
 * Traxx Desktop Engine - Desktop JavaScript
 * Traxx X Code OS V3
 * Created by Vincent Ganiza (Traxxion Tech)
 * © 2026 All Rights Reserved
 */

// System Configuration
let systemConfig = null;
let systemState = {
    windows: [],
    activeWindow: null,
    apps: [],
    notifications: [],
    settings: {
        volume: 80,
        brightness: 100,
        wifi: true,
        bluetooth: false
    }
};

// Initialize Desktop
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[TDE] Initializing Traxx Desktop Engine...');
    
    // Load system configuration
    await loadSystemConfig();
    
    // Initialize components
    initializeDesktop();
    initializeTaskbar();
    initializeAppLauncher();
    initializeAIWidget();
    initializeClock();
    initializeContextMenu();
    initializeWindowManager();
    
    // Apply branding
    applyBranding();
    
    console.log('[TDE] Desktop initialized successfully');
});

// Load System Configuration
async function loadSystemConfig() {
    try {
        if (typeof require !== 'undefined') {
            const config = require('../../core/system_config.json');
            systemConfig = config;
        } else {
            // For web preview
            systemConfig = {
                system: {
                    name: "Traxx X Code OS",
                    version: "V3",
                    codename: "Horizon"
                },
                developer: {
                    name: "Vincent Ganiza",
                    company: "Traxxion Tech",
                    email: "traxxiontech@gmail.com",
                    region: "Zimbabwe"
                },
                branding: {
                    primary_color: "#1a1a1a",
                    secondary_color: "#ff6b00",
                    accent_color: "#ffffff"
                }
            };
        }
    } catch (error) {
        console.warn('[TDE] Using default configuration');
        systemConfig = {
            system: {
                name: "Traxx X Code OS",
                version: "V3"
            },
            developer: {
                name: "Vincent Ganiza",
                company: "Traxxion Tech"
            }
        };
    }
}

// Apply Branding
function applyBranding() {
    if (systemConfig && systemConfig.branding) {
        document.documentElement.style.setProperty('--traxx-orange', systemConfig.branding.secondary_color);
        document.documentElement.style.setProperty('--traxx-black', systemConfig.branding.primary_color);
    }
}

// Initialize Desktop
function initializeDesktop() {
    // Initialize desktop icons
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.dataset.app;
            launchApp(appName);
        });
    });
    
    // Desktop click to close menus
    document.getElementById('desktop').addEventListener('click', (e) => {
        if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons')) {
            closeAllMenus();
        }
    });
}

// Initialize Taskbar
function initializeTaskbar() {
    // Launcher button
    const launcherBtn = document.getElementById('launcher-btn');
    launcherBtn.addEventListener('click', toggleAppLauncher);
    
    // Taskbar apps
    const taskbarApps = document.querySelectorAll('.taskbar-app');
    taskbarApps.forEach(app => {
        app.addEventListener('click', () => {
            const appName = app.dataset.app;
            launchApp(appName);
        });
    });
    
    // Search bar
    const searchInput = document.getElementById('global-search');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
    
    // System tray icons
    document.getElementById('traxx-ai-toggle').addEventListener('click', toggleAIWidget);
    document.getElementById('volume-toggle').addEventListener('click', toggleVolumeControl);
    document.getElementById('network-toggle').addEventListener('click', toggleNetworkControl);
    
    // Show desktop button
    document.getElementById('show-desktop').addEventListener('click', showDesktop);
}

// Initialize App Launcher
function initializeAppLauncher() {
    // Search in launcher
    const searchInput = document.getElementById('launcher-search-input');
    searchInput.addEventListener('input', (e) => {
        filterApps(e.target.value);
    });
    
    // Load apps into launcher
    loadLauncherApps();
    
    // Quick actions
    const quickActions = document.querySelectorAll('.quick-action');
    quickActions.forEach(action => {
        action.addEventListener('click', () => {
            const actionName = action.dataset.action;
            handleQuickAction(actionName);
            closeAppLauncher();
        });
    });
    
    // Power button
    document.getElementById('power-button').addEventListener('click', showPowerMenu);
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        const launcher = document.getElementById('app-launcher');
        const launcherBtn = document.getElementById('launcher-btn');
        if (!launcher.contains(e.target) && !launcherBtn.contains(e.target)) {
            closeAppLauncher();
        }
    });
}

// Load Apps into Launcher
function loadLauncherApps() {
    const apps = [
        { id: 'browser', name: 'Browser', icon: 'fa-globe' },
        { id: 'terminal', name: 'Terminal', icon: 'fa-terminal' },
        { id: 'files', name: 'Files', icon: 'fa-folder' },
        { id: 'code-editor', name: 'CodeForge', icon: 'fa-code' },
        { id: 'sync-player', name: 'Sync Player', icon: 'fa-play-circle' },
        { id: 'traxx-store', name: 'Traxx Store', icon: 'fa-store' },
        { id: 'traxx-ai', name: 'Traxx AI', icon: 'fa-robot' },
        { id: 'settings', name: 'Settings', icon: 'fa-cog' },
        { id: 'photos', name: 'Photos', icon: 'fa-image' },
        { id: 'notes', name: 'Notes', icon: 'fa-sticky-note' },
        { id: 'calendar', name: 'Calendar', icon: 'fa-calendar' },
        { id: 'calculator', name: 'Calculator', icon: 'fa-calculator' }
    ];
    
    const pinnedGrid = document.getElementById('pinned-apps');
    const allAppsGrid = document.getElementById('all-apps');
    
    pinnedGrid.innerHTML = '';
    allAppsGrid.innerHTML = '';
    
    apps.forEach(app => {
        const appElement = createLauncherApp(app);
        pinnedGrid.appendChild(appElement.cloneNode(true));
        allAppsGrid.appendChild(appElement);
    });
    
    // Add click handlers
    document.querySelectorAll('.launcher-app').forEach(appEl => {
        appEl.addEventListener('click', () => {
            const appId = appEl.dataset.appId;
            launchApp(appId);
            closeAppLauncher();
        });
    });
}

// Create Launcher App Element
function createLauncherApp(app) {
    const div = document.createElement('div');
    div.className = 'launcher-app';
    div.dataset.appId = app.id;
    div.innerHTML = `
        <div class="app-icon">
            <i class="fas ${app.icon}"></i>
        </div>
        <span class="app-name">${app.name}</span>
    `;
    return div;
}

// Filter Apps in Launcher
function filterApps(query) {
    const apps = document.querySelectorAll('.launcher-app');
    apps.forEach(app => {
        const name = app.querySelector('.app-name').textContent.toLowerCase();
        if (name.includes(query.toLowerCase())) {
            app.style.display = 'flex';
        } else {
            app.style.display = 'none';
        }
    });
}

// Handle Quick Action
function handleQuickAction(action) {
    switch(action) {
        case 'settings':
            launchApp('settings');
            break;
        case 'files':
            launchApp('files');
            break;
        case 'terminal':
            launchApp('terminal');
            break;
        case 'traxx-ai':
            launchApp('traxx-ai');
            break;
        case 'app-store':
            launchApp('traxx-store');
            break;
        case 'cloud':
            launchApp('cloud');
            break;
    }
}

// Toggle App Launcher
function toggleAppLauncher() {
    const launcher = document.getElementById('app-launcher');
    launcher.classList.toggle('hidden');
    
    if (!launcher.classList.contains('hidden')) {
        document.getElementById('launcher-search-input').focus();
    }
}

// Close App Launcher
function closeAppLauncher() {
    document.getElementById('app-launcher').classList.add('hidden');
}

// Initialize AI Widget
function initializeAIWidget() {
    const widget = document.getElementById('traxx-ai-widget');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    // Minimize button
    widget.querySelector('.minimize-btn').addEventListener('click', () => {
        widget.classList.add('minimized');
    });
    
    // Send message
    const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        addAIMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator and add response
        hideTypingIndicator();
        addAIMessage(response, 'system');
    };
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Add AI Message
function addAIMessage(text, type) {
    const container = document.getElementById('ai-chat-messages');
    const message = document.createElement('div');
    message.className = `ai-message ${type}`;
    message.innerHTML = `<p>${escapeHtml(text)}</p>`;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

// Show Typing Indicator
function showTypingIndicator() {
    const container = document.getElementById('ai-chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'ai-message system typing-indicator';
    indicator.innerHTML = '<p>Traxx AI is thinking...</p>';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

// Hide Typing Indicator
function hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

// Get AI Response
async function getAIResponse(query) {
    // Check if we have access to the Electron API
    if (typeof require !== 'undefined') {
        try {
            const { ipcRenderer } = require('electron');
            const response = await ipcRenderer.invoke('ai-query', query);
            return response.response;
        } catch (error) {
            console.error('[TDE] AI Query Error:', error);
        }
    }
    
    // Fallback: Simulated AI responses
    const responses = {
        'hello': "Hello! I'm Traxx AI, your intelligent assistant. How can I help you today?",
        'help': "I can help you with:\n• Opening applications\n• Searching for files\n• System settings\n• Answering questions\n• Code assistance\n• And much more!",
        'weather': "I don't have access to real-time weather data in offline mode. Connect to the internet for accurate weather information.",
        'time': `The current time is ${new Date().toLocaleTimeString()}`,
        'date': `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        'who are you': "I'm Traxx AI, the intelligent assistant built into Traxx X Code OS V3. I was created by Vincent Ganiza at Traxxion Tech in Zimbabwe 🇿🇼.",
        'developer': "Traxx X Code OS was developed by Vincent Ganiza from Traxxion Tech, proudly made in Zimbabwe 🇿🇼. Contact: traxxiontech@gmail.com"
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Check for matching responses
    const lowerQuery = query.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
        if (lowerQuery.includes(key)) {
            return value;
        }
    }
    
    // Default response
    return `I understand you're asking about "${query}". In offline mode, my capabilities are limited. For more comprehensive assistance, please connect to the internet. Is there anything else I can help you with?`;
}

// Toggle AI Widget
function toggleAIWidget() {
    const widget = document.getElementById('traxx-ai-widget');
    widget.classList.toggle('minimized');
    
    if (!widget.classList.contains('minimized')) {
        document.getElementById('ai-input').focus();
    }
}

// Initialize Clock
function initializeClock() {
    const updateTime = () => {
        const now = new Date();
        
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const dateStr = now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('current-date').textContent = dateStr;
    };
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Initialize Context Menu
function initializeContextMenu() {
    const desktop = document.getElementById('desktop');
    const contextMenu = document.getElementById('context-menu');
    
    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Position context menu
        let x = e.clientX;
        let y = e.clientY;
        
        // Ensure menu stays within viewport
        const menuWidth = 200;
        const menuHeight = 300;
        
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight - 48) {
            y = window.innerHeight - menuHeight - 58;
        }
        
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
    });
    
    // Close context menu on click
    document.addEventListener('click', () => {
        contextMenu.classList.add('hidden');
    });
    
    // Handle context menu actions
    document.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleContextAction(action);
        });
    });
}

// Handle Context Menu Action
function handleContextAction(action) {
    switch(action) {
        case 'new-folder':
            showNotification('New Folder', 'Folder creation dialog would open here');
            break;
        case 'new-file':
            showNotification('New File', 'File creation dialog would open here');
            break;
        case 'terminal':
            launchApp('terminal');
            break;
        case 'settings':
            launchApp('settings');
            break;
        case 'wallpaper':
            showNotification('Wallpaper', 'Wallpaper settings would open here');
            break;
        case 'about':
            showAboutDialog();
            break;
    }
}

// Show About Dialog
function showAboutDialog() {
    const aboutContent = `
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #ff6b00; margin-bottom: 10px;">Traxx X Code OS V3</h2>
            <p style="color: #888; margin-bottom: 20px;">Codename: Horizon</p>
            <p>Created by <strong>Vincent Ganiza</strong></p>
            <p style="color: #ff6b00;">Traxxion Tech</p>
            <p style="margin-top: 20px;">🇿🇼 Proudly Made in Zimbabwe</p>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">© 2026 All Rights Reserved</p>
            <p style="color: #666; font-size: 11px; margin-top: 5px;">traxxiontech@gmail.com</p>
        </div>
    `;
    
    createWindow('about', 'About Traxx OS', aboutContent, 400, 350);
}

// Initialize Window Manager
function initializeWindowManager() {
    // Track window interactions
    document.addEventListener('mousedown', (e) => {
        const window = e.target.closest('.traxx-window');
        if (window) {
            focusWindow(window.dataset.windowId);
        }
    });
}

// Launch Application
function launchApp(appId) {
    console.log(`[TDE] Launching app: ${appId}`);
    
    // Check if app is already open
    const existingWindow = document.querySelector(`[data-app="${appId}"]`);
    if (existingWindow) {
        focusWindow(existingWindow.dataset.windowId);
        return;
    }
    
    // Create app window
    switch(appId) {
        case 'browser':
            createBrowserWindow();
            break;
        case 'terminal':
            createTerminalWindow();
            break;
        case 'files':
            createFileManagerWindow();
            break;
        case 'code-editor':
            createCodeEditorWindow();
            break;
        case 'sync-player':
            createSyncPlayerWindow();
            break;
        case 'traxx-store':
            createAppStoreWindow();
            break;
        case 'traxx-ai':
            toggleAIWidget();
            return;
        case 'settings':
            createSettingsWindow();
            break;
        default:
            showNotification('App', `${appId} would launch here`);
    }
}

// Window Creation Functions
function createWindow(id, title, content, width = 800, height = 600) {
    const windowsContainer = document.getElementById('windows-container');
    const windowId = `window-${Date.now()}`;
    
    const windowEl = document.createElement('div');
    windowEl.className = 'traxx-window';
    windowEl.dataset.windowId = windowId;
    windowEl.dataset.app = id;
    windowEl.style.width = `${width}px`;
    windowEl.style.height = `${height}px`;
    windowEl.style.left = `${100 + Math.random() * 200}px`;
    windowEl.style.top = `${50 + Math.random() * 100}px`;
    
    windowEl.innerHTML = `
        <div class="window-header">
            <i class="fas fa-window-maximize window-icon"></i>
            <span class="window-title">${title}</span>
            <div class="window-controls">
                <button class="window-btn minimize"><i class="fas fa-minus"></i></button>
                <button class="window-btn maximize"><i class="fas fa-square"></i></button>
                <button class="window-btn close"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div class="window-content">
            ${content}
        </div>
    `;
    
    windowsContainer.appendChild(windowEl);
    
    // Make window draggable
    makeDraggable(windowEl);
    
    // Add window controls
    const header = windowEl.querySelector('.window-header');
    const minimizeBtn = windowEl.querySelector('.window-btn.minimize');
    const maximizeBtn = windowEl.querySelector('.window-btn.maximize');
    const closeBtn = windowEl.querySelector('.window-btn.close');
    
    minimizeBtn.addEventListener('click', () => minimizeWindow(windowEl));
    maximizeBtn.addEventListener('click', () => maximizeWindow(windowEl));
    closeBtn.addEventListener('click', () => closeWindow(windowEl));
    
    // Focus on click
    windowEl.addEventListener('mousedown', () => focusWindow(windowId));
    
    // Focus new window
    focusWindow(windowId);
    
    // Update taskbar
    updateTaskbar(id, true);
    
    return windowEl;
}

// Make Window Draggable
function makeDraggable(element) {
    const header = element.querySelector('.window-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    });
    
    function drag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        element.style.left = `${initialX + deltaX}px`;
        element.style.top = `${initialY + deltaY}px`;
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

// Window Management Functions
function focusWindow(windowId) {
    document.querySelectorAll('.traxx-window').forEach(w => {
        w.classList.remove('active');
    });
    
    const window = document.querySelector(`[data-window-id="${windowId}"]`);
    if (window) {
        window.classList.add('active');
        window.style.zIndex = getHighestZIndex() + 1;
    }
}

function minimizeWindow(windowEl) {
    windowEl.style.display = 'none';
}

function maximizeWindow(windowEl) {
    if (windowEl.dataset.maximized === 'true') {
        // Restore
        windowEl.style.width = windowEl.dataset.prevWidth;
        windowEl.style.height = windowEl.dataset.prevHeight;
        windowEl.style.left = windowEl.dataset.prevLeft;
        windowEl.style.top = windowEl.dataset.prevTop;
        windowEl.dataset.maximized = 'false';
    } else {
        // Maximize
        windowEl.dataset.prevWidth = windowEl.style.width;
        windowEl.dataset.prevHeight = windowEl.style.height;
        windowEl.dataset.prevLeft = windowEl.style.left;
        windowEl.dataset.prevTop = windowEl.style.top;
        
        windowEl.style.width = '100%';
        windowEl.style.height = 'calc(100% - 48px)';
        windowEl.style.left = '0';
        windowEl.style.top = '0';
        windowEl.dataset.maximized = 'true';
    }
}

function closeWindow(windowEl) {
    const appId = windowEl.dataset.app;
    windowEl.remove();
    updateTaskbar(appId, false);
}

function getHighestZIndex() {
    let highest = 0;
    document.querySelectorAll('.traxx-window').forEach(w => {
        const z = parseInt(w.style.zIndex) || 0;
        if (z > highest) highest = z;
    });
    return highest;
}

// Update Taskbar
function updateTaskbar(appId, isOpen) {
    const taskbarBtn = document.querySelector(`.taskbar-app[data-app="${appId}"]`);
    if (taskbarBtn) {
        if (isOpen) {
            taskbarBtn.classList.add('active');
        } else {
            taskbarBtn.classList.remove('active');
        }
    }
}

// Show Desktop
function showDesktop() {
    document.querySelectorAll('.traxx-window').forEach(w => {
        w.style.display = w.style.display === 'none' ? 'block' : 'none';
    });
}

// Close All Menus
function closeAllMenus() {
    closeAppLauncher();
    document.getElementById('context-menu').classList.add('hidden');
}

// Show Notification
function showNotification(title, message, type = 'info') {
    const notificationCenter = document.getElementById('notification-list');
    
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-bell"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    notificationCenter.insertBefore(notification, notificationCenter.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// App-specific Window Creators
function createBrowserWindow() {
    const content = `
        <div style="height: 100%; display: flex; flex-direction: column; background: #0f0f0f;">
            <div style="padding: 8px; background: #1a1a1a; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #333;">
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-arrow-left"></i></button>
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-arrow-right"></i></button>
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-sync-alt"></i></button>
                <input type="text" placeholder="Search or enter URL..." style="flex: 1; padding: 8px 16px; background: #2a2a2a; border: 1px solid #333; border-radius: 20px; color: white; outline: none;">
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-star"></i></button>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: #666;">
                <div style="text-align: center;">
                    <i class="fas fa-globe" style="font-size: 64px; color: #ff6b00; margin-bottom: 20px;"></i>
                    <h2 style="color: #ff6b00;">Traxx Browser</h2>
                    <p>Fast, secure browsing powered by Chromium</p>
                </div>
            </div>
        </div>
    `;
    createWindow('browser', 'Traxx Browser', content, 1000, 700);
}

function createTerminalWindow() {
    const content = `
        <div style="height: 100%; background: #0a0a0a; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; overflow: auto;">
            <div style="color: #ff6b00; margin-bottom: 8px;">
                <span style="color: #00ff88;">traxx-user@traxx-os</span>:<span style="color: #5faaff;">~</span>$
            </div>
            <div style="color: #888;">Welcome to Traxx Terminal V3</div>
            <div style="color: #666;">Type 'help' for available commands</div>
            <div style="margin-top: 8px;">
                <span style="color: #00ff88;">traxx-user@traxx-os</span>:<span style="color: #5faaff;">~</span>$ <span style="color: white; animation: blink 1s infinite;">_</span>
            </div>
        </div>
        <style>
            @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        </style>
    `;
    createWindow('terminal', 'Traxx Terminal', content, 800, 500);
}

function createFileManagerWindow() {
    const content = `
        <div style="height: 100%; display: flex; flex-direction: column; background: #0f0f0f;">
            <div style="padding: 8px; background: #1a1a1a; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #333;">
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-arrow-left"></i></button>
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-arrow-right"></i></button>
                <button style="background: none; border: none; color: #888; cursor: pointer;"><i class="fas fa-arrow-up"></i></button>
                <div style="flex: 1; padding: 8px; background: #2a2a2a; border-radius: 4px; color: #888;">
                    <i class="fas fa-home" style="color: #ff6b00;"></i> / Home
                </div>
            </div>
            <div style="display: flex; flex: 1;">
                <div style="width: 200px; background: #1a1a1a; padding: 16px; border-right: 1px solid #333;">
                    <div style="color: #ff6b00; font-weight: 600; margin-bottom: 16px;">Quick Access</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-home"></i> Home</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-desktop"></i> Desktop</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-download"></i> Downloads</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-file-code"></i> Documents</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-music"></i> Music</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-image"></i> Pictures</div>
                        <div style="color: #888; cursor: pointer; padding: 8px; border-radius: 4px;"><i class="fas fa-video"></i> Videos</div>
                    </div>
                </div>
                <div style="flex: 1; padding: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px;">
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-folder" style="font-size: 48px; color: #ff6b00;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Documents</div>
                        </div>
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-folder" style="font-size: 48px; color: #ff6b00;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Downloads</div>
                        </div>
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-folder" style="font-size: 48px; color: #ff6b00;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Music</div>
                        </div>
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-folder" style="font-size: 48px; color: #ff6b00;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Pictures</div>
                        </div>
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-folder" style="font-size: 48px; color: #ff6b00;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Videos</div>
                        </div>
                        <div style="text-align: center; padding: 16px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-file-code" style="font-size: 48px; color: #5faaff;"></i>
                            <div style="color: #888; margin-top: 8px; font-size: 12px;">Projects</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    createWindow('files', 'Traxx Files', content, 900, 600);
}

function createCodeEditorWindow() {
    const content = `
        <div style="height: 100%; display: flex; background: #0a0a0a;">
            <div style="width: 200px; background: #0f0f0f; padding: 8px; border-right: 1px solid #333;">
                <div style="color: #ff6b00; font-weight: 600; padding: 8px; font-size: 12px;">EXPLORER</div>
                <div style="padding-left: 8px;">
                    <div style="color: #888; padding: 4px 8px; font-size: 13px; cursor: pointer;"><i class="fas fa-folder" style="color: #ff6b00;"></i> src</div>
                    <div style="color: #888; padding: 4px 8px 4px 24px; font-size: 13px; cursor: pointer;"><i class="fas fa-file-code" style="color: #5faaff;"></i> main.py</div>
                    <div style="color: #888; padding: 4px 8px 4px 24px; font-size: 13px; cursor: pointer;"><i class="fas fa-file-code" style="color: #5faaff;"></i> app.js</div>
                    <div style="color: #888; padding: 4px 8px 4px 24px; font-size: 13px; cursor: pointer;"><i class="fas fa-file-code" style="color: #e06c75;"></i> style.css</div>
                    <div style="color: #888; padding: 4px 8px; font-size: 13px; cursor: pointer;"><i class="fas fa-folder" style="color: #ff6b00;"></i> assets</div>
                    <div style="color: #888; padding: 4px 8px; font-size: 13px; cursor: pointer;"><i class="fas fa-file-alt" style="color: #888;"></i> README.md</div>
                </div>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column;">
                <div style="display: flex; background: #1a1a1a; border-bottom: 1px solid #333;">
                    <div style="padding: 8px 16px; background: #0a0a0a; color: #ff6b00; border-bottom: 2px solid #ff6b00; font-size: 13px;">main.py</div>
                    <div style="padding: 8px 16px; color: #888; font-size: 13px;">app.js</div>
                    <div style="padding: 8px 16px; color: #888; font-size: 13px;">style.css</div>
                </div>
                <div style="flex: 1; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; overflow: auto;">
                    <div><span style="color: #c678dd;">#!/usr/bin/env python3</span></div>
                    <div><span style="color: #5c6370;"># Traxx X Code OS - Main Application</span></div>
                    <div><span style="color: #5c6370;"># Created by Vincent Ganiza (Traxxion Tech)</span></div>
                    <div></div>
                    <div><span style="color: #c678dd;">import</span> <span style="color: #e5c07b;">sys</span></div>
                    <div><span style="color: #c678dd;">import</span> <span style="color: #e5c07b;">os</span></div>
                    <div><span style="color: #c678dd;">from</span> <span style="color: #e5c07b;">PyQt5</span> <span style="color: #c678dd;">import</span> QtWidgets, QtCore</div>
                    <div></div>
                    <div><span style="color: #c678dd;">class</span> <span style="color: #e5c07b;">TraxxOS</span><span style="color: #abb2bf;">(QtWidgets.QApplication):</span></div>
                    <div><span style="color: #abb2bf;">    </span><span style="color: #c678dd;">def</span> <span style="color: #61afef;">__init__</span><span style="color: #abb2bf;">(self):</span></div>
                    <div><span style="color: #abb2bf;">        </span><span style="color: #c678dd;">super</span><span style="color: #abb2bf;">().__init__(sys.argv)</span></div>
                    <div><span style="color: #abb2bf;">        self.setApplicationName(</span><span style="color: #98c379;">"Traxx X Code OS"</span><span style="color: #abb2bf;">)</span></div>
                    <div><span style="color: #abb2bf;">        self.setStyle(</span><span style="color: #98c379;">"Fusion"</span><span style="color: #abb2bf;">)</span></div>
                    <div></div>
                    <div><span style="color: #c678dd;">if</span> <span style="color: #abb2bf;">__name__ == </span><span style="color: #98c379;">"__main__"</span><span style="color: #abb2bf;">:</span></div>
                    <div><span style="color: #abb2bf;">    app = TraxxOS()</span></div>
                    <div><span style="color: #abb2bf;">    app.exec_()</span></div>
                </div>
            </div>
        </div>
    `;
    createWindow('code-editor', 'CodeForge', content, 1000, 700);
}

function createSyncPlayerWindow() {
    const content = `
        <div style="height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);">
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="width: 200px; height: 200px; background: linear-gradient(135deg, #ff6b00 0%, #e55d00 100%); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(255, 107, 0, 0.3);">
                        <i class="fas fa-music" style="font-size: 80px; color: white;"></i>
                    </div>
                    <div style="color: white; font-size: 18px; font-weight: 600;">No Track Playing</div>
                    <div style="color: #888; font-size: 14px; margin-top: 4px;">Select a file to play</div>
                </div>
            </div>
            <div style="padding: 24px; background: #0f0f0f; border-top: 1px solid #333;">
                <div style="margin-bottom: 16px;">
                    <div style="height: 4px; background: #333; border-radius: 2px;">
                        <div style="width: 35%; height: 100%; background: #ff6b00; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; color: #888; font-size: 12px;">
                        <span>1:23</span>
                        <span>3:45</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 24px;">
                    <button style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;"><i class="fas fa-random"></i></button>
                    <button style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;"><i class="fas fa-step-backward"></i></button>
                    <button style="width: 56px; height: 56px; background: #ff6b00; border: none; border-radius: 50%; color: white; font-size: 24px; cursor: pointer;"><i class="fas fa-play"></i></button>
                    <button style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;"><i class="fas fa-step-forward"></i></button>
                    <button style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;"><i class="fas fa-redo"></i></button>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px;">
                    <i class="fas fa-volume-up" style="color: #888;"></i>
                    <div style="width: 100px; height: 4px; background: #333; border-radius: 2px;">
                        <div style="width: 80%; height: 100%; background: #ff6b00; border-radius: 2px;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    createWindow('sync-player', 'Sync Player', content, 450, 600);
}

function createAppStoreWindow() {
    const content = `
        <div style="height: 100%; display: flex; background: #0f0f0f;">
            <div style="width: 200px; background: #0a0a0a; padding: 16px; border-right: 1px solid #333;">
                <div style="color: #ff6b00; font-weight: 600; margin-bottom: 24px; font-size: 18px;">
                    <i class="fas fa-store"></i> Traxx Store
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="color: white; padding: 12px; background: rgba(255, 107, 0, 0.2); border-radius: 8px; cursor: pointer;"><i class="fas fa-home"></i> Home</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-th-large"></i> Categories</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-fire"></i> Featured</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-download"></i> Updates</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-heart"></i> Favorites</div>
                </div>
            </div>
            <div style="flex: 1; padding: 24px; overflow: auto;">
                <h2 style="color: white; margin-bottom: 24px;">Featured Applications</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; border: 1px solid #333; cursor: pointer;">
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ff6b00 0%, #e55d00 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-palette" style="color: white; font-size: 24px;"></i>
                            </div>
                            <div>
                                <div style="color: white; font-weight: 600;">Figma</div>
                                <div style="color: #888; font-size: 12px;">Design & Creative</div>
                            </div>
                        </div>
                        <div style="color: #666; font-size: 13px; margin-bottom: 12px;">Collaborative interface design tool</div>
                        <button style="width: 100%; padding: 8px; background: #ff6b00; border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer;">Install</button>
                    </div>
                    <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; border: 1px solid #333; cursor: pointer;">
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #5faaff 0%, #3d8bff 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-slack" style="color: white; font-size: 24px;"></i>
                            </div>
                            <div>
                                <div style="color: white; font-weight: 600;">Slack</div>
                                <div style="color: #888; font-size: 12px;">Communication</div>
                            </div>
                        </div>
                        <div style="color: #666; font-size: 13px; margin-bottom: 12px;">Team communication platform</div>
                        <button style="width: 100%; padding: 8px; background: #ff6b00; border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer;">Install</button>
                    </div>
                    <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; border: 1px solid #333; cursor: pointer;">
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fab fa-spotify" style="color: white; font-size: 24px;"></i>
                            </div>
                            <div>
                                <div style="color: white; font-weight: 600;">Spotify</div>
                                <div style="color: #888; font-size: 12px;">Music & Audio</div>
                            </div>
                        </div>
                        <div style="color: #666; font-size: 13px; margin-bottom: 12px;">Stream music and podcasts</div>
                        <button style="width: 100%; padding: 8px; background: #333; border: none; border-radius: 6px; color: #888; font-weight: 600; cursor: pointer;">Installed</button>
                    </div>
                    <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; border: 1px solid #333; cursor: pointer;">
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #e06c75 0%, #c678dd 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-code" style="color: white; font-size: 24px;"></i>
                            </div>
                            <div>
                                <div style="color: white; font-weight: 600;">VS Code</div>
                                <div style="color: #888; font-size: 12px;">Development</div>
                            </div>
                        </div>
                        <div style="color: #666; font-size: 13px; margin-bottom: 12px;">Code editing redefined</div>
                        <button style="width: 100%; padding: 8px; background: #ff6b00; border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer;">Install</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    createWindow('traxx-store', 'Traxx Store', content, 900, 600);
}

function createSettingsWindow() {
    const content = `
        <div style="height: 100%; display: flex; background: #0f0f0f;">
            <div style="width: 220px; background: #0a0a0a; padding: 16px; border-right: 1px solid #333;">
                <div style="color: #ff6b00; font-weight: 600; margin-bottom: 24px; font-size: 18px;">
                    <i class="fas fa-cog"></i> Settings
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="color: white; padding: 12px; background: rgba(255, 107, 0, 0.2); border-radius: 8px; cursor: pointer;"><i class="fas fa-wifi"></i> Network</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-bluetooth-b"></i> Bluetooth</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-desktop"></i> Display</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-volume-up"></i> Sound</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-bell"></i> Notifications</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-palette"></i> Appearance</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-cloud"></i> Traxx Cloud</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-user"></i> Accounts</div>
                    <div style="color: #888; padding: 12px; border-radius: 8px; cursor: pointer;"><i class="fas fa-info-circle"></i> About</div>
                </div>
            </div>
            <div style="flex: 1; padding: 24px; overflow: auto;">
                <h2 style="color: white; margin-bottom: 8px;">Network</h2>
                <p style="color: #888; margin-bottom: 24px;">Manage your network connections</p>
                
                <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-wifi" style="color: #ff6b00; font-size: 24px;"></i>
                            <div>
                                <div style="color: white; font-weight: 600;">Wi-Fi</div>
                                <div style="color: #00ff88; font-size: 13px;">Connected to TraxxNetwork</div>
                            </div>
                        </div>
                        <label style="position: relative; display: inline-block; width: 48px; height: 24px;">
                            <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ff6b00; border-radius: 24px;"></span>
                        </label>
                    </div>
                </div>
                
                <div style="background: #1a1a1a; border-radius: 12px; padding: 16px;">
                    <div style="color: white; font-weight: 600; margin-bottom: 16px;">Available Networks</div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #0f0f0f; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-wifi" style="color: #00ff88;"></i>
                                <span style="color: white;">TraxxNetwork</span>
                            </div>
                            <span style="color: #00ff88; font-size: 12px;">Connected</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #0f0f0f; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-wifi" style="color: #888;"></i>
                                <span style="color: #888;">Guest_Network</span>
                            </div>
                            <i class="fas fa-lock" style="color: #888; font-size: 12px;"></i>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #0f0f0f; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-wifi" style="color: #888;"></i>
                                <span style="color: #888;">Office_5G</span>
                            </div>
                            <i class="fas fa-lock" style="color: #888; font-size: 12px;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    createWindow('settings', 'Settings', content, 800, 600);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function performSearch(query) {
    console.log(`[TDE] Searching for: ${query}`);
    showNotification('Search', `Searching for "${query}"...`);
}

function toggleVolumeControl() {
    showNotification('Volume', 'Volume control panel would open here');
}

function toggleNetworkControl() {
    showNotification('Network', 'Network control panel would open here');
}

function showPowerMenu() {
    const powerContent = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; text-align: center;">
            <h2 style="color: #ff6b00;">Power Options</h2>
            <button style="padding: 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: white; cursor: pointer; font-size: 16px;">
                <i class="fas fa-redo" style="margin-right: 8px;"></i> Restart
            </button>
            <button style="padding: 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: white; cursor: pointer; font-size: 16px;">
                <i class="fas fa-power-off" style="margin-right: 8px; color: #ff4444;"></i> Shut Down
            </button>
            <button style="padding: 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: white; cursor: pointer; font-size: 16px;">
                <i class="fas fa-moon" style="margin-right: 8px;"></i> Sleep
            </button>
        </div>
    `;
    createWindow('power', 'Power', powerContent, 300, 300);
}

// Initialize desktop on load
console.log('[TDE] Traxx Desktop Engine loaded');