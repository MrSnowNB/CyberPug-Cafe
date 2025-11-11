// Cyberpunk Pug Cafe Voice Controller
// Coqui XTTS v2-based TTS with cyberpunk pug hacker persona

class VoiceController {
    constructor() {
        this.ttsServerUrl = 'http://localhost:5000/tts';
        this.audioContext = null;
        this.currentAudio = null;
        this.isSpeaking = false;
        this.voiceQueue = [];
        this.isEnabled = true;
        this.volume = 0.8;
        this.codingMode = false;

        // Coqui XTTS v2 voice characteristics
        this.voiceProfiles = {
            casual: {
                speed: 1.0,      // Normal speed
                emotion: 'neutral'
            },
            coding: {
                speed: 1.1,      // Slightly faster for technical content
                emotion: 'neutral'
            },
            excited: {
                speed: 1.2,      // Faster for excitement
                emotion: 'excited'
            },
            confused: {
                speed: 0.9,      // Slower for thoughtfulness
                emotion: 'confused'
            },
            angry: {
                speed: 0.95,     // Measured pace for seriousness
                emotion: 'angry'
            }
        };

        console.log('Voice controller initialized (Coqui XTTS v2)');
    }

    /**
     * Initialize voice system with fallback options
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            // Initialize Web Audio API for playback
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Try Coqui XTTS v2 first
            const isCoquiConnected = await this.testServerConnection();
            if (isCoquiConnected) {
                console.log('Voice controller ready (Coqui XTTS v2 connected)');
                this.ttsMode = 'coqui';
                return true;
            }

            // Fallback to Web Speech API
            console.warn('Coqui XTTS v2 server not available, falling back to Web Speech API');
            console.warn('To enable high-quality voice, run: python tts_server.py');

            if ('speechSynthesis' in window) {
                this.ttsMode = 'webspeech';
                this.synth = window.speechSynthesis;
                await this.initializeWebSpeech();
                console.log('Voice controller ready (Web Speech API fallback)');
                return true;
            }

            console.warn('No TTS system available');
            this.isEnabled = false;
            return false;

        } catch (error) {
            console.error('Voice controller initialization failed:', error);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * Initialize Web Speech API as fallback
     */
    async initializeWebSpeech() {
        // Wait for voices to load
        const voices = this.synth.getVoices();
        if (voices.length === 0) {
            await new Promise(resolve => {
                this.synth.onvoiceschanged = resolve;
                setTimeout(resolve, 1000); // Fallback timeout
            });
        }

        // Set up voice profiles for Web Speech
        this.webSpeechProfiles = {
            casual: { pitch: 1.2, rate: 0.9 },
            coding: { pitch: 0.9, rate: 1.0 },
            excited: { pitch: 1.4, rate: 1.1 },
            confused: { pitch: 1.1, rate: 0.8 },
            angry: { pitch: 0.8, rate: 0.9 }
        };

        // Select best available voice
        this.selectWebSpeechVoice();
    }

    /**
     * Select best Web Speech API voice
     */
    selectWebSpeechVoice() {
        const voices = this.synth.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

        // Prefer male voices for fallback
        const maleVoices = englishVoices.filter(voice =>
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('james') ||
            voice.name.toLowerCase().includes('zira') // Zira is female but clear
        );

        if (maleVoices.length > 0) {
            this.webSpeechVoice = maleVoices[0];
        } else if (englishVoices.length > 0) {
            this.webSpeechVoice = englishVoices[0];
        } else if (voices.length > 0) {
            this.webSpeechVoice = voices[0];
        }

        console.log('Web Speech voice selected:', this.webSpeechVoice?.name || 'none');
    }

