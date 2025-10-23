# Testing Protocol and Validation Gates for Cyberpunk Pug Cafe Chatbot

Structured validation framework with sentiment benchmarks, performance tests, and edge case handling. Gates block progression until thresholds met.

## Testing Gates Overview

### Gate 1: Folder/Dependency Validation
- **MP4 Inventory**: Confirm all 16 files present with descriptive names.
- **Dependency Check**: npm install success for natural.js.
- **Output**: File listing logged with counts.

### Gate 2: UI Assembly Validation
- **Layout Check**: Split-screen renders 50/50 grid (chat/video).
- **Asset Loading**: CSS files imported correctly.
- **Responsive Test**: No overlap on 1024px+ screens.

### Gate 3: Mapping Coverage Validation
- **Zero Gaps**: Every MP4 assigned to emotion category in emotion-map.json.
- **Accuracy Check**: 100% rule-based matching for standard descriptors.
- **Logging**: Ambiguous files noted for potential override.

### Gate 4: Sentiment Analysis Validation
- **Target Accuracy**: >80% on benchmark corpus.
- **Scoring Range**: -5 (very negative) to +5 (very positive).
- **Special States**: Correct triggers for excited (+4), angry (-4), confused (-2), bored (-1).

### Gate 5: Video Switching Validation
- **Latency Test**: <300ms from sentiment detection to video change.
- **Preloading Verification**: All MP4s load on app start.
- **Synchronization**: Video change occurs exactly on sentiment detection.

### Gate 6: Chat Integration Validation
- **End-to-End Timing**: <2s total response time.
- **Context Alignment**: Bot response reflects analyzed sentiment.
- **Backend Placeholder**: Hook ready for Ollama/OpenAI integration.

### Gate 7: Visual/Mobile Validation
- **Effect Rendering**: Neon glows, flickers, gradients present.
- **Mobile Responsiveness**: Panels stack at 768px, no horizontal scroll.
- **Performance**: No dropped frames during glitch effects.

### Gate 8: Final E2E Validation
- **Corpus Coverage**: All test cases pass for statements/emojis.
- **Latency Benchmarks**: Video <300ms, chat <2s.
- **Human Review Prep**: Override notes ready in emotion-map.json.

## Sentiment Benchmark Corpus

Test cases for validation of natural.js analyzer. Expected scores with reasoning.

### Positive Sentiment Cases (3-5 range)
- "This is amazing! I'm so happy" → +4 (strong positive words)
- "Great job, love it" → +3 (positive affirmation)
- "Thanks! That was helpful" → +3 (appreciative)
- "Wonderful experience!" → +4 (enthusiastic)

### Negative Sentiment Cases (-1 to -5 range)
- "This sucks, terrible" → -4 (strong negation)
- "Disappointed, not what I expected" → -3 (disappointment)
- "Bad experience overall" → -2 (mild negative)
- "Awful, never again" → -5 (extreme negative)

### Neutral/Zeroid Cases (0±0.5)
- "Okay, it's fine" → 0 (neutral descriptor)
- "Not sure what to say" → 0 (indecision)
- "Got it" → 0 (acknowledgment only)

### Edge Case Triggers
- "I'm confused about this" → -2 (triggers confused state, sad pug video)
- "Why are you so angry?" → -4 (angry trigger)
- "So bored right now" → -1 (bored state)
- "This is exciting!" → +4 (excited trigger)
- "WHAT?! That's surprising!" → +3 (excited via surprise)

### Edge Handling Tests
- **Sarcasm**: "Oh great, another problem" → -1 (contextual negative despite "great")
- **Emoji**: "😊😊" → +2, "😢" → -2 (emoji sentiment processing)
- **Unsupported**: "🏴‍☠️" → 0 (neutral fallback for unrecognized)
- **Short Inputs**: "Hi" → 0 (too brief for scoring)
- **Mixed**: "Love it but hate the wait" → +1 (net positive despite negatives)

## Performance Thresholds

- **Sentiment Analysis**: <50ms per message
- **Video Switch Latency**: <300ms total (analysis + switch)
- **Chat Response**: <2s (analysis + generation + display)
- **MP4 Preloading**: <5s initial load time
- **Memory Usage**: <50MB for all preloaded videos

## Edge Case Handling

- **Browser Autoplay Block**: Fallback UI prompt, continue testing
- **Resource Limitations**: Graceful degradation on low-RAM devices
- **Connection Issues**: Offline mode with cached responses
- **Input Validation**: Sanitize HTML/script injections
- **Accessibility**: Keyboard navigation, screen reader support (future)

## Test Execution Protocol

1. **Automated Suite**: Jest/setup for corpus testing in Node.js
2. **Manual UI Tests**: Browser inspector for layout/video timing
3. **Latency Profiling**: Performance.now() timers in JS
4. **Mobile Emulation**: Chrome DevTools device mode
5. **Cross-Browser**: Test matrix: Chrome, Safari, Firefox, Edge

## Validation Logging

Each gate generates:
- Pass/fail status with timestamps
- Detailed error messages for failures
- Performance metrics (latency, accuracy %)
- Recommendations for fixes if failed

## Human Review Criteria

Post-Gate 8 only:
- Annotate emotion-map.json for auto-mapping errors
- Override sentiment scores if analyzer consistently fails
- Add custom corpora for domain-specific language
