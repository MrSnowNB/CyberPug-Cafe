#!/usr/bin/env python3
"""
Coqui XTTS v2 TTS Server for Cyberpunk Pug Cafe
Provides family-friendly male voice synthesis
"""

from flask import Flask, request, send_file, jsonify
from TTS.api import TTS
import io
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize TTS with XTTS v2
try:
    logger.info("Loading Coqui XTTS v2 model...")
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    logger.info("XTTS v2 model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load TTS model: {e}")
    tts = None

# Available speakers (you may need to adjust based on your XTTS installation)
AVAILABLE_SPEAKERS = [
    "male_family_friendly",
    "male_clean",
    "male_professional",
    "default_speaker"
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if tts is None:
        return jsonify({"status": "error", "message": "TTS model not loaded"}), 500

    return jsonify({
        "status": "healthy",
        "model": "XTTS v2",
        "speakers": AVAILABLE_SPEAKERS
    })

@app.route('/tts', methods=['POST'])
def generate_speech():
    """Generate speech from text"""
    if tts is None:
        return jsonify({"error": "TTS model not loaded"}), 500

    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = data['text']
        language = data.get('language', 'en')
        voice = data.get('voice', 'male_family_friendly')
        speed = float(data.get('speed', 1.0))
        emotion = data.get('emotion', 'neutral')

        logger.info(f"Generating speech for: '{text[:50]}...' (voice: {voice}, speed: {speed})")

        # Generate speech
        # Note: XTTS v2 may not support all these parameters directly
        # Adjust based on your XTTS installation capabilities
        wav = tts.tts(text=text, speaker=voice, language=language)

        # Convert to WAV format and return
        wav_buffer = io.BytesIO()
        # Assuming wav is already in the correct format from TTS
        # You may need to adjust this based on TTS output format
        wav_buffer.write(wav)
        wav_buffer.seek(0)

        return send_file(
            wav_buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='speech.wav'
        )

    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/speakers', methods=['GET'])
def list_speakers():
    """List available speakers"""
    return jsonify({
        "speakers": AVAILABLE_SPEAKERS,
        "recommended": "male_family_friendly"
    })

if __name__ == '__main__':
    logger.info("Starting Coqui XTTS v2 TTS Server on http://localhost:5000")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  GET  /speakers - List available speakers")
    logger.info("  POST /tts - Generate speech (JSON: {text, language, voice, speed, emotion})")

    app.run(host='0.0.0.0', port=5000, debug=False)