    /**
     * Test connection to TTS server
     * @returns {Promise<boolean>} Connection status
     */
    async testServerConnection() {
        try {
            const response = await fetch(this.ttsServerUrl.replace('/tts', '/health'), {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return response.ok;
        } catch (error) {
            console.warn('TTS server connection test failed:', error.message);
            return false;
        }
    }

    /**
     * Speak text using available TTS system (Coqui XTTS v2 or Web Speech API fallback)
     * @param {string} text - Text to speak
     * @param {Object} sentiment - Sentiment analysis result
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} Success status
     */
    async speak(text, sentiment = {}, options = {}) {
        if (!this.isEnabled) {
            console.log('Voice synthesis not available');
            return false;
        }

        // Clean and prepare text
        const cleanText = this.prepareTextForSpeech(text);
        if (!cleanText) {
            return false;
        }

        // Add cyberpunk flair
        const finalText = this.addCyberpunkFlair(cleanText, sentiment);

        // Use appropriate TTS method based on what's available
        if (this.ttsMode === 'coqui') {
            return this.speakWithCoqui(finalText, sentiment, options);
        } else if (this.ttsMode === 'webspeech') {
            return this.speakWithWebSpeech(finalText, sentiment, options);
        } else {
            console.warn('No TTS system available');
            return false;
        }
    }

    /**
     * Speak using Coqui XTTS v2 server
     */
    async speakWithCoqui(text, sentiment, options) {
        // Determine voice profile
        const voiceProfile = this.getVoiceProfile(sentiment, options);

        return new Promise(async (resolve) => {
            try {
                // Stop any current audio
                this.stopCurrentAudio();

                this.isSpeaking = true;
                console.log('Requesting Coqui TTS for:', text.substring(0, 50) + '...');

                // Request TTS from server
                const response = await fetch(this.ttsServerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        language: 'en',
                        voice: 'male_family_friendly',
                        speed: voiceProfile.speed,
                        emotion: voiceProfile.emotion
                    })
                });

                if (!response.ok) {
                    throw new Error(`TTS server error: ${response.status}`);
                }

                // Get audio data
                const audioBlob = await response.blob();

                // Create audio element for playback
                const audioUrl = URL.createObjectURL(audioBlob);
                this.currentAudio = new Audio(audioUrl);
                this.currentAudio.volume = this.volume;

                // Set up event handlers
                this.currentAudio.onended = () => {
                    this.isSpeaking = false;
                    URL.revokeObjectURL(audioUrl);
                    console.log('Finished Coqui TTS');
                    resolve(true);
                    this.processQueue();
                };

                this.currentAudio.onerror = (error) => {
                    this.isSpeaking = false;
                    URL.revokeObjectURL(audioUrl);
                    console.error('Coqui audio playback error:', error);
                    resolve(false);
                    this.processQueue();
                };

                // Start playback
                await this.currentAudio.play();

            } catch (error) {
                this.isSpeaking = false;
                console.error('Coqui TTS request failed:', error);
                resolve(false);
                this.processQueue();
            }
        });
    }

    /**
     * Speak using Web Speech API fallback
     */
    async speakWithWebSpeech(text, sentiment, options) {
        if (!this.synth || !this.webSpeechVoice) {
            console.warn('Web Speech API not available');
            return false;
        }

        // Determine voice profile
        const voiceProfile = this.getWebSpeechProfile(sentiment, options);

        return new Promise((resolve) => {
            // Stop any current speech
            this.synth.cancel();

            this.isSpeaking = true;
            console.log('Using Web Speech API for:', text.substring(0, 50) + '...');

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.webSpeechVoice;
            utterance.pitch = voiceProfile.pitch;
            utterance.rate = voiceProfile.rate;
            utterance.volume = this.volume;

            // Add cyberpunk flair (already added to text)

            utterance.onstart = () => {
                console.log('Started Web Speech');
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                console.log('Finished Web Speech');
                resolve(true);
                this.processQueue();
            };

            utterance.onerror = (error) => {
                this.isSpeaking = false;
                console.error('Web Speech error:', error);
                resolve(false);
                this.processQueue();
            };

            // Speak
            this.synth.speak(utterance);
        });
    }

    /**
     * Get Web Speech API voice profile
     */
    getWebSpeechProfile(sentiment, options) {
        const emotion = sentiment.emotion || 'neutral';
        const context = sentiment.context || 'general';

        // Determine base profile
        let baseProfile = 'casual';

        if (context === 'coding' || options.codingMode) {
            baseProfile = 'coding';
        }

        // Override with emotion-specific profiles
        switch (emotion) {
            case 'excited':
            case 'happy':
                return { ...this.webSpeechProfiles.excited, ...this.webSpeechProfiles[baseProfile] };
            case 'confused':
            case 'scared':
                return { ...this.webSpeechProfiles.confused, ...this.webSpeechProfiles[baseProfile] };
            case 'angry':
            case 'sad':
                return { ...this.webSpeechProfiles.angry, ...this.webSpeechProfiles[baseProfile] };
            default:
                return this.webSpeechProfiles[baseProfile];
        }
    }

    /**
     * Stop current audio playback
     */
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            if (this.currentAudio.src) {
                URL.revokeObjectURL(this.currentAudio.src);
            }
            this.currentAudio = null;
        }
        this.isSpeaking = false;
    }

    /**
     * Get appropriate voice profile based on sentiment
     * @param {Object} sentiment - Sentiment analysis result
     * @param {Object} options - Additional options
     * @returns {Object} Voice profile settings
     */
    getVoiceProfile(sentiment, options) {
        const emotion = sentiment.emotion || 'neutral';
        const context = sentiment.context || 'general';

        // Determine base profile
        let baseProfile = 'casual';

        if (context === 'coding' || options.codingMode) {
            baseProfile = 'coding';
        }

        // Override with emotion-specific profiles
        switch (emotion) {
            case 'excited':
            case 'happy':
                return { ...this.voiceProfiles.excited, ...this.voiceProfiles[baseProfile] };
            case 'confused':
            case 'scared':
                return { ...this.voiceProfiles.confused, ...this.voiceProfiles[baseProfile] };
            case 'angry':
            case 'sad':
                return { ...this.voiceProfiles.angry, ...this.voiceProfiles[baseProfile] };
            default:
                return this.voiceProfiles[baseProfile];
        }
    }

    /**
     * Prepare text for speech synthesis
     * @param {string} text - Raw text
     * @returns {string} Cleaned text
     */
    prepareTextForSpeech(text) {
        return text
            .replace(/[🐶🎉💻⚡🎮🔥🌟💡]/g, '') // Remove emojis
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
            .substring(0, 200); // Limit length
    }

    /**
     * Add cyberpunk flair to speech text
     * @param {string} text - Clean text
     * @param {Object} sentiment - Sentiment context
     * @returns {string} Text with cyberpunk flair
     */
    addCyberpunkFlair(text, sentiment) {
        // Add occasional Japanese tech slang based on context
        const cyberpunkTerms = {
            excited: ['Yatta!', 'Sugoi!', 'Kawaii!'],
            confused: ['Eh?', 'Nani?', 'Chotto matte'],
            angry: ['Dame da!', 'Yabai!', 'Urusai!'],
            coding: ['Debug desu', 'Code wa ikite iru', 'Hack shimasu']
        };

        // 20% chance to add flair for emotional responses
        if (Math.random() < 0.2 && sentiment.emotion !== 'neutral') {
            const terms = cyberpunkTerms[sentiment.emotion] || cyberpunkTerms[sentiment.context] || [];
            if (terms.length > 0) {
                const term = terms[Math.floor(Math.random() * terms.length)];
                return text + '. ' + term;
            }
        }

        return text;
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.ttsMode === 'coqui') {
            this.stopCurrentAudio();
        } else if (this.ttsMode === 'webspeech' && this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
        this.voiceQueue = [];
    }

    /**
     * Pause/resume speech
     */
    pause() {
        if (this.ttsMode === 'coqui' && this.currentAudio && this.isSpeaking) {
            this.currentAudio.pause();
        } else if (this.ttsMode === 'webspeech' && this.synth) {
            // Web Speech API doesn't support pause/resume well
            this.synth.cancel();
            this.isSpeaking = false;
        }
    }

    resume() {
        if (this.ttsMode === 'coqui' && this.currentAudio && this.isSpeaking) {
            this.currentAudio.play().catch(e => console.error('Resume failed:', e));
        }
        // Web Speech API resume not supported
    }

    /**
     * Set voice volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }

    /**
     * Enable/disable voice synthesis
     * @param {boolean} enabled - Whether voice is enabled
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    /**
     * Check if voice synthesis is available and enabled
     * @returns {boolean} Availability status
     */
    isAvailable() {
        return this.isEnabled && !!this.audioContext;
    }

    /**
     * Get voice status information
     * @returns {Object} Status info
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            available: this.isAvailable(),
            speaking: this.isSpeaking,
            server: this.ttsServerUrl,
            volume: this.volume,
            queueLength: this.voiceQueue.length
        };
    }

    /**
     * Process voice queue (called when current speech ends)
     */
    processQueue() {
        if (this.voiceQueue.length > 0 && !this.isSpeaking) {
            // Process queued text (simplified - in practice you'd need to store the full speak parameters)
            console.log('Processing voice queue not implemented for Coqui TTS');
        }
    }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceController;
} else if (typeof window !== 'undefined') {
    window.VoiceController = VoiceController;
}
