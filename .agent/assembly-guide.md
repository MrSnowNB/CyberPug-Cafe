# Stepwise Agent Assembly Guide for Cyberpunk Pug Cafe Chatbot

Agent-driven assembly with validation gates. Each step blocks progression until criteria met. Autonomous MP4 mapping prioritized before human intervention.

## Stepwise Cline Agent Guide

### 1. Folder and Dependency Setup (Gate 1)
- Confirm all 16 pug mp4 files exist in `mp4/` folder, descriptively named.
- Execute `npm install` to install natural.js dependency.
- Agent scans `mp4/` and produces complete file listing with verification.

**Validation Gate 1**: All 16 files discovered, logged, and dependencies installed. Fails if any MP4 missing or installation errors.

### 2. UI Assembly (Gate 2)
- Create `index.html` with split-screen markup (chat left, video right).
- Implement CSS grid layout with proportional panels.
- Create and import `cyberpunk.css`, `layout.css`, `components.css`.

**Validation Gate 2**: Render confirms two panels in correct 50/50 proportions. Blocks if grid fails or CSS not applied.

### 3. Video Loop Mapping (Gate 3)
- Implement `video-controller.js` using Node.js `fs` to list MP4 files.
- Extract emotion keywords from each filename programmatically (regex/substring).
- Auto-populate `config/emotion-map.json` with sentiment ranges per architecture.md.
- Log unmapped/ambiguous files to README for potential human review.

**Validation Gate 3**: Every discovered MP4 assigned to emotion category. Blocks if any remain unmapped.

### 4. Sentiment Analyzer Integration (Gate 4)
- Develop `sentiment-analyzer.js` using natural.js.
- Configure for accurate -5 to +5 scoring with tokenization.
- Add triggers for special states: confused (-2), angry (-4), excited (+4), bored (-1).
- Test against corpus in `.agent/testing-protocol.md`.

**Validation Gate 4**: >80% accuracy achieved on test cases. Blocks on accuracy failure.

### 5. Video Switch Logic (Gate 5)
- Extend `video-controller.js` for sentiment-based switching.
- Implement preloading of all MP4 loops for seamless transitions.
- Ensure updates occur within 300ms of sentiment detection.

**Validation Gate 5**: Video switches sync with sentiment, latency test passes. Blocks if >300ms.

### 6. Chatbot Backend Integration (Gate 6)
- Build `chat-handler.js` integrating chat input with backend (placeholder for Ollama/OpenAI).
- User message → sentiment analysis → video switch → generate response → display.
- Validate response contextually aligns with detected sentiment.

**Validation Gate 6**: Chat reply arrives within 2 seconds, video reflects sentiment. Blocks if timing or context failure.

### 7. Visual Polish (Gate 7)
- Apply cyberpunk neon effects: gradients, glows, flicker, glitch.
- Ensure responsive design down to 768px (stack panels vertically).
- Optimize assets for smooth rendering.

**Validation Gate 7**: Effects render desktop and mobile. Blocks if assets fail loading.

### 8. End-to-End Testing and Human Review (Final Gate)
- Execute full validation corpus, including edge cases.
- Run latency, UI, mapping coverage tests.
- Allow human annotation in `emotion-map.json` if needed.
- Project ready for showcase or classroom upon pass.

**Validation Gate 8**: All automated tests pass, human review optional. Project deployment-approved.

## Autonomous Video Mapping Algorithm

Agent autonomously processes each `mp4/` filename:
- Use regex to match descriptors: 'smile|happy|joy' → positive range (+2 to +5)
- 'sad|cry|down' → negative range (-1 to -5)
- 'excited|surprise' → +3
- 'angry|growl' → -4
- Rule-based assignment mirrors architecture.md ranges.

Ambiguous/untagged files logged for post-gate manual override. Intervention only after full autonomy completion.

## Troubleshooting Protocols
- **Gate Failure**: Revert to previous step, review agent logs, retry.
- **MP4 Naming Issues**: Check filenames for standard descriptors (see architecture.md examples).
- **Performance Bottlenecks**: Profile JS execution, optimize preloading.
- **Browser Compatibility**: Test Chrome/Safari/Edge rendering.

## Progression Criteria
- Block on any validation failure.
- Log all errors with timestamps.
- Human tweaks limited to final gate.
- Full autonomy maintains AI-first integrity.
