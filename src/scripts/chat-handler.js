// Cyberpunk Pug Cafe Chat Handler

class ChatHandler {
  constructor() {
    this.sentimentAnalyzer = null;
    this.videoController = null;
    this.currentSentiment = { score: 0, emotion: 'neutral' };

    // Mock responses for local development (replace with actual API calls)
    this.mockResponses = {
      positive: [
        "I'm so glad you're enjoying this! 🐶",
        "That makes me wag my tail!",
        "Great to hear! What else can I help with?",
        "Your positive vibes are contagious!"
      ],
      negative: [
        "I'm here to help cheer you up. What's bothering you?",
        "That's no fun. How can I make it better?",
        "I understand you're upset. Let's work through this.",
        "Tell me more, I'm listening."
      ],
      excited: [
        "WOW! I'm so excited too!",
        "That's amazing news!",
        "I'm over the moon about this!",
        "What an exciting development!"
      ],
      angry: [
        "I see you're really upset. Let's calm down and talk.",
        "Strong emotions! I can feel your energy.",
        "Tell me what's making you so mad.",
        "I hear your frustration. I'm here to help."
      ],
      confused: [
        "Hmm, I'm a bit puzzled too. Let's figure this out together.",
        "I'm not sure about that either. What's confusing you?",
        "Let's clear up this confusion!",
        "That's tricky... can you explain more?"
      ],
      bored: [
        "Looking for some excitement? Let's liven things up!",
        "Boredom is my enemy! What interests you?",
        "Time for some fun! What's on your mind?",
        "Let's shake off that boredom - what do you want to talk about?"
      ],
      neutral: [
        "How are you feeling today?",
        "What's on your mind?",
        "I'm here and listening.",
        "What would you like to chat about?"
      ]
    };

    console.log('Chat handler initialized');
  }

  /**
   * Set dependencies
   * @param {SentimentAnalyzer} analyzer - Sentiment analyzer instance
   * @param {VideoController} controller - Video controller instance
   * @param {SentimentWavefront} wavefront - Sentiment wavefront instance
   */
  setDependencies(analyzer, controller) {
    this.sentimentAnalyzer = analyzer;
    this.videoController = controller;
  }

  /**
   * Handle incoming chat message
   * @param {string} message - User message
   * @returns {Promise<Object>} Response object
   */
  async handleMessage(message) {
    const startTime = performance.now();

    try {
      console.log('Processing message:', message);

      // Analyze sentiment
      if (!this.sentimentAnalyzer) {
        throw new Error('Sentiment analyzer not available');
      }

      const sentiment = this.sentimentAnalyzer.analyze(message);
      this.currentSentiment = sentiment;

      console.log('Sentiment analyzed:', sentiment);

      // Switch video based on emotion
      if (this.videoController) {
        const videoSwitched = this.videoController.switchToVideo(sentiment.emotion);
        if (!videoSwitched) {
          console.warn('Video switch failed or exceeded latency');
        }
      }

      // Generate response
      const response = await this.generateResponse(message, sentiment);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(`Message handled in ${totalTime.toFixed(1)}ms`);

      return {
        message: response,
        sentiment: sentiment,
        timing: {
          total: totalTime,
          acceptable: totalTime < 2000 // Less than 2s requirement
        }
      };

    } catch (error) {
      console.error('Chat handling error:', error);
      return {
        message: "Sorry, I'm having trouble understanding that right now.",
        sentiment: { score: 0, emotion: 'neutral' },
        error: error.message
      };
    }
  }

  /**
   * Generate contextual response
   * @param {string} userMessage - Original user message
   * @param {Object} sentiment - Analysis result
   * @returns {Promise<string>} Bot response
   */
  async generateResponse(userMessage, sentiment) {
    // Use Ollama Gemma3 for responses
    return await this.callOllamaAPI(userMessage, sentiment);
  }

  /**
   * Call Ollama API with Gemma3
   * @param {string} message - User message
   * @param {Object} sentiment - Sentiment context
   * @returns {Promise<string>} AI response
   */
  async callOllamaAPI(message, sentiment) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:latest',
          prompt: `You are a friendly pug barista at a unique cyberpunk-style cafe. User sentiment: ${sentiment.emotion} (score: ${sentiment.score}). User says: "${message}". Respond naturally as a pug, with occasional subtle cyberpunk references and single-word Japanese slang in katakana.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.text || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Ollama API call failed:', error);
      // Fallback to mock response if API fails
      const responses = this.mockResponses[sentiment.emotion] || this.mockResponses.neutral;
      const randomIndex = Math.floor(Math.random() * responses.length);
      return responses[randomIndex];
    }
  }

  /**
   * Call OpenAI API (placeholder for implementation)
   * @param {string} message - User message
   * @param {Object} sentiment - Sentiment context
   * @returns {Promise<string>} AI response
   */
  async callOpenAIAPI(message, sentiment) {
    // Placeholder for actual OpenAI integration
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: [{
    //       role: 'system',
    //       content: `You are a friendly pug chatbot. The user is feeling ${sentiment.emotion}.`
    //     }, {
    //       role: 'user',
    //       content: message
    //     }]
    //   })
    // });
    // const data = await response.json();
    // return data.choices[0].message.content;

    throw new Error('OpenAI API integration not implemented yet');
  }

  /**
   * Get current sentiment state
   * @returns {Object} Current sentiment
   */
  getCurrentSentiment() {
    return this.currentSentiment;
  }

  /**
   * Update message history in UI
   * @param {string} userMessage - User message
   * @param {string} botMessage - Bot response
   */
  updateUI(userMessage, botMessage) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMessage;
    chatHistory.appendChild(userDiv);

    // Add bot message with typing indicator
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();

      const botDiv = document.createElement('div');
      botDiv.className = 'message bot';
      botDiv.textContent = botMessage;
      chatHistory.appendChild(botDiv);

      // Auto-scroll to bottom
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 500 + Math.random() * 1000); // Random delay for natural feel
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      indicator.appendChild(dot);
    }

    chatHistory.appendChild(indicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatHandler;
} else if (typeof window !== 'undefined') {
  window.ChatHandler = ChatHandler;
}
