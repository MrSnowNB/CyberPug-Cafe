# Cyberpunk Pug Cafe Enhancement Plan: Interactive MP4 Switching & Voice Integration

## Overview
Enhance the chatbot's MP4 switching system for more natural, semantic interactions using all 16 video clips. Add open-source voice synthesis matching the cyberpunk pug hacker persona for both casual chat and coding assistance.

## Current State Analysis
- **16 MP4 files available** but emotion mapping is incomplete/mismatched
- **Sentiment analysis** uses basic word scoring with limited semantic understanding
- **Video switching** follows rigid sequences rather than natural emotion flow
- **No voice integration** - purely text-based responses
- **Neutral state** limited to single video instead of varied neutral expressions

## Phase 1: Enhanced MP4 Switching System

### Step 1.1: Comprehensive Emotion Mapping
**Objective:** Map all 16 MP4 files to semantically appropriate emotions with multiple neutral variants.

**Semantic Analysis of Available Videos:**
- **Angry/Aggressive:** `agressive typing slightly angry.mp4`, `Angry growling.mp4`
- **Bored:** `Bored with the fly.mp4`, `Boreed eats snack.mp4`
- **Confused:** `hold up, confused.mp4`
- **Excited/Ideas:** `i have an idea.mp4`, `looks excited.mp4`, `flower sneeze.mp4`, `surprised glow.mp4`, `wide eyed shocked.mp4`
- **Happy:** `Happy big smile.mp4`
- **Neutral/Calm:** `cute neutral head tilt.mp4`, `neutral tongue thing.mp4`, `Neutral typing.mp4`
- **Sad:** `sad puts head down.mp4`
- **Scared/Nervous:** `typing slightly scared.mp4`

**Validation Gate 1.1:** All 16 videos mapped with no duplicates or unmapped files.

### Step 1.2: Improved Sentiment Analysis
**Objective:** Enhance semantic understanding beyond word scoring.

**Enhancements:**
- Context-aware analysis (question detection, command recognition)
- Multi-word phrase recognition
- Coding-specific sentiment detection (frustration with bugs, excitement with solutions)
- Conversation flow awareness (escalating/de-escalating emotions)

**Validation Gate 1.2:** Sentiment accuracy >85% on expanded test corpus including coding scenarios.

### Step 1.3: Dynamic Video Sequencing
**Objective:** Replace rigid sequences with natural emotion flow.

