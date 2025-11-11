// Cyberpunk Pug Cafe Video Controller

class VideoController {
  constructor() {
    this.currentVideo = null;
    this.videoElement = document.getElementById('pug-video');
    this.statusElement = document.getElementById('video-status');
    this.preloadedVideos = new Map();
    this.emotionMap = {};

    // Video sequencing system
    this.currentSequence = null;
    this.sequenceTimeouts = [];

    console.log('Video controller initialized');
  }

  /**
   * Load emotion mapping configuration
   * @returns {Promise<Object>} Emotion map
   */
  async loadEmotionMap() {
    try {
      // Load from config file
      const response = await fetch('./config/emotion-map.json');
      if (!response.ok) {
        throw new Error(`Failed to load emotion map: ${response.status}`);
      }
      this.emotionMap = await response.json();
      console.log('Emotion map loaded:', Object.keys(this.emotionMap.emotions).length, 'emotions,', Object.keys(this.emotionMap.keywords).length, 'keywords,', Object.keys(this.emotionMap.chains).length, 'chains');

      // Initialize state tracking
      this.lastEmotion = null;
      this.lastVideoPlayed = null;
      this.conversationContext = {
        recentEmotions: [],
        keywordTriggers: new Set()
      };

      return this.emotionMap;
    } catch (error) {
      console.error('Error loading emotion map:', error);
      // Fallback empty map
      this.emotionMap = { emotions: {}, keywords: {}, chains: {} };
      return this.emotionMap;
    }
  }

  /**
   * Preload all video files from emotion map
   */
  async preloadVideos() {
    // Collect all unique video filenames from emotions, keywords, and chains
    const videoFiles = new Set();

    // From emotions
    if (this.emotionMap.emotions) {
      Object.values(this.emotionMap.emotions).forEach(emotionArray => {
        emotionArray.forEach(videoObj => {
          videoFiles.add(videoObj.video);
        });
      });
    }

    // From keywords
    if (this.emotionMap.keywords) {
      Object.values(this.emotionMap.keywords).forEach(keywordArray => {
        keywordArray.forEach(videoFile => {
          videoFiles.add(videoFile);
        });
      });
    }

    // From chains
    if (this.emotionMap.chains) {
      Object.values(this.emotionMap.chains).forEach(chainArray => {
        chainArray.forEach(videoFile => {
          videoFiles.add(videoFile);
        });
      });
    }

    const uniqueVideoFiles = Array.from(videoFiles);
    this.updateStatus(`Preloading ${uniqueVideoFiles.length} videos...`);

    const preloadPromises = uniqueVideoFiles.map(async (filename) => {
      const videoPath = `../mp4/${filename}`;
      const video = document.createElement('video');
      video.muted = true;
      video.loop = false; // Disable automatic looping, we'll control it manually
      video.preload = 'auto';

      return new Promise((resolve, reject) => {
        video.oncanplaythrough = () => {
          this.preloadedVideos.set(filename, video);
          resolve(filename);
        };

        video.onerror = () => {
          console.warn(`Failed to preload: ${filename}`);
          reject(filename);
        };

        video.src = videoPath;
      });
    });

    try {
      await Promise.all(preloadPromises);
      this.updateStatus(`${uniqueVideoFiles.length} videos preloaded successfully`);
      console.log('All videos preloaded');
    } catch (errors) {
      console.warn('Some videos failed to preload:', errors);
      this.updateStatus('Video preloading completed with warnings');
    }
  }

  /**
   * Initialize controller and start first video
   */
  async initialize() {
    await this.loadEmotionMap();
    await this.preloadVideos();

    // Start with a neutral video if available
    const neutralVideo = this.findVideoForEmotion('neutral');
    if (neutralVideo) {
      this.switchToVideo(neutralVideo, false);
    }

    console.log('Video controller ready');
  }

