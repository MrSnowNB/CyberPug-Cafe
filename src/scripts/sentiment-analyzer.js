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
   * Analyze sentiment of input text
   * @param {string} text - User input to analyze
   * @returns {Object} Analysis result with score, state, and emotion
   */
  analyze(text) {
    try {
      // Sanitize input
      const cleanText = this.sanitizeText(text);

      if (!cleanText || cleanText.length < 2) {
        return { score: 0, state: 'neutral', emotion: 'neutral' };
      }

      // Simple word-based sentiment scoring
      let score = 0;
      const words = cleanText.split(/\s+/);

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

      // Normalize score based on text length (avoid extreme scores for long texts)
      const maxPossibleScore = Math.max(words.length * 4, 5);
      score = (score / maxPossibleScore) * 5;
      score = Math.max(-5, Math.min(5, score));

      // Check for edge triggers (override if stronger)
      const edgeState = this.checkEdgeTriggers(cleanText);

      let finalScore = score;
      let state = this.scoreToState(score);
      let emotion = this.stateToEmotion(state, text);

      // Override with edge states if detected
      if (edgeState) {
        switch (edgeState) {
          case 'excited':
            finalScore = Math.max(3, score);
            state = 'very_positive';
            emotion = 'excited';
            break;
          case 'angry':
            finalScore = Math.min(-3, score);
            state = 'very_negative';
            emotion = 'angry';
            break;
          case 'confused':
            finalScore = Math.max(-2, Math.min(0, score));
            state = 'negative';
            emotion = 'confused';
            break;
          case 'bored':
            finalScore = Math.max(-1, Math.min(0, score));
            state = 'neutral';
            emotion = 'bored';
            break;
        }
      }

      const result = {
        score: finalScore,
        state: state,
        emotion: emotion,
        raw_score: score,
        trigger: edgeState || 'none'
      };

      console.log(`Sentiment analysis: "${text}" → ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, state: 'neutral', emotion: 'neutral', error: error.message };
    }
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
