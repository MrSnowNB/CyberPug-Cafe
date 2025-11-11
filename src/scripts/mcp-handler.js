/**
 * MCP Tool-Calling Handler for CyberPug-Cafe Chatbot
 * Manages plan/act modes and task serialization for Cline MCP integration
 */

class MCPHandler {
    constructor() {
        this.currentMode = 'plan'; // 'plan' or 'act'
        this.taskCounter = 0;
        this.pendingTasks = new Map();
        this.mcpEndpoint = 'http://localhost:3000'; // Default Cline MCP endpoint

        // Server status tracking
        this.serverStatus = 'unknown'; // 'unknown', 'connected', 'disconnected', 'checking'
        this.lastStatusCheck = 0;
        this.statusCheckInterval = 30000; // Check every 30 seconds

        // UI elements
        this.modeToggle = null;
        this.currentModeDisplay = null;
        this.serverStatusIndicator = null;

        console.log('MCP Handler initialized');
    }

    /**
     * Initialize MCP handler and UI elements
     */
    async initialize() {
        // Get UI elements
        this.modeToggle = document.getElementById('mcp-mode-toggle');
        this.currentModeDisplay = document.getElementById('current-mode');
        this.serverStatusIndicator = document.getElementById('mcp-server-status');

        if (this.modeToggle) {
            this.modeToggle.addEventListener('change', (e) => {
                this.setMode(e.target.checked ? 'act' : 'plan');
            });
        }

        // Set initial mode display
        this.updateModeDisplay();

        // Start server status monitoring
        this.startServerMonitoring();

        // Initial server status check
        await this.checkServerStatus();

        console.log('MCP Handler ready - Mode:', this.currentMode);
    }

    /**
     * Set the current mode (plan/act)
     * @param {string} mode - 'plan' or 'act'
     */
    setMode(mode) {
        if (mode !== 'plan' && mode !== 'act') {
            console.warn('Invalid mode:', mode);
            return;
        }

        this.currentMode = mode;
        this.updateModeDisplay();

        console.log(`MCP Mode changed to: ${mode.toUpperCase()}`);

        // Log mode change for auditability
        this.logAction('mode_change', { from: this.currentMode === 'plan' ? 'act' : 'plan', to: mode });
    }

    /**
     * Update the UI to reflect current mode
     */
    updateModeDisplay() {
        if (this.currentModeDisplay) {
            this.currentModeDisplay.textContent = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
            this.currentModeDisplay.style.color = this.currentMode === 'act' ? '#ff0080' : '#00ff44';
        }
    }

    /**
     * Process a user message for potential MCP task creation
     * @param {string} message - User message
     * @param {Object} context - Additional context (sentiment, etc.)
     * @returns {Object|null} MCP task if created, null otherwise
     */
    processMessageForMCP(message, context = {}) {
        // Check if message contains actionable coding requests
        if (this.isActionableCodingRequest(message)) {
            const task = this.createMCPTask(message, context);

            if (this.currentMode === 'plan') {
                // In plan mode, just draft and show preview
                console.log('📋 PLAN MODE: Task drafted (not sent)', task);
                this.showTaskPreview(task);
                return null; // Don't execute
            } else {
                // In act mode, serialize and send to Cline
                console.log('🚀 ACT MODE: Sending task to Cline MCP');
                this.sendTaskToMCP(task);
                return task;
            }
        }

        return null;
    }