  /**
   * Switch to emotion video that loops until voice completes, then return to neutral cycling
   * @param {string} emotion - Emotion category
   * @param {number} voiceDurationMs - Expected voice duration in milliseconds
   * @param {boolean} withTransition - Whether to add transition effects
   * @param {string} userMessage - Original user message for keyword detection
   * @returns {boolean} Success status
   */
  switchToVideoForVoice(emotion, voiceDurationMs = 3000, withTransition = true, userMessage = '') {
    // Clear any existing sequence
    this.clearCurrentSequence();

    const startTime = performance.now();

    // Find emotion video or chain
    const result = this.findVideoForEmotion(emotion, 0, userMessage);

    if (!result) {
      console.warn(`No video found for emotion: ${emotion}`);
      this.updateStatus(`No video for ${emotion}`);
      return false;
    }

    // Check if result is a chain key
    if (this.emotionMap.chains[result]) {
      console.log(`Playing emotion chain: ${emotion} (${result}) for ${voiceDurationMs}ms`);
      return this.playVideoChain(result, voiceDurationMs);
    }

    // Regular video playback
    const emotionVideoFile = result;
    console.log(`Playing emotion video: ${emotion} (${emotionVideoFile}) for ${voiceDurationMs}ms`);

    // Start emotion video with continuous looping
    this.playVideoWithLooping(emotionVideoFile, withTransition);

    // Set up voice-synchronized sequence
    this.currentSequence = {
      emotion: emotion,
      video: emotionVideoFile,
      voiceDuration: voiceDurationMs,
      startTime: startTime,
      type: 'voice-synced'
    };

    // Schedule return to neutral cycling after voice completes + buffer
    const bufferTime = 2000 + Math.random() * 2000; // 2-4 second buffer
    const totalDelay = voiceDurationMs + bufferTime;

    const returnToNeutralTimeout = setTimeout(() => {
      console.log('Voice complete + buffer, returning to neutral video cycling');
      this.startNeutralCycling();
    }, totalDelay);

    this.sequenceTimeouts = [returnToNeutralTimeout];

    const endTime = performance.now();
    const switchTime = endTime - startTime;

    this.updateStatus(`${emotion} → ${voiceDurationMs}ms voice`);
    console.log(`Started voice-synced sequence: ${emotionVideoFile} (${switchTime.toFixed(1)}ms)`);

    return switchTime < 300;
  }

  /**
   * Start random neutral video cycling
   */
  startNeutralCycling() {
    // Clear any existing sequence
    this.clearCurrentSequence();

    console.log('Starting neutral video cycling');

    // Get random neutral video
    const neutralVideo = this.findVideoForEmotion('neutral');
    if (neutralVideo) {
      this.playVideoWithLooping(neutralVideo, true);

      // Set up cycling every 20-35 seconds (much less frequent)
      const cycleInterval = 20000 + Math.random() * 15000; // 20-35 seconds

      const cycleTimeout = setTimeout(() => {
        this.startNeutralCycling(); // Recursively cycle
      }, cycleInterval);

      this.sequenceTimeouts = [cycleTimeout];
      this.currentSequence = {
        type: 'neutral-cycling',
        interval: cycleInterval
      };

      this.updateStatus(`Neutral cycling (${cycleInterval.toFixed(0)}ms)`);
    }
  }

  /**
   * Play a video with continuous looping (for voice synchronization)
   * @param {string} videoFile - Video filename
   * @param {boolean} withTransition - Whether to add transition effects
   */
  playVideoWithLooping(videoFile, withTransition = true) {
    const video = this.preloadedVideos.get(videoFile);
    if (!video) {
      console.error(`Video not preloaded: ${videoFile}`);
      return false;
    }

    // Clear any existing event listeners
    if (this.videoElement.onended) {
      this.videoElement.onended = null;
    }

    // Replace current video
    if (this.currentVideo) {
      this.videoElement.pause();
    }

    this.currentVideo = video;
    this.videoElement.src = video.src;
    this.videoElement.load();

    // Set up continuous looping
    this.videoElement.loop = true;

    this.videoElement.play().catch(e => {
      console.warn('Video autoplay failed:', e);
      this.updateStatus('Video autoplay blocked');
    });

    // Apply transition effect
    if (withTransition) {
      this.videoElement.classList.add('video-transition');
      setTimeout(() => {
        this.videoElement.classList.remove('video-transition');
      }, 300);
    }

    console.log(`Playing looping video: ${videoFile}`);
    return true;
  }

