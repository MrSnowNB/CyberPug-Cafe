# Cyberpunk Pug Cafe Chatbot

Sentiment-driven chatbot with reactive pug video loops and neon cyberpunk user interface. Built for Cline agent workflows and VSCode, with validation gated assembly and AI-first documentation.

## Quick Start
1. Clone repo, open in VSCode.
2. Ensure all 16 mp4 loops are in `mp4/` folder, named by emotion (see architecture.md for guidelines).
3. Run `npm install` to get dependencies (natural.js).
4. **Set up Coqui XTTS v2 voice server** (see Voice Setup below).
5. Start local development: `npm run dev` or open `index.html`.
6. **Clean shutdown**: Always run `python cleanup.py` before closing VSCode to prevent background processes.
7. Agent-driven assembly: follow steps in `.agent/assembly-guide.md`, which are validation gated. Do not proceed until each gate is passed.

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

## MCP Tool-Calling Integration

The chatbot includes **safe MCP (Model Context Protocol) integration** for Cline tool-calling capabilities:

### 🎛️ **Plan/Act Modes**
- **Plan Mode** (Default): Drafts coding tasks without execution
- **Act Mode**: Sends serialized tasks to Cline MCP for execution
- **UI Toggle**: Clear visual indicator and mode switching

### 📋 **Task Serialization**
Automatic conversion of coding requests to traceable YAML/Markdown tasks:
```yaml
---
task: "Update sad emotion to head_down.mp4"
context: "emotion-map.json"
expected_outcome: "Sad triggers correct video"
validation_gates: [unit, lint, type, docs]
---
```

### 🔍 **Smart Detection**
Automatically identifies coding requests using:
- **Keywords**: update, fix, add, create, function, class, etc.
- **File Extensions**: .js, .py, .json, .css, .html
- **Imperative Language**: "please", "can you", "help me"

### 🛡️ **Safety & Auditability**
- **Manual Mode Control**: No automatic tool execution
- **Full Logging**: Every action timestamped and logged
- **File Traceability**: Tasks saved as downloadable Markdown files
- **Error Handling**: Comprehensive failure capture and recovery

### 📝 **Current Status & Next Steps**
**✅ COMPLETED**: Chatbot-side MCP integration with Plan/Act modes, task serialization, and server status detection.

**⏳ PENDING**: Local MCP server implementation in Cline extension to accept and execute tasks.

**Note**: A local MCP server is required to complete this project. The chatbot foundation is ready - Cline extension needs MCP server endpoints to accept YAML task files and execute them using VSCode APIs. Will resume development when Cline MCP server capabilities are available.

## Enhanced Video System

The chatbot now features a **dynamic multi-video emotion system** that makes full use of all 16 pug videos:

### 🎭 **Emotion Arrays**
Each emotion maps to multiple videos for variety:
- **Happy**: `happy_big_smile.mp4`, `looks_excited.mp4`
- **Curious**: `cute_neutral_head_tilt.mp4`, `hold_up_confused.mp4`
- **Excited**: 6 different videos for maximum expressiveness
- **Neutral**: 2 videos for varied idle states

### 🔑 **Keyword Triggers**
Special responses for contextual keywords:
- **"treat"** → `happy_big_smile.mp4` or `looks_excited.mp4`
- **"walk"** → `i_have_an_idea.mp4` or `looks_excited.mp4`
- **"food"** → `boreed_eats_snack.mp4` or `looks_excited.mp4`
- **"hello/goodbye"** → Greeting-specific videos

### ⚡ **Chain Reactions**
Strong emotions trigger video sequences:
- **Very Happy** (intensity ≥4) → `wide_eyed_shocked.mp4` → `happy_big_smile.mp4`
- **Very Angry** (intensity ≥4) → `agressive_typing_slightly_angry.mp4` → `angry_growling.mp4`
- **Surprised** (intensity ≥4.5) → `wide_eyed_shocked.mp4` → `flower_sneeze.mp4`

### 🎯 **Smart Features**
- **No Repeats**: Avoids playing the same video twice in a row
- **Intensity Filtering**: Matches video intensity to emotion strength
- **State Tracking**: Remembers recent videos and emotions
- **Fallback System**: Gracefully handles missing videos
- **Sad Priority**: "Sad" emotions always trigger head-down video (`sad_puts_head_down.mp4`)

## Files & Structure
- `.agent/` — AI-first docs, gates, guides, architecture
- `.vscode/` — Editor config for Cline/AI agents
- `src/` — Main HTML/CSS/JS assets
- `mp4/` — 16 pug video loops with dynamic mapping
- `src/config/emotion-map.json` — Enhanced emotion-to-video mapping

## AI-First Instructions
- Use Cline agent to auto-assign mp4s to emotion categories by filename.
- Test sentiment analyzer using the test corpus found in `.agent/testing-protocol.md`.
- Human reviewers may override mappings in `config/emotion-map.json` if agent is unsure.

## Testing Gates
- Every assembly step is validation gated (see `.agent/testing-protocol.md`).
- Do not proceed until agent validates outputs.

## Process Management & Cleanup

The chatbot includes background services (TTS server) that may persist after VSCode closes. Always use proper cleanup procedures:

### 🧹 **Cleanup Script**
```bash
# Run cleanup before closing VSCode
python cleanup.py
```

This script will:
- ✅ Gracefully shutdown TTS server via API
- ✅ Kill any remaining Python processes
- ✅ Clean up development servers on common ports (8000, 3000, 8080)
- ✅ Provide status feedback

### 🎛️ **In-App Controls**
The chatbot interface includes:
- **TTS Server Status**: Real-time indicator showing server availability
- **Cleanup Button**: One-click process cleanup from the UI
- **Automatic Monitoring**: Status updates every 30 seconds

### 🔍 **Manual Process Checking**
```bash
# Check for running processes
tasklist | findstr python
netstat -ano | findstr :5000

# Kill specific processes
taskkill /f /pid <PID>
```

### 🚨 **Troubleshooting Persistence**
If processes still run after VSCode closes:

1. **Check Browser Tabs**: Close any open `index.html` instances
2. **Run Cleanup Script**: `python cleanup.py`
3. **Manual Process Kill**: Use Task Manager or command line
4. **VSCode Restart**: Fully close and reopen VSCode

### 📊 **Status Indicators**
- 🟢 **Online**: TTS server healthy and responding
- 🟡 **Degraded**: Server running but with issues
- 🔴 **Offline**: Server not available
- 🔄 **Checking**: Status being verified

## Project Documentation

### Living Documentation (Policy-Required)
- **`PROJECT-POLICY.md`** - Development policy and lifecycle guidelines
- **`TROUBLESHOOTING.md`** - Issue resolution database with systematic entries
- **`REPLICATION-NOTES.md`** - Recurring errors, environment deltas, and setup checklists
- **`ISSUE.md`** - Current issues tracker with resolution status

### Development Resources
- **`.agent/assembly-guide.md`** - Step-by-step Cline assembly instructions
- **`.agent/testing-protocol.md`** - Validation gates and testing requirements
- **`.agent/architecture.md`** - Technical architecture and design decisions
- **`enhancement-plan.md`** - Current development roadmap and progress

## Trouble? See `.agent/assembly-guide.md` for common issues and stepwise troubleshooting.
