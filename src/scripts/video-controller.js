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
      console.log('Emotion map loaded:', Object.keys(this.emotionMap).length, 'entries');
      return this.emotionMap;
    } catch (error) {
      console.error('Error loading emotion map:', error);
      // Fallback empty map
      this.emotionMap = {};
      return {};
    }
  }

  /**
   * Preload all video files from mp4 directory
   */
  async preloadVideos() {
    const videoFiles = Object.keys(this.emotionMap);
    this.updateStatus(`Preloading ${videoFiles.length} videos...`);

    const preloadPromises = videoFiles.map(async (filename) => {
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
      this.updateStatus(`${videoFiles.length} videos preloaded successfully`);
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
   * @returns {boolean} Success status
   */
  switchToVideoForVoice(emotion, voiceDurationMs = 3000, withTransition = true) {
    // Clear any existing sequence
    this.clearCurrentSequence();

    const startTime = performance.now();

    // Find emotion video
    const emotionVideoFile = this.findVideoForEmotion(emotion);
    if (!emotionVideoFile) {
      console.warn(`No video found for emotion: ${emotion}`);
      this.updateStatus(`No video for ${emotion}`);
      return false;
    }

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

    // Schedule return to neutral cycling after voice completes
    const returnToNeutralTimeout = setTimeout(() => {
      console.log('Voice complete, returning to neutral video cycling');
      this.startNeutralCycling();
    }, voiceDurationMs);

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

      // Set up cycling every 8-12 seconds
      const cycleInterval = 8000 + Math.random() * 4000; // 8-12 seconds

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
   * Find video filename for given emotion with context awareness
   * @param {string} emotion - Emotion category
   * @param {number} intensity - Sentiment intensity (-5 to +5)
   * @param {string} context - Optional context for better matching
   * @returns {string|null} Video filename
   */
  findVideoForEmotion(emotion, intensity = 0, context = null) {
    // Find videos matching the emotion
    const matches = Object.entries(this.emotionMap).filter(([filename, data]) => {
      return data.emotion === emotion;
    });

    if (matches.length === 0) {
      // Handle sub-emotions and fallbacks
      if (emotion === 'curious' || emotion === 'waiting' || emotion === 'focused') {
        return this.findVideoForEmotion('neutral', intensity, context);
      }

      // General fallback - pick any video
      const allVideos = Object.entries(this.emotionMap);
      return allVideos.length > 0 ? allVideos[0][0] : null;
    }

    // Filter by intensity if specified
    let filteredMatches = matches;
    if (intensity !== 0) {
      const intensityLevel = this.getIntensityLevel(intensity);
      filteredMatches = matches.filter(([filename, data]) => {
        return data.intensity === intensityLevel;
      });

      // Fallback to any intensity if no matches
      if (filteredMatches.length === 0) {
        filteredMatches = matches;
      }
    }

    // Avoid repeating the same video recently (last 3 videos)
    const recentVideos = this.getRecentVideos(3);
    const availableMatches = filteredMatches.filter(([filename]) => {
      return !recentVideos.includes(filename);
    });

    // Use available matches, or fall back to all if we've exhausted options
    const finalMatches = availableMatches.length > 0 ? availableMatches : filteredMatches;

    // Random selection from final matches
    const randomIndex = Math.floor(Math.random() * finalMatches.length);
    const selectedVideo = finalMatches[randomIndex][0];

    // Track this video as recently used
    this.trackVideoUsage(selectedVideo);

    return selectedVideo;
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
    return {
      total_videos: Object.keys(this.emotionMap).length,
      preloaded_videos: this.preloadedVideos.size,
      current_video: this.currentVideo ? this.currentVideo.src.split('/').pop() : null,
      all_prepared: this.preloadedVideos.size === Object.keys(this.emotionMap).length
    };
  }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoController;
} else if (typeof window !== 'undefined') {
  window.VideoController = VideoController;
}