  /**
   * Legacy method for backward compatibility - redirects to voice-synced version
   * @param {string} emotion - Emotion category
   * @param {boolean} withTransition - Whether to add transition effects
   * @returns {boolean} Success status
   */
  switchToVideo(emotion, withTransition = true) {
    // Default to 3 second voice duration for legacy calls
    return this.switchToVideoForVoice(emotion, 3000, withTransition);
  }

  /**
   * Play a video directly (used by sequence system)
   * @param {string} videoFile - Video filename
   * @param {boolean} withTransition - Whether to add transition effects
   */
  playVideo(videoFile, withTransition = true) {
    const video = this.preloadedVideos.get(videoFile);
    if (!video) {
      console.error(`Video not preloaded: ${videoFile}`);
      return false;
    }

    // Clear any existing event listeners
    if (this.videoElement.onended) {
      this.videoElement.onended = null;
    }

    // Replace current video
    if (this.currentVideo) {
      this.videoElement.pause();
    }

    this.currentVideo = video;
    this.videoElement.src = video.src;
    this.videoElement.load();
    this.videoElement.play().catch(e => {
      console.warn('Video autoplay failed:', e);
      this.updateStatus('Video autoplay blocked');
    });

    // Apply transition effect
    if (withTransition) {
      this.videoElement.classList.add('video-transition');
      setTimeout(() => {
        this.videoElement.classList.remove('video-transition');
      }, 300);
    }

    console.log(`Playing video: ${videoFile}`);
    return true;
  }

  /**
   * Play a video with specified number of loops
   * @param {string} videoFile - Video filename
   * @param {boolean} withTransition - Whether to add transition effects
   * @param {number} loopCount - Number of times to loop the video
   */
  playVideoWithLoops(videoFile, withTransition = true, loopCount = 1) {
    const video = this.preloadedVideos.get(videoFile);
    if (!video) {
      console.error(`Video not preloaded: ${videoFile}`);
      return false;
    }

    let remainingLoops = loopCount;

    // Clear any existing event listeners
    this.videoElement.onended = null;

    // Replace current video
    if (this.currentVideo) {
      this.videoElement.pause();
    }

    this.currentVideo = video;
    this.videoElement.src = video.src;
    this.videoElement.load();

    // Set up looping behavior
    this.videoElement.onended = () => {
      remainingLoops--;
      if (remainingLoops > 0) {
        console.log(`Replaying ${videoFile}, ${remainingLoops} loops remaining`);
        this.videoElement.currentTime = 0;
        this.videoElement.play().catch(e => {
          console.warn('Video replay failed:', e);
        });
      } else {
        console.log(`${videoFile} finished ${loopCount} loops`);
        this.videoElement.onended = null; // Clean up
      }
    };

    this.videoElement.play().catch(e => {
      console.warn('Video autoplay failed:', e);
      this.updateStatus('Video autoplay blocked');
    });

    // Apply transition effect
    if (withTransition) {
      this.videoElement.classList.add('video-transition');
      setTimeout(() => {
        this.videoElement.classList.remove('video-transition');
      }, 300);
    }

    console.log(`Playing video with ${loopCount} loops: ${videoFile}`);
    return true;
  }

  /**
   * Clear current video sequence
   */
  clearCurrentSequence() {
    if (this.sequenceTimeouts.length > 0) {
      this.sequenceTimeouts.forEach(timeout => clearTimeout(timeout));
      this.sequenceTimeouts = [];
    }
    this.currentSequence = null;
  }

