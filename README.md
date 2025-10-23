# Cyberpunk Pug Cafe Chatbot

Sentiment-driven chatbot with reactive pug video loops and neon cyberpunk user interface. Built for Cline agent workflows and VSCode, with validation gated assembly and AI-first documentation.

## Quick Start
1. Clone repo, open in VSCode.
2. Ensure all 16 mp4 loops are in `mp4/` folder, named by emotion (see architecture.md for guidelines).
3. Run `npm install` to get dependencies (natural.js).
4. Start local development: `npm run dev` or open `index.html`.
5. Agent-driven assembly: follow steps in `.agent/assembly-guide.md`, which are validation gated. Do not proceed until each gate is passed.

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
