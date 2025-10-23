# Technical Architecture for Cyberpunk Pug Cafe Chatbot

System overview, component breakdown, and autonomous MP4 sentiment mapping algorithm for AI-driven assembly.

## System Overview

The Cyberpunk Pug Cafe Chatbot is a client-side web application with Node.js backend integration. It uses sentiment analysis to drive reactive video loops in a neon cyberpunk UI.

### Core Architecture Layers
- **Frontend (Browser)**: HTML/CSS/JS for split-screen chat/video display
- **Analysis Engine**: natural.js sentiment scoring with custom edge triggers
- **Video Controller**: Browser-based MP4 switching with preloading
- **Chat Handler**: Integration layer for message processing and response generation
- **Configuration**: JSON-based emotion mapping registry

## Component Breakdown

### Frontend Components (`src/index.html`)
- **Chat Panel**: Input textarea and message history div
- **Video Panel**: Single `<video>` element for loop playback
- **CSS Modules**:
  - `layout.css`: Grid-based 50/50 split, responsive stacking
  - `cyberpunk.css`: Neon gradients, glow effects, flicker animations
  - `components.css`: Form styling, message bubbles

### Analysis Engine (`src/scripts/sentiment-analyzer.js`)
- **Input**: User text messages
- **Processing**: natural.js tokenization and AFINN lexicon scoring (-5 to +5)
- **Output**: Sentiment score, special state flags (excited, angry, etc.)
- **Edge Handling**: Substring matching for trigger words (e.g., "exciting" → excited)

### Video Controller (`src/scripts/video-controller.js`)
- **MP4 Management**: Browser File API or static serving
- **Preloading**: All 16 videos load on app start via Promise.all
- **Switching Logic**: Sentiment range → emotion category → video selection
- **Performance**: RequestAnimationFrame for smooth transitions

### Chat Handler (`src/scripts/chat-handler.js`)
- **Message Flow**: Input → analyze → switch video → generate response
- **Backend Integration**: Placeholder for Ollama/OpenAI API calls
- **Response Logic**: Contextual replies based on sentiment (optional custom logic)

### Configuration (`src/config/emotion-map.json`)
- **Structure**: `{filename.mp4: {emotion: "", range: [min, max]}}`
- **Autonomous Generation**: Regex-based mapping from filenames
- **Override Support**: Manual annotations post-validation

## Autonomous MP4 → Sentiment Mapping Algorithm

### Algorithm Overview
The mapping agent processes each MP4 filename using regex patterns, similarity scoring, and rule-based assignment to sentiment ranges.

### Sentiment Range Categories
- **Very Negative** (-5 to -4): Angry, fearful, disgusted expressions
- **Negative** (-3 to -1): Sad, bored, disappointed behaviors
- **Neutral** (0): Relaxed, observational states
- **Positive** (+1 to +3): Happy, content, playful interactions
- **Very Positive** (+4 to +5): Excited, joyful, enthusiastic displays

### Mapping Rules Engine
```javascript
const emotionRules = {
  positive: { pattern: /smile|happy|joy|laugh|play/, range: [2, 4] },
  excited: { pattern: /excited|surprise|wow|amaze/, range: [3, 4] },
  negative: { pattern: /sad|cry|down|gloom/, range: [-2, -4] },
  angry: { pattern: /angry|growl|mad|yell/, range: [-4, -5] },
  bored: { pattern: /bored|tired|dissatisfied/, range: [-1, 0] },
  confused: { pattern: /confused|puzzl|bewilder/, range: [-2, 0] }
}
```

### Processing Steps for Each MP4
1. **Extract Basename**: Remove .mp4 extension
2. **Regex Matching**: Test against all patterns
3. **Priority Scoring**: Multiple matches resolved by precedence (strongest emotion first)
4. **Range Assignment**: Map matched emotion to sentiment range
5. **Fallback Default**: Unmatched filenames → neutral (0)

### Example Mappings
- `big smile.mp4` → positive range [2,4] (smile keyword match)
- `growling.mp4` → angry range [-4,-5] (growl match)
- `looks excited.mp4` → excited range [3,4] (excited match)
- `typing slightly scared.mp4` → negative range [-2,-4] (scared → sad/fearful)
- `the fly.mp4` → neutral [0,0] (no descriptor matches)

### Edge Case Handling
- **Compound Names**: `typing slightly scared.mp4` - prioritize strongest emotion
- **Ambiguous Terms**: Log for human review if no clear match
- **Override Mechanism**: Manual addition to emotion-map.json after autonomy

## Data Flow Diagram

```
User Input → Sentiment Analysis → Emotion Mapping → Video Switch → Response Generation → Display Update
          ↘                                   ↘
     Record Score                     Select MP4
                                      from emotion-map.json
```

## Performance Architecture

### Optimization Strategies
- **Video Preloading**: All MP4s cached at app launch
- **Asynchronous Analysis**: Promise-based sentiment processing
- **Browser Caching**: MP4 asset headers for 1-hour cache
- **Memory Management**: Video element reuse instead of element creation/destruction

### Scalability Considerations
- **Large Video Libraries**: Paginated loading if >16 MP4s
- **High-Traffic**: WebSocket connections for real-time chat
- **Mobile Optimization**: Compressed MP4s with WebRTC where possible

## Security Architecture

### Input Sanitization
- HTML entity encoding for chat messages
- No script execution in video panel
- CORS policies for external backend calls

### Privacy Measures
- Local sentiment analysis (no user data sent externally)
- Optional offline mode for full privacy
- Clear data retention policies stated

## Deployment Architecture

### Local Development
- Node.js local server for `index.html` serving
- Filesystem access for MP4 loading
- Chrome DevTools for performance profiling

### Production Environment
- CDN for MP4 assets
- Backend API for chat responses (Ollama/OpenAI)
- HTTPS with SSL certificates
- Containerized deployment (Docker)

## Extension Points

- **Custom Emotions**: New ranges added to emotion-map.json
- **Alternative Backends**: GPT-4 or Claude integration
- **Multi-Emotion Videos**: Weighted scoring for complex expressions
- **Audiovisual Cues**: Audio analysis integration
- **User Customization**: Dynamic emotion-mapping per user profile