  /**
   * Find video filename for given emotion with enhanced logic
   * @param {string} emotion - Emotion category
   * @param {number} intensity - Sentiment intensity (-5 to +5)
   * @param {string} userMessage - Original user message for keyword detection
   * @returns {string|null} Video filename or chain key
   */
  findVideoForEmotion(emotion, intensity = 0, userMessage = '') {
    // Check for keyword overrides first
    const keywordVideo = this.checkKeywordTriggers(userMessage);
    if (keywordVideo) {
      console.log(`Keyword trigger: ${keywordVideo}`);
      this.trackVideoUsage(keywordVideo);
      return keywordVideo;
    }

    // Check for chain reactions for strong emotions
    const chainKey = this.checkChainReactions(emotion, intensity);
    if (chainKey) {
      console.log(`Chain reaction: ${chainKey}`);
      return chainKey; // Return chain key, not video
    }

    // Get emotion videos array
    const emotionVideos = this.emotionMap.emotions[emotion];
    if (!emotionVideos || emotionVideos.length === 0) {
      // Handle sub-emotions and fallbacks
      if (emotion === 'positive') return this.findVideoForEmotion('happy', intensity, userMessage);
      if (emotion === 'negative') return this.findVideoForEmotion('sad', intensity, userMessage);
      if (emotion === 'curious' || emotion === 'waiting' || emotion === 'focused') {
        return this.findVideoForEmotion('neutral', intensity, userMessage);
      }

      // General fallback
      console.warn(`No videos found for emotion: ${emotion}, using neutral`);
      return this.findVideoForEmotion('neutral', intensity, userMessage);
    }

    // Filter by intensity if specified
    let filteredVideos = emotionVideos;
    if (intensity !== 0) {
      const intensityLevel = this.getIntensityLevel(intensity);
      filteredVideos = emotionVideos.filter(videoData => {
        return videoData.intensity === intensityLevel;
      });

      // Fallback to any intensity if no matches
      if (filteredVideos.length === 0) {
        filteredVideos = emotionVideos;
      }
    }

    // Avoid repeating the same video recently
    const recentVideos = this.getRecentVideos(3);
    const availableVideos = filteredVideos.filter(videoData => {
      return !recentVideos.includes(videoData.video);
    });

    // Use available videos, or fall back to all if we've exhausted options
    const finalVideos = availableVideos.length > 0 ? availableVideos : filteredVideos;

    // Random selection from final videos
    const randomIndex = Math.floor(Math.random() * finalVideos.length);
    const selectedVideo = finalVideos[randomIndex].video;

    // Track usage and update state
    this.trackVideoUsage(selectedVideo);
    this.lastEmotion = emotion;

    return selectedVideo;
  }

  /**
   * Check for keyword triggers in user message
   * @param {string} message - User message
   * @returns {string|null} Video filename if keyword found
   */
  checkKeywordTriggers(message) {
    const lowerMessage = message.toLowerCase();

    for (const [keyword, videos] of Object.entries(this.emotionMap.keywords)) {
      if (lowerMessage.includes(keyword)) {
        // Avoid repeating recent keyword videos
        const recentVideos = this.getRecentVideos(2);
        const availableVideos = videos.filter(video => !recentVideos.includes(video));

        if (availableVideos.length > 0) {
          return availableVideos[Math.floor(Math.random() * availableVideos.length)];
        } else {
          return videos[Math.floor(Math.random() * videos.length)];
        }
      }
    }

    return null;
  }

  /**
   * Check for chain reactions with strong emotions
   * @param {string} emotion - Current emotion
   * @param {number} intensity - Emotion intensity
   * @returns {string|null} Chain key if triggered
   */
  checkChainReactions(emotion, intensity) {
    // Trigger chains for very strong emotions
    if (Math.abs(intensity) >= 4) {
      if (emotion === 'happy' || emotion === 'excited') {
        return 'very_happy';
      }
      if (emotion === 'angry') {
        return 'very_angry';
      }
      if (emotion === 'excited' && intensity >= 4.5) {
        return 'surprised';
      }
    }

    return null;
  }