**New Logic:**
- Emotion persistence with gradual transitions
- Multiple neutral variants for varied interactions
- Context-aware switching (don't repeat same video immediately)
- Intensity-based selection (mild vs strong emotions)

**Validation Gate 1.3:** All videos appear naturally in 5-minute chat session without feeling scripted.

## Phase 2: Voice Integration

### Step 2.1: Voice Synthesis Setup
**Objective:** Integrate open-source TTS matching pug hacker persona.

**Requirements:**
- Open-source TTS engine (Coqui TTS, Bark, or Piper)
- Cyberpunk/hacker voice characteristics
- Coding assistant tone (technical but friendly)
- Low latency (<500ms) voice generation

**Validation Gate 2.1:** Voice synthesis working with basic text-to-speech.

### Step 2.2: Contextual Voice Selection
**Objective:** Dynamic voice adaptation based on context and sentiment.

**Features:**
- Emotion-based voice modulation (excited = faster/higher pitch)
- Coding mode vs casual chat mode
- Japanese/tech slang integration
- Background audio cues for enhanced atmosphere

**Validation Gate 2.2:** Voice clearly differentiates between coding assistance and casual conversation.

### Step 2.3: Audio-Visual Synchronization
**Objective:** Synchronize voice with video expressions.

**Integration:**
- Voice timing with video transitions
- Emotional congruence between audio and visual
- Interrupt handling for new messages
- Volume controls and mute options

**Validation Gate 2.3:** Voice and video feel naturally synchronized.

## Phase 3: Testing & Validation

### Step 3.1: Automated Testing Suite
**Objective:** Comprehensive test coverage for all enhancements.

**Test Categories:**
- Video mapping accuracy tests
- Sentiment analysis benchmarks
- Voice synthesis quality tests
- End-to-end interaction flows

**Validation Gate 3.1:** All automated tests passing with >90% success rate.

### Step 3.2: Human Validation Sessions
**Objective:** Real-user testing and feedback integration.

**Test Scenarios:**
- Casual conversation (5 minutes)
- Coding assistance session (10 minutes)
- Emotional range testing (various sentiments)
- Voice quality assessment

**Validation Gate 3.2:** Human testers report natural, engaging interactions.

### Step 3.3: Performance Optimization
**Objective:** Ensure smooth performance across all enhancements.

**Metrics:**
- Video switch latency <200ms
- Voice generation <300ms
- Memory usage <100MB
- No dropped frames during transitions

**Validation Gate 3.3:** All performance requirements met on target hardware.

## Implementation Timeline

### Week 1: MP4 System Enhancement
- Day 1-2: Emotion mapping and video controller updates
- Day 3-4: Sentiment analysis improvements
- Day 5: Testing and validation

### Week 2: Voice Integration
- Day 1-3: TTS engine integration
- Day 4-5: Voice modulation and synchronization
- Day 6-7: Testing and optimization

### Week 3: Final Testing & Polish
- Comprehensive testing suite
- Human validation sessions
- Performance optimization
- Documentation updates

## Risk Mitigation

### Technical Risks
- **Voice latency:** Implement streaming TTS if generation too slow
- **Browser compatibility:** Fallback to text-only mode for unsupported browsers
- **Memory usage:** Implement video cleanup and lazy loading

### User Experience Risks
- **Overwhelming:** Provide clear controls for voice/video preferences
- **Inconsistent persona:** Maintain consistent pug hacker character across all interactions
- **Accessibility:** Ensure voice can be disabled and subtitles available

## Success Criteria

- All 16 MP4 clips used naturally in conversations
- Voice synthesis enhances rather than distracts from interactions
- Coding assistance feels helpful and appropriately technical
- Performance remains smooth across all features
- Users report more engaging and immersive experience

## Progress Logging

**Phase 1 Progress: ✅ COMPLETED**
- [x] Step 1.1: Comprehensive emotion mapping - Updated emotion-map.json with all 16 MP4 files, semantic contexts, and intensity levels
- [x] Step 1.2: Enhanced sentiment analysis - Added multi-layered analysis with context awareness, phrase recognition, and coding-specific sentiment detection
- [x] Step 1.3: Dynamic video sequencing - Enhanced video controller with context-aware switching, intensity-based selection, and repetition avoidance

**Phase 2 Progress: ✅ COMPLETED**
- [x] Step 2.1: Voice synthesis setup - Integrated Coqui XTTS v2 server for high-quality, family-friendly male voice synthesis
- [x] Step 2.2: Contextual voice selection - Dynamic voice modulation based on emotion, coding mode detection, and Japanese tech slang
- [x] Step 2.3: Audio-visual synchronization - Synchronized voice with video expressions and sentiment context
- [x] **Coqui XTTS v2 Integration**: Created Python TTS server with Flask API, family-friendly male voice, emotion-based modulation

**Critical Issues Fixed:**
- [x] **Response Verbosity**: Updated Ollama prompts for concise, coding-focused responses (1-2 sentences max)
- [x] **TTS Synchronization**: Implemented voice duration estimation and video-voice coordination
- [x] **Video Switching Logic**: Replaced rigid sequences with voice-synchronized playback and neutral cycling
- [x] **Video Path Issues**: Fixed MP4 loading paths from `../mp4/` to `./mp4/`

**Phase 3 Progress:**
- [ ] Step 3.1: Automated testing suite - Comprehensive test coverage
- [ ] Step 3.2: Human validation sessions - Real-user testing
- [ ] Step 3.3: Performance optimization - Ensure smooth performance

---

*Plan created: 2025-11-11*
*Phase 1 completed: 2025-11-11*
*Phase 2 completed: 2025-11-11*
*Next action: Begin Phase 3 testing & validation*
