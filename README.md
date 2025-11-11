# Cyberpunk Pug Cafe Chatbot

Sentiment-driven chatbot with reactive pug video loops and neon cyberpunk user interface. Built for Cline agent workflows and VSCode, with validation gated assembly and AI-first documentation.

## Quick Start
1. Clone repo, open in VSCode.
2. Ensure all 16 mp4 loops are in `mp4/` folder, named by emotion (see architecture.md for guidelines).
3. Run `npm install` to get dependencies (natural.js).
4. **Set up Coqui XTTS v2 voice server** (see Voice Setup below).
5. Start local development: `npm run dev` or open `index.html`.
6. Agent-driven assembly: follow steps in `.agent/assembly-guide.md`, which are validation gated. Do not proceed until each gate is passed.

## Voice Setup (Coqui XTTS v2)

The chatbot uses Coqui XTTS v2 for high-quality, family-friendly male voice synthesis.

### Quick Setup (Recommended)
```bash
# Run the automated setup script
python setup_tts.py
```

This will:
- ✅ Check Python version
- ✅ Install all dependencies
- ✅ Download the XTTS v2 model (~1.5GB)
- ✅ Verify everything works

### Manual Installation
```bash
# Install Python dependencies
pip install coqui-tts flask torch torchaudio

# Download XTTS v2 model (this may take a while)
python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"
```

### Running the Voice Server
```bash
# Start the TTS server
python tts_server.py
```

The server will run on `http://localhost:5000` and provide:
- `GET /health` - Health check
- `GET /speakers` - List available voices
- `POST /tts` - Generate speech

### Voice Configuration
- **Default Voice**: `male_family_friendly` (family-friendly male voice)
- **Language**: English
- **Features**: Emotion-based modulation, cyberpunk flair, coding mode detection

### Current Status
- ✅ **Web Speech API Fallback**: Works immediately (Microsoft David male voice)
- 🔄 **Coqui XTTS v2**: Premium voice available after setup
- 🔄 **Automatic Detection**: System switches to premium voice when server is running

### Troubleshooting
- If TTS server fails to start, check Python version and dependencies
- Voice automatically falls back to Web Speech API if server unavailable
- Check browser console for connection errors
- Pylance import warnings are normal until TTS is installed

## Files & Structure
- `.agent/` — AI-first docs, gates, guides, architecture
- `.vscode/` — Editor config for Cline/AI agents
- `src/` — Main HTML/CSS/JS assets
- `mp4/` — Video loops (see auto-mapping guide)

## AI-First Instructions
- Use Cline agent to auto-assign mp4s to emotion categories by filename.
- Test sentiment analyzer using the test corpus found in `.agent/testing-protocol.md`.
- Human reviewers may override mappings in `config/emotion-map.json` if agent is unsure.

## Testing Gates
- Every assembly step is validation gated (see `.agent/testing-protocol.md`).
- Do not proceed until agent validates outputs.

## Trouble? See `.agent/assembly-guide.md` for common issues and stepwise troubleshooting.
