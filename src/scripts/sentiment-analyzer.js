// Cyberpunk Pug Cafe Sentiment Analyzer
// Browser-compatible version with simple word-based scoring
// TODO: Integrate with natural.js when backend API is available

class SentimentAnalyzer {
  constructor() {
    // Simple word-based sentiment lexicon for browser compatibility
    this.sentimentWords = {
      // Positive words
      positive: {
        'amazing': 4, 'awesome': 4, 'great': 3, 'good': 3, 'love': 4, 'excellent': 4,
        'wonderful': 4, 'fantastic': 4, 'brilliant': 4, 'happy': 3, 'joy': 3,
        'pleasure': 3, 'glad': 3, 'excited': 4, 'thrilled': 4, 'delighted': 4,
        'nice': 2, 'fine': 2, 'okay': 1, 'thanks': 2, 'thank': 2, 'helpful': 3
      },
      // Negative words
      negative: {
        'awful': -5, 'terrible': -4, 'horrible': -4, 'bad': -3, 'worst': -4,
        'hate': -4, 'disappointed': -3, 'angry': -4, 'mad': -4, 'furious': -4,
        'sad': -3, 'unhappy': -3, 'upset': -3, 'annoyed': -2, 'frustrated': -3,
        'sucks': -4, 'disgusting': -3, 'dislike': -2, 'boring': -2, 'tired': -1,
        'confused': -2, 'lost': -2, 'puzzled': -2, 'sleepy': -1, 'dull': -2
      }
    };

    // Custom patterns for edge cases and special states
    this.edgeTriggers = {
      excited: /\b(excited|exciting|amazing|wow|awesome|surprised|shocked)\b/i,
      angry: /\b(angry|mad|furious|mad|fuming|rage|pissed)\b/i,
      confused: /\b(confused|puzzled|bewildered|lost|clueless)\b/i,
      bored: /\b(bored|boring|tired|dull|sleepy)\b/i
    };

    console.log('Sentiment analyzer initialized (browser compatible)');
  }

