---
mission: "Build a sentiment-driven chatbot with reactive pug video loops and neon cyberpunk UI, optimized for autonomous Cline agent assembly and validation-gated development"
requirements:
- 16 pug MP4 loops in mp4/ folder, descriptively named for emotion mapping
- Node.js with natural.js for sentiment analysis (-5 to +5 scale)
- Split-screen HTML layout: chat panel and video display
- Emotion mapping: auto-extract from filenames, manual override support
- Response latency: <300ms for video switches, <2s for chat replies
- Cyberpunk neon design with responsive mobile layout (min 768px)
- Cline agent experimental mode enabled in VSCode
tools:
- Node.js/NPM for dependencies and local server
- Natural.js (AFINN lexicon) for sentiment scoring
- Browser APIs for video preloading and switching
- Regex/substring for autonomous emotion extraction from MP4 names
model-backend:
  description: "All chatbot responses powered by gemma3:latest (Ollama)"
  endpoint: "http://localhost:11434/api/generate"
  persona: "Cyberpunk pug barista"
  integration: "src/scripts/chat-handler.js"
validation_gates:
  gate1: "Dependency setup and MP4 inventory validation"
  gate2: "UI assembly with correct grid proportions"
  gate3: "Complete emotion mapping for all 16 MP4 files"
  gate4: "Sentiment analyzer >80% accuracy on test corpus"
  gate5: "Video switching within 300ms latency"
  gate6: "Chat integration with sentiment-response cycle"
  gate7: "Visual effects and mobile responsiveness"
  gate8: "End-to-end testing and human review approval"
development_stages:
- stage1: "Documentation and structure setup"
- stage2: "Core functionality implementation"
- stage3: "Integration and polishing"
- stage4: "Testing and validation"
---

## Project Definition

The Cyberpunk Pug Cafe Chatbot is an AI-first project designed for autonomous assembly using Cline agents in VSCode. The system analyzes user sentiment using natural language processing, displays reactive pug video loops, and responds through a cyberpunk-themed interface.

### Core Features
- **Sentiment Analysis**: Real-time processing of chat messages using natural.js
- **Video Reactivity**: Automatic switching between 16 pug emotion loops based on sentiment scores
- **UI Design**: Neon cyberpunk aesthetics with glitch effects and responsive grid layout
- **Autonomous Mapping**: Agent-driven assignment of MP4 files to emotion categories via filename analysis

### Development Methodology
- **Validation Gating**: Each assembly step blocks progression until automated tests pass
- **AI-First Assembly**: Documentation structured for agent comprehension and autonomous execution
- **Iterative Refinement**: Human input limited to final gate for overrides when agent accuracy <100%

### Success Criteria
- 100% MP4 emotion mapping coverage
- >80% sentiment analysis accuracy on test corpus
- <300ms video switch latency
- <2s end-to-end chat response time
- Perfect mobile responsiveness at 768px breakpoint

## Known Issues and Future Improvements

### Interactive 3D Sentiment Visualization
- **Issue**: Three.js CDN loading synchronous timing caused undefined errors in browser environment, even with proper script ordering.
- **Details**: Constructor calls to THREE objects before CDN scripts loaded. Attempts to defer initialization failed due to constructor being called synchronously.
- **Mitigation**: Reverted to 2-panel layout. Consider local Three.js bundling or ESM imports for future implementation.
- **Status**: Table for later implementation with improved loading strategy.
