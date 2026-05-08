/**
 * Traxx Store Backend
 * Application Store for Traxx X Code OS V3
 * Created by Vincent Ganiza (Traxxion Tech)
 * © 2026 All Rights Reserved
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class TraxxStore {
    constructor(config = {}) {
        this.config = {
            repositoryUrl: config.repositoryUrl || 'https://repo.traxxion.tech',
            cachePath: config.cachePath || '/var/cache/traxx-store',
            installPath: config.installPath || '/usr/share/traxx-apps',
            packageFormat: config.packageFormat || 'deb',
            ...config
        };
        
        this.installedApps = [];
        this.availableApps = [];
        this.categories = [];
        
        // Event handlers
        this.onInstallProgress = null;
        this.onInstallComplete = null;
        this.onError = null;
    }

    async initialize() {
        console.log('[Traxx Store] Initializing...');
        
        // Create necessary directories
        await this.ensureDirectories();
        
        // Load installed apps
        await this.loadInstalledApps();
        
        // Fetch available apps
        await this.fetchAvailableApps();
        
        console.log(`[Traxx Store] Ready - ${this.availableApps.length} apps available`);
        return true;
    }

    async ensureDirectories() {
        const dirs = [this.config.cachePath, this.config.installPath];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    async loadInstalledApps() {
        const installedPath = path.join(this.config.cachePath, 'installed.json');
        if (fs.existsSync(installedPath)) {
            this.installedApps = JSON.parse(fs.readFileSync(installedPath, 'utf-8'));
        }
        return this.installedApps;
    }

    async saveInstalledApps() {
        const installedPath = path.join(this.config.cachePath, 'installed.json');
        fs.writeFileSync(installedPath, JSON.stringify(this.installedApps, null, 2));
    }

    async fetchAvailableApps() {
        // Simulated app repository
        // In production, this would fetch from actual repository
        this.availableApps = [
            {
                id: 'vscode',
                name: 'Visual Studio Code',
                description: 'Code editing. Redefined. Free. Open source. Runs everywhere.',
                version: '1.85.0',
                category: 'development',
                icon: 'code',
                rating: 4.8,
                downloads: '10M+',
                size: '95 MB',
                package: 'code',
                screenshots: [],
                developer: 'Microsoft',
                website: 'https://code.visualstudio.com',
                installed: false
            },
            {
                id: 'spotify',
                name: 'Spotify',
                description: 'Stream music and podcasts with the world\'s most popular audio platform.',
                version: '1.2.31',
                category: 'multimedia',
                icon: 'spotify',
                rating: 4.6,
                downloads: '50M+',
                size: '120 MB',
                package: 'spotify-client',
                screenshots: [],
                developer: 'Spotify AB',
                website: 'https://spotify.com',
                installed: false
            },
            {
                id: 'slack',
                name: 'Slack',
                description: 'Team communication for the 21st century.',
                version: '4.35.130',
                category: 'communication',
                icon: 'slack',
                rating: 4.4,
                downloads: '10M+',
                size: '85 MB',
                package: 'slack-desktop',
                screenshots: [],
                developer: 'Slack Technologies',
                website: 'https://slack.com',
                installed: false
            },
            {
                id: 'discord',
                name: 'Discord',
                description: 'Your place to talk. Join a community of millions.',
                version: '0.0.352',
                category: 'communication',
                icon: 'discord',
                rating: 4.7,
                downloads: '100M+',
                size: '92 MB',
                package: 'discord',
                screenshots: [],
                developer: 'Discord Inc.',
                website: 'https://discord.com',
                installed: false
            },
            {
                id: 'figma',
                name: 'Figma',
                description: 'The collaborative interface design tool.',
                version: '116.15.5',
                category: 'design',
                icon: 'figma',
                rating: 4.8,
                downloads: '5M+',
                size: '78 MB',
                package: 'figma-linux',
                screenshots: [],
                developer: 'Figma, Inc',
                website: 'https://figma.com',
                installed: false
            },
            {
                id: 'vlc',
                name: 'VLC Media Player',
                description: 'Free, open-source, portable media player.',
                version: '3.0.20',
                category: 'multimedia',
                icon: 'vlc',
                rating: 4.7,
                downloads: '100M+',
                size: '45 MB',
                package: 'vlc',
                screenshots: [],
                developer: 'VideoLAN',
                website: 'https://videolan.org',
                installed: true
            },
            {
                id: 'blender',
                name: 'Blender',
                description: 'Free and open source 3D creation suite.',
                version: '4.0',
                category: 'design',
                icon: 'blender',
                rating: 4.9,
                downloads: '10M+',
                size: '350 MB',
                package: 'blender',
                screenshots: [],
                developer: 'Blender Foundation',
                website: 'https://blender.org',
                installed: false
            },
            {
                id: 'gimp',
                name: 'GIMP',
                description: 'Free and open source image editor.',
                version: '2.10.36',
                category: 'design',
                icon: 'gimp',
                rating: 4.5,
                downloads: '50M+',
                size: '200 MB',
                package: 'gimp',
                screenshots: [],
                developer: 'GIMP Team',
                website: 'https://gimp.org',
                installed: false
            },
            {
                id: 'docker',
                name: 'Docker Desktop',
                description: 'Containerized application development platform.',
                version: '4.26.0',
                category: 'development',
                icon: 'docker',
                rating: 4.6,
                downloads: '10M+',
                size: '500 MB',
                package: 'docker-desktop',
                screenshots: [],
                developer: 'Docker Inc.',
                website: 'https://docker.com',
                installed: false
            },
            {
                id: 'postman',
                name: 'Postman',
                description: 'API platform for building and using APIs.',
                version: '10.21',
                category: 'development',
                icon: 'postman',
                rating: 4.7,
                downloads: '20M+',
                size: '130 MB',
                package: 'postman',
                screenshots: [],
                developer: 'Postman Inc.',
                website: 'https://postman.com',
                installed: false
            },
            {
                id: 'obs',
                name: 'OBS Studio',
                description: 'Free and open source software for video recording and live streaming.',
                version: '30.0',
                category: 'multimedia',
                icon: 'obs',
                rating: 4.8,
                downloads: '20M+',
                size: '180 MB',
                package: 'obs-studio',
                screenshots: [],
                developer: 'OBS Project',
                website: 'https://obsproject.com',
                installed: false
            },
            {
                id: 'libreoffice',
                name: 'LibreOffice',
                description: 'Free and open source office suite.',
                version: '7.6.4',
                category: 'productivity',
                icon: 'libreoffice',
                rating: 4.5,
                downloads: '100M+',
                size: '300 MB',
                package: 'libreoffice',
                screenshots: [],
                developer: 'The Document Foundation',
                website: 'https://libreoffice.org',
                installed: true
            },
            {
                id: 'thunderbird',
                name: 'Thunderbird',
                description: 'Free and open source email client.',
                version: '115.5',
                category: 'productivity',
                icon: 'thunderbird',
                rating: 4.5,
                downloads: '50M+',
                size: '75 MB',
                package: 'thunderbird',
                screenshots: [],
                developer: 'Mozilla Foundation',
                website: 'https://thunderbird.net',
                installed: false
            },
            {
                id: 'zoom',
                name: 'Zoom',
                description: 'Video conferencing and web conferencing service.',
                version: '5.17.5',
                category: 'communication',
                icon: 'zoom',
                rating: 4.3,
                downloads: '100M+',
                size: '95 MB',
                package: 'zoom',
                screenshots: [],
                developer: 'Zoom Video Communications',
                website: 'https://zoom.us',
                installed: false
            },
            {
                id: 'notion',
                name: 'Notion',
                description: 'All-in-one workspace for notes, docs, wikis, and project management.',
                version: '2.2.1',
                category: 'productivity',
                icon: 'notion',
                rating: 4.7,
                downloads: '10M+',
                size: '85 MB',
                package: 'notion-app',
                screenshots: [],
                developer: 'Notion Labs',
                website: 'https://notion.so',
                installed: false
            }
        ];

        // Update installed status
        this.availableApps = this.availableApps.map(app => ({
            ...app,
            installed: this.installedApps.some(installed => installed.id === app.id)
        }));

        // Set categories
        this.categories = [
            { id: 'all', name: 'All Apps', icon: 'th-large', count: this.availableApps.length },
            { id: 'development', name: 'Development', icon: 'code', count: this.availableApps.filter(a => a.category === 'development').length },
            { id: 'productivity', name: 'Productivity', icon: 'briefcase', count: this.availableApps.filter(a => a.category === 'productivity').length },
            { id: 'communication', name: 'Communication', icon: 'comments', count: this.availableApps.filter(a => a.category === 'communication').length },
            { id: 'multimedia', name: 'Multimedia', icon: 'photo-video', count: this.availableApps.filter(a => a.category === 'multimedia').length },
            { id: 'design', name: 'Design', icon: 'palette', count: this.availableApps.filter(a => a.category === 'design').length },
            { id: 'games', name: 'Games', icon: 'gamepad', count: 0 },
            { id: 'utilities', name: 'Utilities', icon: 'tools', count: 0 }
        ];

        return this.availableApps;
    }

    getCategories() {
        return this.categories;
    }

    getAppsByCategory(category) {
        if (category === 'all') {
            return this.availableApps;
        }
        return this.availableApps.filter(app => app.category === category);
    }

    searchApps(query) {
        const lowerQuery = query.toLowerCase();
        return this.availableApps.filter(app => 
            app.name.toLowerCase().includes(lowerQuery) ||
            app.description.toLowerCase().includes(lowerQuery) ||
            app.category.toLowerCase().includes(lowerQuery)
        );
    }

    async installApp(appId, options = {}) {
        const app = this.availableApps.find(a => a.id === appId);
        if (!app) {
            throw new Error(`Application not found: ${appId}`);
        }

        if (app.installed) {
            return { success: false, message: 'Application already installed' };
        }

        console.log(`[Traxx Store] Installing ${app.name}...`);

        // Simulate installation progress
        const stages = [
            { progress: 10, status: 'Downloading package...' },
            { progress: 30, status: 'Verifying package integrity...' },
            { progress: 50, status: 'Extracting files...' },
            { progress: 70, status: 'Installing dependencies...' },
            { progress: 90, status: 'Configuring application...' },
            { progress: 100, status: 'Installation complete!' }
        ];

        for (const stage of stages) {
            if (this.onInstallProgress) {
                this.onInstallProgress(appId, stage.progress, stage.status);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update app status
        app.installed = true;
        app.installDate = new Date().toISOString();
        
        // Add to installed list
        this.installedApps.push({
            id: app.id,
            name: app.name,
            version: app.version,
            installDate: app.installDate
        });
        
        await this.saveInstalledApps();

        if (this.onInstallComplete) {
            this.onInstallComplete(appId, true);
        }

        return {
            success: true,
            message: `${app.name} installed successfully!`,
            app: app
        };
    }

    async uninstallApp(appId) {
        const app = this.availableApps.find(a => a.id === appId);
        if (!app) {
            throw new Error(`Application not found: ${appId}`);
        }

        if (!app.installed) {
            return { success: false, message: 'Application not installed' };
        }

        console.log(`[Traxx Store] Uninstalling ${app.name}...`);

        // Simulate uninstallation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update app status
        app.installed = false;
        delete app.installDate;
        
        // Remove from installed list
        this.installedApps = this.installedApps.filter(a => a.id !== appId);
        await this.saveInstalledApps();

        return {
            success: true,
            message: `${app.name} uninstalled successfully!`,
            app: app
        };
    }

    async updateApp(appId) {
        const app = this.availableApps.find(a => a.id === appId);
        if (!app) {
            throw new Error(`Application not found: ${appId}`);
        }

        console.log(`[Traxx Store] Updating ${app.name}...`);

        // Simulate update
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            message: `${app.name} updated successfully!`,
            app: app
        };
    }

    async checkForUpdates() {
        // In production, this would check the repository for updates
        const updates = this.installedApps.map(app => ({
            ...app,
            updateAvailable: Math.random() > 0.7 // Simulate some apps having updates
        })).filter(app => app.updateAvailable);

        return updates;
    }

    getInstalledApps() {
        return this.availableApps.filter(app => app.installed);
    }

    getAppDetails(appId) {
        return this.availableApps.find(app => app.id === appId);
    }
}

// API Server for Traxx Store
class TraxxStoreAPI {
    constructor(store, port = 3001) {
        this.store = store;
        this.port = port;
        this.server = null;
    }

    start() {
        const http = require('http');
        
        this.server = http.createServer(async (req, res) => {
            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            const url = new URL(req.url, `http://localhost:${this.port}`);
            const path = url.pathname;

            try {
                if (path === '/api/apps') {
                    const category = url.searchParams.get('category') || 'all';
                    const apps = this.store.getAppsByCategory(category);
                    res.end(JSON.stringify({ success: true, apps }));
                }
                else if (path === '/api/categories') {
                    const categories = this.store.getCategories();
                    res.end(JSON.stringify({ success: true, categories }));
                }
                else if (path === '/api/search') {
                    const query = url.searchParams.get('q') || '';
                    const results = this.store.searchApps(query);
                    res.end(JSON.stringify({ success: true, results }));
                }
                else if (path === '/api/app/') {
                    const appId = url.searchParams.get('id');
                    const app = this.store.getAppDetails(appId);
                    res.end(JSON.stringify({ success: true, app }));
                }
                else if (path === '/api/install' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', async () => {
                        const { appId } = JSON.parse(body);
                        const result = await this.store.installApp(appId);
                        res.end(JSON.stringify(result));
                    });
                }
                else if (path === '/api/uninstall' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', async () => {
                        const { appId } = JSON.parse(body);
                        const result = await this.store.uninstallApp(appId);
                        res.end(JSON.stringify(result));
                    });
                }
                else if (path === '/api/installed') {
                    const installed = this.store.getInstalledApps();
                    res.end(JSON.stringify({ success: true, installed }));
                }
                else if (path === '/api/updates') {
                    const updates = await this.store.checkForUpdates();
                    res.end(JSON.stringify({ success: true, updates }));
                }
                else {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ success: false, error: 'Not found' }));
                }
            } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });

        this.server.listen(this.port, () => {
            console.log(`[Traxx Store API] Running on port ${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = { TraxxStore, TraxxStoreAPI };
}