    /**
     * Determine if a message contains actionable coding requests
     * @param {string} message - User message
     * @returns {boolean} True if actionable
     */
    isActionableCodingRequest(message) {
        const lowerMessage = message.toLowerCase();

        // Keywords that indicate coding/programming tasks
        const codingKeywords = [
            'update', 'change', 'modify', 'fix', 'add', 'remove', 'create', 'implement',
            'refactor', 'optimize', 'debug', 'test', 'build', 'deploy', 'configure',
            'function', 'class', 'method', 'variable', 'file', 'code', 'script',
            'json', 'css', 'html', 'javascript', 'python', 'api', 'database'
        ];

        // File extensions that indicate coding context
        const fileExtensions = ['.js', '.py', '.json', '.css', '.html', '.md', '.txt'];

        // Check for coding keywords
        const hasCodingKeyword = codingKeywords.some(keyword => lowerMessage.includes(keyword));

        // Check for file references
        const hasFileReference = fileExtensions.some(ext => lowerMessage.includes(ext)) ||
            lowerMessage.includes('file') || lowerMessage.includes('config');

        // Check for imperative language
        const imperativePatterns = [
            /^please/, /^can you/, /^i need/, /^help me/, /^make/, /^do/,
            /update.*to/, /change.*to/, /add.*to/, /fix.*in/
        ];
        const hasImperative = imperativePatterns.some(pattern => pattern.test(lowerMessage));

        return hasCodingKeyword || hasFileReference || hasImperative;
    }

    /**
     * Create an MCP task from user message
     * @param {string} message - User message
     * @param {Object} context - Additional context
     * @returns {Object} MCP task object
     */
    createMCPTask(message, context = {}) {
        this.taskCounter++;

        const task = {
            id: `task_${Date.now()}_${this.taskCounter}`,
            timestamp: new Date().toISOString(),
            mode: this.currentMode,
            user_message: message,
            context: context,
            task: this.extractTaskDescription(message),
            expected_outcome: this.inferExpectedOutcome(message),
            validation_gates: ['unit', 'lint', 'type', 'docs'],
            files_affected: this.extractFileReferences(message),
            priority: this.assessPriority(message),
            complexity: this.assessComplexity(message)
        };

        return task;
    }

    /**
     * Extract task description from user message
     * @param {string} message - User message
     * @returns {string} Task description
     */
    extractTaskDescription(message) {
        // Clean up the message to extract the core task
        let description = message
            .replace(/^please\s+/i, '')
            .replace(/^can you\s+/i, '')
            .replace(/^i need\s+/i, '')
            .replace(/^help me\s+/i, '')
            .replace(/^make\s+/i, '')
            .replace(/^do\s+/i, '')
            .trim();

        // Capitalize first letter
        if (description.length > 0) {
            description = description.charAt(0).toUpperCase() + description.slice(1);
        }

        return description;
    }

    /**
     * Infer expected outcome from message
     * @param {string} message - User message
     * @returns {string} Expected outcome
     */
    inferExpectedOutcome(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) {
            return 'Bug fixed and functionality restored';
        }
        if (lowerMessage.includes('add') || lowerMessage.includes('implement')) {
            return 'New feature implemented and working';
        }
        if (lowerMessage.includes('update') || lowerMessage.includes('change')) {
            return 'Code updated with requested changes';
        }
        if (lowerMessage.includes('create') || lowerMessage.includes('build')) {
            return 'New component/file created successfully';
        }