  /**
   * Play a chain of videos in sequence
   * @param {string} chainKey - Chain identifier
   * @param {number} voiceDurationMs - Voice duration for timing
   */
  playVideoChain(chainKey, voiceDurationMs = 3000) {
    const chainVideos = this.emotionMap.chains[chainKey];
    if (!chainVideos || chainVideos.length === 0) {
      console.warn(`No chain found for: ${chainKey}`);
      return false;
    }

    console.log(`Playing video chain: ${chainKey} - ${chainVideos.join(' → ')}`);

    // Clear any existing sequence
    this.clearCurrentSequence();

    // Play first video immediately
    this.playVideoWithLooping(chainVideos[0], true);

    // Schedule subsequent videos
    let delay = 1500; // 1.5 seconds for first transition
    for (let i = 1; i < chainVideos.length; i++) {
      const timeout = setTimeout(() => {
        console.log(`Chain transition: ${chainVideos[i - 1]} → ${chainVideos[i]}`);
        this.playVideoWithLooping(chainVideos[i], true);
      }, delay);

      this.sequenceTimeouts.push(timeout);
      delay += 2000; // 2 seconds between each video
    }

    // Schedule return to neutral cycling after voice + chain duration
    const totalChainTime = delay;
    const returnDelay = Math.max(voiceDurationMs, totalChainTime) + 2000;

    const returnTimeout = setTimeout(() => {
      console.log('Chain complete, returning to neutral cycling');
      this.startNeutralCycling();
    }, returnDelay);

    this.sequenceTimeouts.push(returnTimeout);

    this.currentSequence = {
      type: 'chain',
      chainKey: chainKey,
      videos: chainVideos,
      voiceDuration: voiceDurationMs
    };

    this.updateStatus(`Chain: ${chainKey} (${chainVideos.length} videos)`);
    return true;
  }

  /**
   * Get intensity level from score
   * @param {number} score - Sentiment score
   * @returns {string} Intensity level
   */
  getIntensityLevel(score) {
    const absScore = Math.abs(score);
    if (absScore >= 4) return 'high';
    if (absScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Track recently used videos to avoid repetition
   * @param {string} videoFile - Video filename to track
   */
  trackVideoUsage(videoFile) {
    if (!this.recentVideos) {
      this.recentVideos = [];
    }

    // Add to front of array
    this.recentVideos.unshift(videoFile);

    // Keep only last 5 videos
    if (this.recentVideos.length > 5) {
      this.recentVideos = this.recentVideos.slice(0, 5);
    }
  }

  /**
   * Get recently used videos
   * @param {number} count - Number of recent videos to return
   * @returns {string[]} Array of recent video filenames
   */
  getRecentVideos(count = 3) {
    if (!this.recentVideos) {
      this.recentVideos = [];
    }
    return this.recentVideos.slice(0, count);
  }

  /**
   * Switch video based on sentiment score
   * @param {number} score - Sentiment score (-5 to +5)
   * @returns {boolean} Switch success
   */
  switchBySentimentScore(score) {
    let emotion = 'neutral';

    if (score >= 3) {
      emotion = 'positive';
    } else if (score >= 1) {
      emotion = 'positive';
    } else if (score <= -3) {
      emotion = 'angry';
    } else if (score <= -1) {
      emotion = 'negative';
    }

    // Map to configured emotions
    const emotionData = Object.values(this.emotionMap).find(e => e.emotion === emotion);
    if (!emotionData) {
      emotion = 'neutral';
    }

    return this.switchToVideo(emotion);
  }

  /**
   * Update status overlay
   * @param {string} text - Status text
   */
  updateStatus(text) {
    if (this.statusElement) {
      this.statusElement.textContent = text;
    }
  }

  /**
   * Get preloading status
   * @returns {Object} Status info
   */
  getStatus() {
    // Count total unique videos from all sources
    const totalVideos = new Set();

    if (this.emotionMap.emotions) {
      Object.values(this.emotionMap.emotions).forEach(emotionArray => {
        emotionArray.forEach(videoObj => totalVideos.add(videoObj.video));
      });
    }

    if (this.emotionMap.keywords) {
      Object.values(this.emotionMap.keywords).forEach(keywordArray => {
        keywordArray.forEach(videoFile => totalVideos.add(videoFile));
      });
    }

    if (this.emotionMap.chains) {
      Object.values(this.emotionMap.chains).forEach(chainArray => {
        chainArray.forEach(videoFile => totalVideos.add(videoFile));
      });
    }

    return {
      total_videos: totalVideos.size,
      preloaded_videos: this.preloadedVideos.size,
      current_video: this.currentVideo ? this.currentVideo.src.split('/').pop() : null,
      all_prepared: this.preloadedVideos.size === totalVideos.size
    };
  }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoController;
} else if (typeof window !== 'undefined') {
  window.VideoController = VideoController;
}
