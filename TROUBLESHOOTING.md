# Troubleshooting Guide - Cyberpunk Pug Cafe Chatbot

## Overview
This document contains troubleshooting entries for issues encountered during development and deployment of the Cyberpunk Pug Cafe chatbot. Each entry follows the required schema for systematic problem resolution.

## Entries

### TTS Server Persistence After VSCode Shutdown

**Context:** The chatbot's TTS server (Python Flask application) was continuing to run in the background after closing VSCode, causing port conflicts and resource usage.

**Symptom:** Python processes remained active after VSCode closure, TTS server accessible on localhost:5000 even when not intended.

**Error Snippet:**
```
(.venv) C:\Users\AMD\Desktop\cyberpunk-pug-cafe>tasklist | findstr python
python.exe                  12345 Console                    1     45,678 K
```

**Probable Cause:** Flask development server doesn't handle SIGTERM signals properly on Windows, and VSCode doesn't send proper shutdown signals to background Python processes.

**Quick Fix:**
```bash
# Run cleanup script
python cleanup.py
```

**Permanent Fix:**
- Added signal handlers (SIGINT/SIGTERM) to TTS server
- Implemented graceful shutdown via API endpoint (`POST /shutdown`)
- Created comprehensive cleanup script with port-based process detection
- Added UI controls for real-time monitoring and cleanup

**Prevention:**
- Always run `python cleanup.py` before closing VSCode
- Use the in-app cleanup button for immediate process termination
- Monitor TTS server status indicator in the UI
- Implement proper signal handling in all background services

### Video Loading Path Issues

**Context:** Video files not loading correctly in the web application, causing broken video elements.

**Symptom:** Pug videos not playing, console errors about missing files, fallback messages displayed.

**Error Snippet:**
```
Failed to load resource: net::ERR_FILE_NOT_FOUND file:///C:/Users/AMD/Desktop/cyberpunk-pug-cafe/mp4/happy_big_smile.mp4
```

**Probable Cause:** Incorrect path resolution from `../mp4/` to `./mp4/` relative to HTML file location.

**Quick Fix:**
Update video controller path resolution from `../mp4/` to `./mp4/`

**Permanent Fix:**
- Corrected path resolution in `video-controller.js`
- Standardized all asset paths relative to `index.html` location
- Added path validation and fallback handling

**Prevention:**
- Use consistent path resolution patterns
- Test video loading in different directory structures
- Include path validation in development workflow

### Sentiment Analysis Verbosity Issues

**Context:** Chatbot responses were too verbose and technical for casual conversation.

**Symptom:** Responses exceeded 1-2 sentence limit, felt more like coding assistance than friendly chat.

**Error Snippet:**
```
Response time: 1250.50ms (SLOW)
⚠️ Response latency exceeded 2s requirement
```

**Probable Cause:** Ollama prompts not optimized for concise, context-aware responses in casual chat scenarios.

**Quick Fix:**
Updated prompt engineering to specify 1-2 sentence maximum responses for non-coding conversations.

**Permanent Fix:**
- Implemented context-aware response length limits
- Added coding mode detection to adjust verbosity
- Optimized sentiment analysis for faster processing

**Prevention:**
- Include response length requirements in prompt engineering
- Test response times during development
- Implement performance monitoring and alerts

### MCP Server Connection Failures

**Context:** MCP integration failing to connect to localhost:3000 for task execution.

**Symptom:** Tasks drafted successfully but execution fails with connection errors.

**Error Snippet:**
```
💾 MCP server not available. Task saved locally as "task_123.md" for manual processing.
```

**Probable Cause:** Cline extension MCP server implementation not yet available, causing expected connection failures.

**Quick Fix:**
Tasks are automatically saved locally as Markdown files for manual processing.

**Permanent Fix:**
- Implemented graceful fallback to local file saving
- Added comprehensive error handling and user feedback
- Created task serialization format for future MCP integration

**Prevention:**
- Design with graceful degradation in mind
- Provide clear user feedback for all error states
- Implement comprehensive logging for debugging

### Web Speech API Fallback Issues

**Context:** Browser compatibility issues with Web Speech API causing voice synthesis failures.

**Symptom:** Voice not working in certain browsers or configurations.

**Error Snippet:**
```
Speech synthesis not supported in this browser
```

**Probable Cause:** Browser compatibility issues or security restrictions preventing speech synthesis.

**Quick Fix:**
Application automatically falls back to text-only mode with visual indicators.

**Permanent Fix:**
- Implemented comprehensive fallback system
- Added browser compatibility detection
- Enhanced error handling for speech synthesis failures

**Prevention:**
- Test across multiple browsers during development
- Implement graceful degradation for all features
- Provide clear user feedback about feature availability
