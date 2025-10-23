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
   * Switch to video sequence based on emotion (6s emotion + 12s typing)
   * @param {string} emotion - Emotion category
   * @param {boolean} withTransition - Whether to add transition effects
   * @returns {boolean} Success status
   */
  switchToVideo(emotion, withTransition = true) {
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

    // Always use typing video for the follow-up sequence
    const typingVideoFile = this.findVideoForEmotion('neutral'); // Get any neutral video

    console.log(`Starting sequence: ${emotion} (${emotionVideoFile}) → typing (${typingVideoFile})`);

    // Start with emotion video (6 seconds)
    this.playVideo(emotionVideoFile, withTransition);

    // Set up sequence: 6s emotion → 12s typing (2 loops)
    this.currentSequence = {
      emotion: emotion,
      videos: [emotionVideoFile, typingVideoFile],
      duration: 18000, // 18 seconds total
      startTime: startTime
    };

    // Schedule transition to typing video after 6 seconds (with looping)
    const emotionTimeout = setTimeout(() => {
      console.log('Sequence: Emotion complete, switching to typing (2 loops)');
      this.playVideoWithLoops(typingVideoFile, false, 2); // Loop typing video twice
      this.updateStatus(`${emotion} → typing | 12s remaining`);
    }, 6000);

    // Schedule sequence end (will restart with new emotion)
    const endTimeout = setTimeout(() => {
      console.log('Sequence complete, ready for next emotion');
      this.clearCurrentSequence();
    }, 18000);

    this.sequenceTimeouts = [emotionTimeout, endTimeout];

    const endTime = performance.now();
    const switchTime = endTime - startTime;

    this.updateStatus(`${emotion} → sequence | ${switchTime.toFixed(1)}ms`);
    console.log(`Started 18s sequence: ${emotionVideoFile} → ${typingVideoFile} (${switchTime.toFixed(1)}ms)`);

    return switchTime < 300;
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
   * Find video filename for given emotion
   * @param {string} emotion - Emotion category
   * @returns {string|null} Video filename
   */
  findVideoForEmotion(emotion) {
    // Find videos in emotion range
    const matches = Object.entries(this.emotionMap).filter(([filename, data]) => {
      return data.emotion === emotion;
    });

    if (matches.length === 0) {
      // For neutral sub-emotions, fallback to regular neutral videos
      if (emotion === 'curious' || emotion === 'waiting' || emotion === 'focused') {
        return this.findVideoForEmotion('neutral');
      }

      // General fallback - pick any video
      const allVideos = Object.entries(this.emotionMap);
      return allVideos.length > 0 ? allVideos[0][0] : null;
    }

    // Random selection from matching videos
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex][0];
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
