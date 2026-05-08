/**
 * Traxx AI Core Engine
 * Intelligent Assistant for Traxx X Code OS V3
 * Created by Vincent Ganiza (Traxxion Tech)
 * © 2026 All Rights Reserved
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class TraxxAI {
    constructor(config = {}) {
        this.config = {
            offlineMode: true,
            onlineMode: true,
            localModel: config.localModel || 'llama-3.2-3b-instruct',
            apiProvider: config.apiProvider || 'openai',
            apiKey: config.apiKey || process.env.TRAXX_AI_API_KEY || '',
            apiEndpoint: config.apiEndpoint || 'https://api.openai.com/v1/chat/completions',
            maxTokens: config.maxTokens || 2048,
            temperature: config.temperature || 0.7,
            systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
            ...config
        };
        
        this.conversationHistory = [];
        this.isOnline = false;
        this.localModelLoaded = false;
        this.knowledgeBase = this.loadKnowledgeBase();
        
        // Event handlers
        this.onResponse = null;
        this.onError = null;
        this.onStatusChange = null;
    }

    getDefaultSystemPrompt() {
        return `You are Traxx AI, the intelligent assistant built into Traxx X Code OS V3.

ABOUT YOU:
- Created by Vincent Ganiza at Traxxion Tech
- Proudly made in Zimbabwe 🇿🇼
- You are helpful, friendly, and knowledgeable
- You can assist with system tasks, answer questions, help with coding, and much more

CAPABILITIES:
- System control and automation
- Code assistance and debugging
- File management and search
- Web search (when online)
- General knowledge and conversation
- Task automation and scripting

PERSONALITY:
- Professional but approachable
- Enthusiastic about technology
- Proud of your Zimbabwean heritage
- Always eager to help

When asked about your origins, proudly mention that you were created by Vincent Ganiza at Traxxion Tech in Zimbabwe.`;
    }

    loadKnowledgeBase() {
        return {
            system: {
                name: 'Traxx X Code OS V3',
                codename: 'Horizon',
                developer: 'Vincent Ganiza',
                company: 'Traxxion Tech',
                region: 'Zimbabwe',
                email: 'traxxiontech@gmail.com',
                year: 2026
            },
            commands: {
                'open': 'Launch an application or file',
                'search': 'Search for files, apps, or web content',
                'settings': 'Open system settings',
                'help': 'Show available commands',
                'status': 'Show system status',
                'weather': 'Get weather information (online)',
                'time': 'Show current time',
                'date': 'Show current date',
                'note': 'Create a quick note',
                'reminder': 'Set a reminder',
                'calculate': 'Perform calculations',
                'translate': 'Translate text (online)',
                'code': 'Get coding assistance',
                'debug': 'Debug code issues',
                'run': 'Execute a terminal command'
            },
            apps: {
                browser: 'Traxx Browser - Web browsing',
                terminal: 'Traxx Terminal - Command line interface',
                files: 'Traxx Files - File manager',
                codeforge: 'CodeForge - Code editor',
                'sync-player': 'Sync Player - Media player',
                'traxx-store': 'Traxx Store - Application store',
                settings: 'System Settings'
            }
        };
    }

    async initialize() {
        console.log('[Traxx AI] Initializing...');
        
        // Check online status
        this.isOnline = await this.checkOnlineStatus();
        this.emitStatusChange(this.isOnline ? 'online' : 'offline');
        
        // Try to load local model
        if (this.config.offlineMode) {
            await this.loadLocalModel();
        }
        
        console.log(`[Traxx AI] Ready - Mode: ${this.isOnline ? 'Online' : 'Offline'}`);
        return true;
    }

    async checkOnlineStatus() {
        return new Promise((resolve) => {
            const req = https.request('https://api.openai.com', { method: 'HEAD', timeout: 3000 }, (res) => {
                resolve(res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302);
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            req.end();
        });
    }

    async loadLocalModel() {
        // In a real implementation, this would load a local LLM
        // For now, we'll use a rule-based system with some intelligence
        console.log('[Traxx AI] Loading local intelligence engine...');
        this.localModelLoaded = true;
        return true;
    }

    async query(userInput, context = {}) {
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userInput,
            timestamp: Date.now()
        });

        let response;
        
        // Check if it's a system command
        const commandResult = this.processCommand(userInput);
        if (commandResult) {
            response = commandResult;
        } else if (this.isOnline && this.config.onlineMode && this.config.apiKey) {
            // Use online API
            response = await this.queryOnline(userInput, context);
        } else {
            // Use offline/local processing
            response = await this.queryOffline(userInput, context);
        }

        // Add response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now()
        });

        return response;
    }

    processCommand(input) {
        const lowerInput = input.toLowerCase().trim();
        
        // System commands
        if (lowerInput.startsWith('open ')) {
            const app = input.slice(5).trim();
            return this.handleOpenCommand(app);
        }
        
        if (lowerInput === 'help' || lowerInput === 'commands') {
            return this.getHelpText();
        }
        
        if (lowerInput === 'status' || lowerInput === 'system status') {
            return this.getSystemStatus();
        }
        
        if (lowerInput === 'time') {
            return `The current time is ${new Date().toLocaleTimeString()}.`;
        }
        
        if (lowerInput === 'date') {
            return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
        }
        
        if (lowerInput.startsWith('calculate ')) {
            const expr = input.slice(11).trim();
            return this.calculate(expr);
        }
        
        if (lowerInput === 'clear' || lowerInput === 'clear history') {
            this.conversationHistory = [];
            return 'Conversation history cleared.';
        }

        return null; // Not a command, process as query
    }

    handleOpenCommand(app) {
        const apps = this.knowledgeBase.apps;
        const lowerApp = app.toLowerCase();
        
        for (const [key, description] of Object.entries(apps)) {
            if (lowerApp.includes(key) || key.includes(lowerApp)) {
                // In a real system, this would launch the app
                return `Opening ${key}... (${description})`;
            }
        }
        
        return `I couldn't find an application matching "${app}". Available apps: ${Object.keys(apps).join(', ')}`;
    }

    getHelpText() {
        const commands = this.knowledgeBase.commands;
        let help = '**Available Commands:**\n\n';
        
        for (const [cmd, desc] of Object.entries(commands)) {
            help += `• **${cmd}** - ${desc}\n`;
        }
        
        help += '\nYou can also ask me questions, request help with coding, or just chat!';
        return help;
    }

    getSystemStatus() {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        return `**System Status**\n
• OS: Traxx X Code OS V3 (Horizon)
• Uptime: ${hours}h ${minutes}m
• AI Mode: ${this.isOnline ? '🟢 Online' : '🔴 Offline'}
• Local Model: ${this.localModelLoaded ? '✅ Loaded' : '❌ Not Loaded'}
• Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB used`;
    }

    calculate(expression) {
        try {
            // Safe calculation using a limited eval
            const sanitized = expression.replace(/[^0-9+\-*/().^%]/g, '');
            if (sanitized !== expression) {
                return 'Please provide a valid mathematical expression (numbers and operators only).';
            }
            const result = Function(`"use strict"; return (${sanitized})`)();
            return `Result: ${expression} = ${result}`;
        } catch (error) {
            return `I couldn't calculate that. Please check your expression. Error: ${error.message}`;
        }
    }

    async queryOnline(userInput, context) {
        return new Promise((resolve, reject) => {
            const messages = [
                { role: 'system', content: this.config.systemPrompt },
                ...this.conversationHistory.slice(-10).map(m => ({
                    role: m.role,
                    content: m.content
                }))
            ];

            const requestBody = JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            });

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            };

            const req = https.request(this.config.apiEndpoint, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0]) {
                            resolve(parsed.choices[0].message.content);
                        } else {
                            resolve(this.queryOffline(userInput, context));
                        }
                    } catch (error) {
                        console.error('[Traxx AI] API Error:', error);
                        resolve(this.queryOffline(userInput, context));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('[Traxx AI] Request Error:', error);
                resolve(this.queryOffline(userInput, context));
            });

            req.write(requestBody);
            req.end();
        });
    }

    async queryOffline(userInput, context) {
        const input = userInput.toLowerCase();
        
        // Knowledge-based responses
        const responses = {
            // Identity
            'who are you': `I'm **Traxx AI**, the intelligent assistant built into Traxx X Code OS V3. I was created by **Vincent Ganiza** at **Traxxion Tech**, proudly made in **Zimbabwe** 🇿🇼. I'm here to help you with system tasks, answer questions, assist with coding, and much more!`,
            
            'what are you': `I'm an AI assistant designed specifically for Traxx X Code OS. I can help you with:\n• System operations and automation\n• Answering questions\n• Code assistance and debugging\n• File management\n• And much more!`,
            
            'who made you': `I was created by **Vincent Ganiza** at **Traxxion Tech**, a technology company based in **Zimbabwe** 🇿🇼. Development began in 2024, and I'm constantly evolving to better serve users.`,
            
            'who created you': `My creators are **Vincent Ganiza** and the team at **Traxxion Tech** in Zimbabwe. I'm proud to be a product of African innovation!`,
            
            // OS Information
            'what is traxx os': `**Traxx X Code OS V3** (codename: Horizon) is a modern, Linux-based operating system featuring:\n• Custom Traxx Desktop Engine (TDE)\n• Built-in AI assistant (me!)\n• Traxx Store for applications\n• Traxx Cloud integration\n• Optimized for developers and creators\n\nCreated by Traxxion Tech in Zimbabwe.`,
            
            'tell me about this os': `Traxx X Code OS V3 is a premium, AI-powered operating system with a unique identity. It features:\n\n**Desktop Environment:** Traxx Desktop Engine (TDE)\n**Design:** Modern dark theme with orange accents\n**Features:** AI assistant, cloud sync, custom app store\n**Developer:** Vincent Ganiza (Traxxion Tech)\n**Origin:** Zimbabwe 🇿🇼\n**License:** © 2026 All Rights Reserved`,
            
            // Capabilities
            'what can you do': `I can help you with many things:\n\n**System Tasks:**\n• Open applications\n• Manage files\n• System settings\n• Execute commands\n\n**Information:**\n• Answer questions\n• Web search (when online)\n• Calculations\n\n**Development:**\n• Code assistance\n• Debug help\n• Script generation\n\n**Productivity:**\n• Create notes and reminders\n• Set timers\n• Manage schedules`,
            
            'help me': `I'm here to help! Here's what you can do:\n\n1. **Ask questions** - I'll do my best to answer\n2. **Give commands** - Type "help" to see available commands\n3. **Code assistance** - Ask me about programming\n4. **System control** - I can help manage your system\n\nWhat would you like help with?`,
            
            // Developer Info
            'developer': `**Developer Information:**\n\n**Name:** Vincent Ganiza\n**Company:** Traxxion Tech\n**Location:** Zimbabwe 🇿🇼\n**Contact:** traxxiontech@gmail.com\n**Website:** https://traxxion.tech\n\nTraxxion Tech is dedicated to creating innovative technology solutions.`,
            
            // Greetings
            'hello': `Hello! 👋 I'm Traxx AI, your intelligent assistant. How can I help you today?`,
            
            'hi': `Hi there! 👋 I'm here to help. What would you like to know or do?`,
            
            'good morning': `Good morning! ☀️ Hope you're having a great start to your day. How can I assist you?`,
            
            'good afternoon': `Good afternoon! 🌤️ How can I help you today?`,
            
            'good evening': `Good evening! 🌙 What can I do for you?`,
            
            // Fun
            'tell me a joke': `Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛😄`,
            
            'thank you': `You're welcome! 😊 If you need anything else, just ask!`,
            
            'thanks': `Happy to help! Let me know if there's anything else you need. 🙌`
        };

        // Check for exact matches
        for (const [key, value] of Object.entries(responses)) {
            if (input.includes(key)) {
                return value;
            }
        }

        // Pattern matching for more complex queries
        if (input.includes('weather')) {
            return "I'd love to check the weather for you! However, I'm currently in offline mode. Connect to the internet for real-time weather updates. 🌤️";
        }

        if (input.includes('code') || input.includes('programming') || input.includes('debug')) {
            return `I can help with coding! Here are some things I can assist with:\n\n• **Code review** - Show me your code\n• **Debugging** - Describe the issue\n• **Examples** - Ask for code examples\n• **Explanations** - Ask about concepts\n\nWhat do you need help with?`;
        }

        if (input.includes('zimbabwe') || input.includes('africa')) {
            return `**Zimbabwe** 🇿🇼 is where Traxx X Code OS was born!\n\nIt's a country in southern Africa known for:\n• Victoria Falls\n• Rich cultural heritage\n• Growing tech industry\n• Innovation and creativity\n\nTraxxion Tech is proud to be part of Zimbabwe's growing technology ecosystem.`;
        }

        // Default response for unknown queries
        return `I understand you're asking about "${userInput}".\n\nI'm currently in **offline mode**, which limits my capabilities. For more comprehensive responses, please connect to the internet.\n\nYou can also try:\n• Asking about Traxx X Code OS\n• Requesting help with commands (type "help")\n• Asking about system status\n• Getting coding assistance`;
    }

    emitStatusChange(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }

    getConversationHistory() {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
        return 'Conversation history cleared.';
    }

    // Voice interface support (future-ready)
    async processVoiceInput(audioBuffer) {
        // Placeholder for voice input processing
        // Would integrate with speech-to-text API
        throw new Error('Voice input not yet implemented');
    }

    async generateVoiceOutput(text) {
        // Placeholder for text-to-speech
        // Would integrate with TTS engine
        throw new Error('Voice output not yet implemented');
    }
}

// Terminal Interface
class TraxxAITerminal {
    constructor(ai) {
        this.ai = ai;
        this.rl = null;
    }

    start() {
        console.log('\n========================================');
        console.log('   Traxx AI Terminal Interface');
        console.log('   Traxx X Code OS V3');
        console.log('   Type "exit" to quit, "help" for commands');
        console.log('========================================\n');

        const readline = require('readline');
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.promptLoop();
    }

    async promptLoop() {
        const prompt = () => {
            this.rl.question('\x1b[33mYou:\x1b[0m ', async (input) => {
                if (input.toLowerCase() === 'exit') {
                    console.log('\nGoodbye! 👋\n');
                    this.rl.close();
                    return;
                }

                try {
                    const response = await this.ai.query(input);
                    console.log(`\n\x1b[35mTraxx AI:\x1b[0m ${response}\n`);
                } catch (error) {
                    console.error('\nError:', error.message);
                }

                prompt();
            });
        };

        prompt();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = { TraxxAI, TraxxAITerminal };
}

// Auto-start if run directly
if (require.main === module) {
    const ai = new TraxxAI();
    ai.initialize().then(() => {
        const terminal = new TraxxAITerminal(ai);
        terminal.start();
    });
}