        return 'Task completed successfully';
    }

    /**
     * Extract file references from message
     * @param {string} message - User message
     * @returns {string[]} Array of file references
     */
    extractFileReferences(message) {
        const files = [];
        const filePatterns = [
            /\b[a-zA-Z0-9_\/]+\.(js|py|json|css|html|md|txt)\b/g,
            /\b(src|config|scripts|styles)\/[a-zA-Z0-9_\/]+\b/g
        ];

        filePatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                files.push(...matches);
            }
        });

        return [...new Set(files)]; // Remove duplicates
    }

    /**
     * Assess task priority
     * @param {string} message - User message
     * @returns {string} Priority level
     */
    assessPriority(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('urgent') || lowerMessage.includes('critical') || lowerMessage.includes('bug')) {
            return 'high';
        }
        if (lowerMessage.includes('important') || lowerMessage.includes('fix')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Assess task complexity
     * @param {string} message - User message
     * @returns {string} Complexity level
     */
    assessComplexity(message) {
        const lowerMessage = message.toLowerCase();
        const wordCount = message.split(' ').length;

        if (wordCount > 50 || lowerMessage.includes('complex') || lowerMessage.includes('multiple')) {
            return 'high';
        }
        if (wordCount > 20 || lowerMessage.includes('several') || lowerMessage.includes('few')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Show task preview in plan mode
     * @param {Object} task - MCP task object
     */
    showTaskPreview(task) {
        const preview = `
📋 **PLAN MODE PREVIEW**
Task: ${task.task}
Expected: ${task.expected_outcome}
Files: ${task.files_affected.join(', ') || 'None detected'}
Priority: ${task.priority} | Complexity: ${task.complexity}

⚠️  This task will NOT be executed. Switch to ACT MODE to send to Cline.
        `.trim();

        console.log(preview);

        // Could also show in UI if desired
        // this.showNotification(preview, 'plan');
    }

    /**
     * Serialize and send task to Cline MCP
     * @param {Object} task - MCP task object
     */
    async sendTaskToMCP(task) {
        try {
            // Create YAML frontmatter format
            const yamlContent = this.serializeTaskToYAML(task);

            // Save to file for traceability
            const filename = `mcp_task_${task.id}.md`;
            this.saveTaskToFile(filename, yamlContent);

            // Send to Cline MCP endpoint
            const response = await fetch(`${this.mcpEndpoint}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task: yamlContent,
                    source: 'cyberpug-cafe',
                    mode: 'act'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ MCP Task sent successfully:', result);
                this.logAction('task_sent', { taskId: task.id, result: result });
                return result;
            } else {
                throw new Error(`MCP server error: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Failed to send MCP task:', error);
            this.logAction('task_failed', { taskId: task.id, error: error.message });

            // Show error to user
            this.showError(`Failed to send task to Cline: ${error.message}`);
        }
    }

    /**
     * Serialize task to YAML frontmatter format
     * @param {Object} task - MCP task object
     * @returns {string} YAML frontmatter content
     */
    serializeTaskToYAML(task) {
        const frontmatter = [
            '---',
            `task: "${task.task}"`,
            `context: "${task.context || 'General coding task'}"`,
            `expected_outcome: "${task.expected_outcome}"`,
            `validation_gates: [${task.validation_gates.map(g => `"${g}"`).join(', ')}]`,
            `files_affected: [${task.files_affected.map(f => `"${f}"`).join(', ')}]`,
            `priority: "${task.priority}"`,
            `complexity: "${task.complexity}"`,
            `timestamp: "${task.timestamp}"`,
            `source: "cyberpug-cafe-mcp"`,
            '---',
            '',
            `**User Request:** ${task.user_message}`,
            '',
            `**Auto-Analysis:**`,
            `- Priority: ${task.priority}`,
            `- Complexity: ${task.complexity}`,
            `- Files: ${task.files_affected.join(', ') || 'None detected'}`,
            '',
            `**Validation Gates:** ${task.validation_gates.join(', ')}`
        ].join('\n');

        return frontmatter;
    }

    /**
     * Save task to file for traceability
     * @param {string} filename - Filename to save
     * @param {string} content - File content
     */
    saveTaskToFile(filename, content) {
        try {
            // Create blob and download (client-side)
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
            console.log(`💾 Task saved as: ${filename}`);
        } catch (error) {
            console.warn('Could not save task file:', error);
        }
    }

    /**
     * Log action for auditability
     * @param {string} action - Action type
     * @param {Object} details - Action details
     */
    logAction(action, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            mode: this.currentMode,
            details: details
        };

        console.log('📊 MCP Log:', logEntry);

        // Could send to logging service
        // this.sendLogToService(logEntry);
    }

    /**
     * Start periodic server status monitoring
     */
    startServerMonitoring() {
        // Check server status every 30 seconds
        setInterval(async () => {
            await this.checkServerStatus();
        }, this.statusCheckInterval);
    }

    /**
     * Check if MCP server is reachable
     * @returns {Promise<boolean>} True if server is connected
     */
    async checkServerStatus() {
        const now = Date.now();
        if (now - this.lastStatusCheck < 5000) {
            // Don't check more than once every 5 seconds
            return this.serverStatus === 'connected';
        }

        this.lastStatusCheck = now;
        this.serverStatus = 'checking';
        this.updateServerStatusUI();

        try {
            console.log('🔍 Checking MCP server status...');

            const response = await fetch(`${this.mcpEndpoint}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' || data.healthy === true) {
                    this.serverStatus = 'connected';
                    console.log('✅ MCP server connected');
                    return true;
                }
            }

            throw new Error('Server responded but not healthy');

        } catch (error) {
            this.serverStatus = 'disconnected';
            console.log('❌ MCP server not available:', error.message);
            return false;
        } finally {
            this.updateServerStatusUI();
        }
    }

    /**
     * Update server status in UI
     */
    updateServerStatusUI() {
        if (!this.serverStatusIndicator) return;

        const statusConfig = {
            connected: { text: '🟢 Connected', color: '#00ff44' },
            disconnected: { text: '🔴 Disconnected', color: '#ff0040' },
            checking: { text: '🟡 Checking...', color: '#ffff00' },
            unknown: { text: '⚪ Unknown', color: '#666666' }
        };

        const config = statusConfig[this.serverStatus] || statusConfig.unknown;
        this.serverStatusIndicator.textContent = config.text;
        this.serverStatusIndicator.style.color = config.color;
    }

    /**
     * Get server status description for user messaging
     * @returns {string} Human-readable status description
     */
    getServerStatusDescription() {
        switch (this.serverStatus) {
            case 'connected':
                return 'MCP server is connected and ready for tool execution.';
            case 'disconnected':
                return 'MCP server is not available. Tasks will be saved locally for manual processing.';
            case 'checking':
                return 'Checking MCP server connection...';
            default:
                return 'MCP server status unknown. Tasks will be saved locally.';
        }
    }

    /**
     * Enhanced task preview with server status
     * @param {Object} task - MCP task object
     */
    showTaskPreview(task) {
        const serverStatus = this.getServerStatusDescription();
        const preview = `
📋 **PLAN MODE PREVIEW**
Task: ${task.task}
Expected: ${task.expected_outcome}
Files: ${task.files_affected.join(', ') || 'None detected'}
Priority: ${task.priority} | Complexity: ${task.complexity}

🔗 **Server Status:** ${serverStatus}

⚠️  This task will NOT be executed. Switch to ACT MODE to send to Cline.
        `.trim();

        console.log(preview);
    }

    /**
     * Enhanced ACT mode messaging with server status
     * @param {Object} task - MCP task object
     * @returns {string} User-friendly message
     */
    getActModeMessage(task) {
        if (this.serverStatus === 'connected') {
            return `🚀 **ACT MODE**: Task sent to Cline MCP for execution.`;
        } else {
            return `💾 **ACT MODE**: MCP server not available. Task saved locally as "${task.id}.md" for manual processing.`;
        }
    }

    /**
     * Show error notification with server status context
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('❌ MCP Error:', message);

        const serverStatus = this.getServerStatusDescription();
        const fullMessage = `${message}\n\nServer Status: ${serverStatus}`;

        // Could show UI notification here
        console.error('Full context:', fullMessage);
    }

    /**
     * Get current MCP status including server connectivity
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            mode: this.currentMode,
            endpoint: this.mcpEndpoint,
            serverStatus: this.serverStatus,
            serverDescription: this.getServerStatusDescription(),
            pendingTasks: this.pendingTasks.size,
            taskCounter: this.taskCounter,
            lastStatusCheck: new Date(this.lastStatusCheck).toISOString()
        };
    }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MCPHandler;
} else if (typeof window !== 'undefined') {
    window.MCPHandler = MCPHandler;
}
