// Cyberpunk Pug Cafe Chat Handler

class ChatHandler {
  constructor() {
    this.sentimentAnalyzer = null;
    this.videoController = null;
    this.voiceController = null;
    this.currentSentiment = { score: 0, emotion: 'neutral' };
    this.conversationContext = {
      messageCount: 0,
      emotionHistory: [],
      lastInteraction: null,
      codingMode: false
    };

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
   * @param {VideoController} videoController - Video controller instance
   * @param {VoiceController} voiceController - Voice controller instance
   */
  setDependencies(analyzer, videoController, voiceController) {
    this.sentimentAnalyzer = analyzer;
    this.videoController = videoController;
    this.voiceController = voiceController;
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

      // Analyze sentiment with enhanced analysis
      if (!this.sentimentAnalyzer) {
        throw new Error('Sentiment analyzer not available');
      }

      const sentiment = this.sentimentAnalyzer.analyze(message, {
        previousEmotion: this.currentSentiment?.emotion,
        conversationContext: this.conversationContext
      });
      this.currentSentiment = sentiment;

      // Update conversation context for future analysis
      this.updateConversationContext(sentiment);

      console.log('Enhanced sentiment analyzed:', sentiment);

      // Generate response first
      const response = await this.generateResponse(message, sentiment);

      // Estimate voice duration for video synchronization
      const estimatedVoiceDuration = this.estimateVoiceDuration(response);

      // Switch video based on emotion synchronized with voice duration
      if (this.videoController) {
        const videoSwitched = this.videoController.switchToVideoForVoice(
          sentiment.emotion,
          estimatedVoiceDuration,
          true, // withTransition
          message // userMessage for keyword detection
        );
        if (!videoSwitched) {
          console.warn('Video switch failed or exceeded latency');
        }
      }

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
      const isCodingMode = this.conversationContext.codingMode;
      const prompt = isCodingMode
        ? `You are a cyberpunk hacker pug coding assistant. User sentiment: ${sentiment.emotion}. User says: "${message}". Respond as a pug hacker: be concise, technical, helpful. Use 1-2 sentences max. Include subtle cyberpunk/tech references.`
        : `You are a friendly cyberpunk pug chatbot. User sentiment: ${sentiment.emotion}. User says: "${message}". Respond naturally as a pug: be concise, friendly. Use 1-2 sentences max. Include subtle cyberpunk references.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:latest',
          prompt: prompt,
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
   * Update message history in UI and speak response
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

    setTimeout(async () => {
      this.hideTypingIndicator();

      const botDiv = document.createElement('div');
      botDiv.className = 'message bot';
      botDiv.textContent = botMessage;
      chatHistory.appendChild(botDiv);

      // Auto-scroll to bottom
      chatHistory.scrollTop = chatHistory.scrollHeight;

      // Speak the response with current sentiment context
      if (this.voiceController && this.voiceController.isAvailable()) {
        try {
          await this.voiceController.speak(botMessage, this.currentSentiment, {
            codingMode: this.conversationContext.codingMode
          });
        } catch (error) {
          console.warn('Voice synthesis failed:', error);
          // Continue without voice - don't break the UI
        }
      }
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

  /**
   * Update conversation context for future sentiment analysis
   * @param {Object} sentiment - Current sentiment analysis result
   */
  updateConversationContext(sentiment) {
    // Track message count
    this.conversationContext.messageCount++;

    // Maintain emotion history (last 5 emotions)
    this.conversationContext.emotionHistory.unshift(sentiment.emotion);
    if (this.conversationContext.emotionHistory.length > 5) {
      this.conversationContext.emotionHistory = this.conversationContext.emotionHistory.slice(0, 5);
    }

    // Update last interaction timestamp
    this.conversationContext.lastInteraction = Date.now();

    // Detect coding mode based on context patterns
    this.updateCodingMode(sentiment);
  }

  /**
   * Update coding mode detection based on conversation patterns
   * @param {Object} sentiment - Current sentiment analysis
   */
  updateCodingMode(sentiment) {
    const recentEmotions = this.conversationContext.emotionHistory.slice(0, 3);
    const codingIndicators = ['confused', 'frustrated', 'angry'];

    // If user has been confused/frustrated recently and current context is coding
    if (sentiment.context === 'coding' ||
      (recentEmotions.some(emotion => codingIndicators.includes(emotion)) && sentiment.context === 'coding')) {
      this.conversationContext.codingMode = true;
    }

    // Exit coding mode if conversation shifts to positive/casual topics
    if (sentiment.emotion === 'happy' || sentiment.emotion === 'excited') {
      this.conversationContext.codingMode = false;
    }
  }

  /**
   * Estimate voice duration for video synchronization
   * @param {string} text - Text to be spoken
   * @returns {number} Estimated duration in milliseconds
   */
  estimateVoiceDuration(text) {
    if (!text) return 2000; // Default fallback

    // Average speaking rate: ~150 words per minute = ~2.5 words per second
    // Average word length: ~5 characters
    const wordsPerMinute = 150;
    const wordsPerSecond = wordsPerMinute / 60;
    const charsPerSecond = wordsPerSecond * 5; // Rough estimate

    const charCount = text.length;
    const estimatedSeconds = charCount / charsPerSecond;

    // Add padding for natural pauses and processing
    const paddedSeconds = estimatedSeconds + 0.5;

    // Convert to milliseconds, with min/max bounds
    const durationMs = Math.max(1500, Math.min(8000, paddedSeconds * 1000));

    console.log(`Estimated voice duration for "${text.substring(0, 30)}...": ${durationMs}ms`);
    return durationMs;
  }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatHandler;
} else if (typeof window !== 'undefined') {
  window.ChatHandler = ChatHandler;
}