  /**
   * Analyze sentiment of input text with enhanced semantic understanding
   * @param {string} text - User input to analyze
   * @param {Object} context - Optional context from previous interactions
   * @returns {Object} Analysis result with score, state, emotion, and context
   */
  analyze(text, context = {}) {
    try {
      // Sanitize input
      const cleanText = this.sanitizeText(text);

      if (!cleanText || cleanText.length < 2) {
        return { score: 0, state: 'neutral', emotion: 'neutral', context: 'minimal_input' };
      }

      // Multi-layered analysis
      const wordAnalysis = this.analyzeWords(cleanText);
      const phraseAnalysis = this.analyzePhrases(cleanText);
      const contextAnalysis = this.analyzeContext(cleanText, context);
      const codingAnalysis = this.analyzeCodingSentiment(cleanText);

      // Combine scores with weights
      let combinedScore = (
        wordAnalysis.score * 0.4 +
        phraseAnalysis.score * 0.3 +
        contextAnalysis.score * 0.2 +
        codingAnalysis.score * 0.1
      );

      // Normalize score based on text length (avoid extreme scores for long texts)
      const words = cleanText.split(/\s+/);
      const maxPossibleScore = Math.max(words.length * 4, 5);
      combinedScore = (combinedScore / maxPossibleScore) * 5;
      combinedScore = Math.max(-5, Math.min(5, combinedScore));

      // Check for edge triggers (override if stronger)
      const edgeState = this.checkEdgeTriggers(cleanText);

      let finalScore = combinedScore;
      let state = this.scoreToState(combinedScore);
      let emotion = this.stateToEmotion(state, text);

      // Override with edge states if detected
      if (edgeState) {
        switch (edgeState) {
          case 'excited':
            finalScore = Math.max(3, combinedScore);
            state = 'very_positive';
            emotion = 'excited';
            break;
          case 'angry':
            finalScore = Math.min(-3, combinedScore);
            state = 'very_negative';
            emotion = 'angry';
            break;
          case 'confused':
            finalScore = Math.max(-2, Math.min(0, combinedScore));
            state = 'negative';
            emotion = 'confused';
            break;
          case 'bored':
            finalScore = Math.max(-1, Math.min(0, combinedScore));
            state = 'neutral';
            emotion = 'bored';
            break;
        }
      }

      // Determine intensity for video selection
      const intensity = this.calculateIntensity(finalScore, cleanText);

      const result = {
        score: finalScore,
        state: state,
        emotion: emotion,
        intensity: intensity,
        raw_score: combinedScore,
        trigger: edgeState || 'none',
        context: this.determineContext(cleanText),
        analysis: {
          words: wordAnalysis,
          phrases: phraseAnalysis,
          context: contextAnalysis,
          coding: codingAnalysis
        }
      };

      console.log(`Enhanced sentiment analysis: "${text}" → ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        score: 0,
        state: 'neutral',
        emotion: 'neutral',
        intensity: 'low',
        context: 'error',
        error: error.message
      };
    }
  }

  /**
   * Analyze individual words for sentiment
   * @param {string} text - Clean text
   * @returns {Object} Word analysis result
   */
  analyzeWords(text) {
    let score = 0;
    const words = text.split(/\s+/);

    for (const word of words) {
      // Check positive words
      if (this.sentimentWords.positive[word]) {
        score += this.sentimentWords.positive[word];
      }
      // Check negative words
      else if (this.sentimentWords.negative[word]) {
        score += this.sentimentWords.negative[word];
      }
    }

    return { score: score, words_found: words.length };
  }

  /**
   * Analyze phrases and multi-word expressions
   * @param {string} text - Clean text
   * @returns {Object} Phrase analysis result
   */
  analyzePhrases(text) {
    let score = 0;
    const phrases = [
      // Positive phrases
      { pattern: /\b(thank you|thanks so much|appreciate it)\b/i, score: 3 },
      { pattern: /\b(that's awesome|that's great|wonderful)\b/i, score: 4 },
      { pattern: /\b(i love it|i like it|it's good)\b/i, score: 3 },
      { pattern: /\b(oh wow|wow that's|amazing)\b/i, score: 4 },

      // Negative phrases
      { pattern: /\b(that sucks|this is bad|not good)\b/i, score: -3 },
      { pattern: /\b(i hate it|disgusting|terrible)\b/i, score: -4 },
      { pattern: /\b(this is frustrating|so annoying|upsetting)\b/i, score: -3 },
      { pattern: /\b(i'm confused|doesn't make sense|what)\b/i, score: -2 },

      // Neutral/Question phrases
      { pattern: /\b(how do i|can you|what is|explain)\b/i, score: 0.5 },
      { pattern: /\b(help me|assist me|guide me)\b/i, score: 1 }
    ];

    for (const phrase of phrases) {
      if (phrase.pattern.test(text)) {
        score += phrase.score;
      }
    }

    return { score: score, phrases_matched: score !== 0 };
  }

  /**
   * Analyze context from conversation flow
   * @param {string} text - Clean text
   * @param {Object} context - Previous interaction context
   * @returns {Object} Context analysis result
   */
  analyzeContext(text, context) {
    let score = 0;

    // Question detection (curiosity)
    if (text.includes('?') || /^\s*(what|how|why|when|where|who|which)/i.test(text)) {
      score += 0.5;
    }

    // Command/request detection
    if (/^\s*(can you|please|help me|show me)/i.test(text)) {
      score += 0.3;
    }

    // Short acknowledgments (patience)
    if (/^\s*(ok|okay|yes|yeah|sure|got it|understood)/i.test(text)) {
      score += 0.2;
    }

    // Escalation detection from previous context
    if (context.previousEmotion === 'frustrated' && this.isFrustrated(text)) {
      score -= 0.5; // Escalate negative sentiment
    }

    return { score: score, context_detected: score !== 0 };
  }

  /**
   * Analyze coding-specific sentiment patterns
   * @param {string} text - Clean text
   * @returns {Object} Coding analysis result
   */
  analyzeCodingSentiment(text) {
    let score = 0;

    // Coding frustration indicators
    const frustrationPatterns = [
      /\b(bug|error|fail|broken|doesn't work)\b/i,
      /\b(stuck|confused|lost|no idea)\b/i,
      /\b(why won't|can't figure|driving me crazy)\b/i,
      /\b(hours|days|forever) (trying|working|debugging)\b/i
    ];

    // Coding success indicators
    const successPatterns = [
      /\b(fixed it|working now|solved|figured out)\b/i,
      /\b(that was easy|simple|straightforward)\b/i,
      /\b(great|awesome|love) (code|programming|debugging)\b/i
    ];

    // Check frustration
    for (const pattern of frustrationPatterns) {
      if (pattern.test(text)) {
        score -= 2;
        break;
      }
    }

    // Check success (can override frustration)
    for (const pattern of successPatterns) {
      if (pattern.test(text)) {
        score += 3;
        break;
      }
    }

    return { score: score, coding_context: score !== 0 };
  }

  /**
   * Check if text indicates frustration
   * @param {string} text - Text to check
   * @returns {boolean} Whether text shows frustration
   */
  isFrustrated(text) {
    return /\b(frustrated|annoyed|upset|angry|mad)\b/i.test(text);
  }

  /**
   * Calculate intensity level for video selection
   * @param {number} score - Final sentiment score
   * @param {string} text - Original text for context
   * @returns {string} Intensity level
   */
  calculateIntensity(score, text) {
    const absScore = Math.abs(score);

    // High intensity indicators
    if (absScore >= 4 || /(!{2,}|\?{2,}|wow|amazing|terrible|awesome)/i.test(text)) {
      return 'high';
    }

    // Medium intensity
    if (absScore >= 2 || /(really|very|so much|quite)/i.test(text)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine conversation context for better video matching
   * @param {string} text - Clean text
   * @returns {string} Context category
   */
  determineContext(text) {
    if (text.includes('?') || /^\s*(what|how|why|when|where|who|which|can you|help)/i.test(text)) {
      return 'questioning';
    }

    if (/^\s*(ok|okay|yes|yeah|sure|got it|thanks?|thank you)/i.test(text)) {
      return 'acknowledging';
    }

    if (/\b(code|programming|debug|error|function|variable|script)\b/i.test(text)) {
      return 'coding';
    }

    if (/(!{2,}|\?{2,}|wow|amazing|terrible|awesome)/i.test(text)) {
      return 'expressive';
    }

    return 'general';
  }

  /**
   * Check for special trigger words
   * @param {string} text - Cleaned text to check
   * @returns {string|null} Detection type or null
   */
  checkEdgeTriggers(text) {
    for (const [type, pattern] of Object.entries(this.edgeTriggers)) {
      if (pattern.test(text)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Convert numeric score to categorical state
   * @param {number} score - Score from -5 to +5
   * @returns {string} State category
   */
  scoreToState(score) {
    if (score >= 4) return 'very_positive';
    if (score >= 2) return 'positive';
    if (score >= 1) return 'slightly_positive';
    if (score <= -4) return 'very_negative';
    if (score <= -2) return 'negative';
    if (score <= -1) return 'slightly_negative';
    return 'neutral';
  }

  /**
   * Map state to emotion for video selection
   * @param {string} state - State category
   * @param {string} rawText - Original text for context analysis
   * @returns {string} Emotion type
   */
  stateToEmotion(state, rawText) {
    switch (state) {
      case 'very_positive':
        return 'positive';
      case 'positive':
      case 'slightly_positive':
        return 'positive';
      case 'very_negative':
        return 'angry';
      case 'negative':
      case 'slightly_negative':
        return 'negative';
      case 'neutral':
        return this.detectNeutralVariant(rawText);
      default:
        return 'neutral';
    }
  }

  /**
   * Detect specific neutral emotion variants based on text characteristics
   * @param {string} text - Raw input text
   * @returns {string} Neutral emotion variant
   */
  detectNeutralVariant(text) {
    if (!text || text.length === 0) return 'neutral';

    // Questions indicate curiosity
    if (text.includes('?') || /^\s*what|how|why|when|where|who|which/i.test(text.trim())) {
      return 'curious';
    }

    // Short responses or acknowledgments suggest waiting/patient
    if (text.trim().length < 10 || /^\s*(ok|okay|yes|yeah|sure|alright|got|it|understand|thanks?|thank you)/i.test(text.trim())) {
      return 'waiting';
    }

    // ALL CAPS or strong punctuation suggests focus/intensity
    if (text === text.toUpperCase() && text.length > 3 || /!{2,}|\.{3,}/.test(text)) {
      return 'focused';
    }

    // Default to regular neutral
    return 'neutral';
  }

  /**
   * Sanitize input text
   * @param {string} text - Raw input
   * @returns {string} Cleaned text
   */
  sanitizeText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ');    // Normalize spaces
  }

  /**
   * Test analyzer with benchmark corpus
   * @returns {Object} Test results
   */
  runBenchmarks() {
    const testCases = [
      { text: "This is amazing! I'm so happy", expected: 4, expected_emotion: 'positive' },
      { text: "Great job, love it", expected: 3, expected_emotion: 'positive' },
      { text: "Thanks! That was helpful", expected: 3, expected_emotion: 'positive' },
      { text: "Wonderful experience!", expected: 4, expected_emotion: 'positive' },
      { text: "This sucks, terrible", expected: -4, expected_emotion: 'angry' },
      { text: "Disappointed, not what I expected", expected: -3, expected_emotion: 'negative' },
      { text: "Bad experience overall", expected: -2, expected_emotion: 'negative' },
      { text: "Awful, never again", expected: -5, expected_emotion: 'angry' },
      { text: "Okay, it's fine", expected: 0, expected_emotion: 'waiting' },
      { text: "Not sure what to say", expected: 0, expected_emotion: 'neutral' },
      { text: "Got it", expected: 0, expected_emotion: 'waiting' },
      { text: "What is this?", expected: 0, expected_emotion: 'curious' },
      { text: "Why are you so angry?", expected: -4, expected_emotion: 'angry' },
      { text: "So bored right now", expected: -1, expected_emotion: 'negative' },
      { text: "This is exciting!", expected: 4, expected_emotion: 'excited' },
      { text: "WHAT?! That's surprising!", expected: 3, expected_emotion: 'focused' },
      { text: "How does this work?", expected: 0, expected_emotion: 'curious' },
      { text: "Okay", expected: 0, expected_emotion: 'waiting' },
      { text: "Sure thing!", expected: 0, expected_emotion: 'waiting' }
    ];

    const results = testCases.map(test => {
      const result = this.analyze(test.text);
      const scoreAccuracy = Math.abs(result.score - test.expected) <= 1 ? 1 : 0;
      const emotionAccuracy = test.expected_emotion ? (result.emotion === test.expected_emotion ? 1 : 0) : 1;
      return {
        text: test.text.slice(0, 30) + '...',
        expected_score: test.expected,
        actual_score: result.score,
        score_accuracy: scoreAccuracy,
        expected_emotion: test.expected_emotion || 'any',
        actual_emotion: result.emotion,
        emotion_accuracy: emotionAccuracy,
        trigger: result.trigger
      };
    });

    const scoreAccuracy = results.reduce((sum, r) => sum + r.score_accuracy, 0) / results.length;
    const emotionAccuracy = results.reduce((sum, r) => sum + r.emotion_accuracy, 0) / results.length;

    // Analyze neutral variety
    const neutralResults = results.filter(r => r.expected_score === 0);
    const neutralEmotions = {};
    neutralResults.forEach(r => {
      neutralEmotions[r.actual_emotion] = (neutralEmotions[r.actual_emotion] || 0) + 1;
    });

    return {
      total_tests: testCases.length,
      score_accuracy: scoreAccuracy,
      emotion_accuracy: emotionAccuracy,
      passed: scoreAccuracy >= 0.8,
      neutral_variety: {
        count: neutralResults.length,
        emotion_distribution: neutralEmotions,
        unique_emotions: Object.keys(neutralEmotions).length
      },
      results: results
    };
  }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SentimentAnalyzer;
} else if (typeof window !== 'undefined') {
  window.SentimentAnalyzer = SentimentAnalyzer;
}
