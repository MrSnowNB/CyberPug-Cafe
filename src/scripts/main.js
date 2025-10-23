// Cyberpunk Pug Cafe Main Application

class CyberpunkPugCafe {
  constructor() {
    this.sentimentAnalyzer = null;
    this.videoController = null;
    this.chatHandler = null;
    this.initialized = false;

    console.log('🚀 Cyberpunk Pug Cafe Initializing...');
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('Initializing sentiment analyzer...');
      this.sentimentAnalyzer = new window.SentimentAnalyzer ?
        new window.SentimentAnalyzer() : new SentimentAnalyzer();

      console.log('Initializing video controller...');
      this.videoController = new window.VideoController ?
        new window.VideoController() : new VideoController();

      console.log('Initializing chat handler...');
      this.chatHandler = new window.ChatHandler ?
        new window.ChatHandler() : new ChatHandler();

      // Set dependencies
      this.chatHandler.setDependencies(this.sentimentAnalyzer, this.videoController);

      // Initialize video controller (loads emotion map and preloads videos)
      await this.videoController.initialize();

      // Wire up UI events
      this.setupUI();

      this.initialized = true;
      console.log('✅ Cyberpunk Pug Cafe Ready!');

      // Add welcome message
      setTimeout(() => {
        this.showWelcomeMessage();
      }, 1000);

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showError('Failed to initialize application: ' + error.message);
    }
  }

  /**
   * Setup UI event listeners
   */
  setupUI() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    if (!messageInput || !sendButton) {
      console.warn('UI elements not found');
      return;
    }

    // Send message on button click
    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Enable/disable send button based on input
    messageInput.addEventListener('input', () => {
      const hasText = messageInput.value.trim().length > 0;
      sendButton.disabled = !hasText;
      sendButton.textContent = hasText ? 'SEND' : 'SEND';
    });

    // Initial state
    sendButton.disabled = true;

    console.log('UI events wired up');
  }

  /**
   * Handle sending a message
   */
  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    if (!messageInput || !sendButton) return;

    const message = messageInput.value.trim();
    if (!message) return;

    // Clear input and disable temporarily
    messageInput.value = '';
    sendButton.disabled = true;
    sendButton.textContent = 'SENDING...';

    try {
      console.log('Sending message:', message);

      // Process message
      const response = await this.chatHandler.handleMessage(message);

      // Update UI with response
      this.chatHandler.updateUI(message, response.message);

      // Log performance
      if (response.timing) {
        const latencyMs = response.timing.total;
        const status = latencyMs < 2000 ? 'FAST' : 'SLOW';
        console.log(`Response time: ${latencyMs.toFixed(1)}ms (${status})`);

        if (!response.timing.acceptable) {
          console.warn('⚠️ Response latency exceeded 2s requirement');
        }
      }

      // Log sentiment for debugging
      console.log('Sentiment:', response.sentiment);

    } catch (error) {
      console.error('Message processing error:', error);
      this.showError('Failed to process message: ' + error.message);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'SEND';
    }
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    const welcomeMessage = "🐶 Hey there! I'm your friendly pug chatbot. I'm here to listen and react to how you're feeling. Try typing something and see what happens!";
    const chatHistory = document.getElementById('chat-history');

    if (chatHistory) {
      const welcomeDiv = document.createElement('div');
      welcomeDiv.className = 'message bot';
      welcomeDiv.textContent = welcomeMessage;
      chatHistory.appendChild(welcomeDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    console.error('Application Error:', message);

    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message bot';
      errorDiv.style.color = '#ff0040';
      errorDiv.style.fontWeight = 'bold';
      errorDiv.textContent = '⚠️ ' + message;
      chatHistory.appendChild(errorDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Also show in status if available
    if (this.videoController && this.videoController.updateStatus) {
      this.videoController.updateStatus('ERROR: ' + message);
    }
  }

  /**
   * Get application status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      initialized: this.initialized,
      sentimentReady: !!this.sentimentAnalyzer,
      videoReady: !!this.videoController && this.videoController.getStatus(),
      chatReady: !!this.chatHandler,
      currentSentiment: this.chatHandler ? this.chatHandler.getCurrentSentiment() : null
    };
  }

  /**
   * Debug function for developers
   */
  debug() {
    const status = this.getStatus();
    console.log('=== Debug Status ===');
    console.log(JSON.stringify(status, null, 2));

    // Run sentiment benchmark
    if (this.sentimentAnalyzer) {
      console.log('Running sentiment benchmarks...');
      const benchmark = this.sentimentAnalyzer.runBenchmarks();
      console.log('Benchmark results:', benchmark);

      if (benchmark.passed) {
        console.log('✅ Sentiment analyzer accuracy meets requirements');
      } else {
        console.log('❌ Sentiment analyzer accuracy below 80%');
      }
    }

    return status;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM ready, starting initialization...');

  // Create app instance
  window.cyberpunkPugCafe = new CyberpunkPugCafe();

  // Initialize
  await window.cyberpunkPugCafe.initialize();
});

// Expose debug function globally
window.debugPugCafe = () => {
  if (window.cyberpunkPugCafe) {
    return window.cyberpunkPugCafe.debug();
  } else {
    console.log('Application not initialized');
    return null;
  }
};

// Service worker registration (for offline capabilities - future enhancement)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js');
  });
}

console.log('Main script loaded');
