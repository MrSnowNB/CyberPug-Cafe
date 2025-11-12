# Replication Notes - Cyberpunk Pug Cafe Chatbot

## Overview
This document records recurring errors, flaky tests, environment/hardware deltas, and known pitfalls encountered during development. Used to improve reliability and prevent repeated issues.

## Known Pitfalls to Avoid

### Python Process Persistence on Windows
**Issue:** Python Flask servers continue running after VSCode closes, causing port conflicts.
**Frequency:** High - occurs in every development session without proper cleanup.
**Impact:** Port 5000 conflicts, resource leaks, confusing debugging.
**Prevention:**
- Always run `python cleanup.py` before closing VSCode
- Use the in-app cleanup button during development
- Monitor Task Manager for orphaned python.exe processes
- Implement signal handlers in all background services

### Browser Cache Issues with Video Assets
**Issue:** Updated MP4 files not loading due to aggressive browser caching.
**Frequency:** Medium - occurs when modifying video files during development.
**Impact:** Changes not visible, debugging confusion.
**Prevention:**
- Hard refresh (Ctrl+F5) after video file changes
- Clear browser cache for localhost
- Use cache-busting query parameters in development
- Test video loading after any MP4 modifications

### Web Speech API Browser Inconsistencies
**Issue:** Speech synthesis behaves differently across browsers and configurations.
**Frequency:** Medium - varies by browser and system settings.
**Impact:** Voice features unreliable for some users.
**Prevention:**
- Test across Chrome, Firefox, Edge during development
- Implement comprehensive fallback to text-only mode
- Check browser compatibility before enabling voice features
- Provide clear user feedback about voice availability

## Recurring Errors

### Flask Signal Handling on Windows
**Error Pattern:** SIGTERM not properly handled by Flask development server.
**Symptoms:** Server continues running after Ctrl+C or VSCode closure.
**Root Cause:** Windows signal handling differences vs Unix-like systems.
**Workaround:** Use API-based shutdown (`POST /shutdown`) instead of signals.
**Status:** Resolved with signal handlers and API endpoint.

### Video Path Resolution Inconsistencies
**Error Pattern:** Videos load in some contexts but fail in others.
**Symptoms:** `ERR_FILE_NOT_FOUND` for MP4 files.
**Root Cause:** Inconsistent relative path handling between development and production.
**Workaround:** Use absolute paths relative to `index.html` location.
**Status:** Resolved with standardized path resolution.

### Sentiment Analysis Performance Degradation
**Error Pattern:** Response times exceed 2s requirement under load.
**Symptoms:** Slow responses, timeout warnings in console.
**Root Cause:** Complex sentiment analysis on long messages.
**Workaround:** Implement message length limits and async processing.
**Status:** Resolved with performance optimizations.

## Flaky Tests

### TTS Server Health Check
**Flakiness:** Occasionally fails during startup due to timing issues.
**Symptoms:** Health endpoint returns 500 during model loading.
**Mitigation:** Add retry logic with exponential backoff.
**Status:** Improved with better error handling.

### Video Loading Tests
**Flakiness:** Browser-dependent video loading behavior.
**Symptoms:** Tests pass in one browser but fail in another.
**Mitigation:** Use headless browser testing with consistent environment.
**Status:** Needs dedicated cross-browser testing setup.

## Environment/Hardware Deltas

### Windows vs Unix Development
**Delta:** Signal handling, process management, path separators.
**Impact:** Code works on one platform but fails on another.
**Mitigation:** Use cross-platform libraries, test on multiple OS.
**Status:** Improved with platform-agnostic implementations.

### GPU Memory Constraints
**Delta:** Systems with/without CUDA support for TTS models.
**Impact:** Model loading fails on CPU-only systems.
**Mitigation:** Graceful fallback to CPU inference, clear error messages.
**Status:** Resolved with automatic hardware detection.

### Network Port Availability
**Delta:** Port 5000 may be in use by other applications.
**Impact:** TTS server fails to start with "port already in use".
**Mitigation:** Port scanning and automatic fallback to available ports.
**Status:** Resolved with cleanup script and port checking.

## Replicable Setup Checklist

### Development Environment Setup
- [ ] Python 3.8+ installed and in PATH
- [ ] Node.js and npm available
- [ ] Git configured with user credentials
- [ ] VSCode with recommended extensions
- [ ] All 16 MP4 files in `mp4/` directory

### First-Time Project Setup
- [ ] Clone repository to clean directory
- [ ] Run `npm install` for dependencies
- [ ] Execute `python setup_tts.py` for voice setup
- [ ] Verify all video files load in browser
- [ ] Test basic chat functionality

### Pre-Development Session
- [ ] Run `python cleanup.py` to clear any lingering processes
- [ ] Check port 5000 availability with `netstat -ano | findstr :5000`
- [ ] Verify TTS server starts with `python tts_server.py`
- [ ] Open `src/index.html` in browser and test interface

### Post-Development Cleanup
- [ ] Run `python cleanup.py` before closing VSCode
- [ ] Check Task Manager for orphaned processes
- [ ] Clear browser cache if video changes were made
- [ ] Verify no python.exe processes remain running

### Troubleshooting Verification
- [ ] All videos load without console errors
- [ ] TTS server responds to health checks
- [ ] Chat responses are under 2 seconds
- [ ] No port conflicts on 5000, 8000, 3000, 8080
- [ ] MCP mode switching works correctly

## Performance Benchmarks

### Target Metrics
- **Response Time:** < 2 seconds for chat responses
- **Video Load Time:** < 500ms for MP4 files
- **TTS Generation:** < 1 second for voice synthesis
- **Memory Usage:** < 100MB for full application
- **CPU Usage:** < 20% during normal operation

### Known Performance Impacts
- Large sentiment analysis on very long messages (>500 chars)
- Multiple video preloading during startup
- TTS model loading time (~30 seconds on first run)
- Browser cache misses for static assets

## Hardware Requirements

### Minimum Specifications
- **CPU:** Dual-core 2.5GHz
- **RAM:** 4GB
- **Storage:** 2GB free space
- **Network:** Stable internet for TTS model download

### Recommended Specifications
- **CPU:** Quad-core 3.0GHz+
- **RAM:** 8GB+
- **Storage:** SSD with 5GB+ free space
- **GPU:** CUDA-compatible (optional, for faster TTS)

## Browser Compatibility

### Fully Supported
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Known Limitations
- Internet Explorer: Not supported (ES6+ requirements)
- Mobile browsers: Limited video and speech support
- Incognito/Private modes: May have caching issues
