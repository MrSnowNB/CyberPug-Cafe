---
task: "Implement FastMCP + File Watcher Bridge for Chatbot-Cline Integration"
context: "Create a bridge solution using FastMCP and VS Code File Watcher to enable seamless communication between the Cyberpunk Pug Cafe chatbot and Cline agent, allowing the chatbot to trigger Cline tasks through markdown files and file watching."
expected_outcome: "Functional bridge that allows chatbot to send tasks to Cline via FastMCP, with file watcher triggering VS Code commands for automatic task consumption."
validation_gates: [unit, lint, type, docs]
---

# FastMCP + File Watcher Bridge Implementation

## Requirements
- [x] Install and configure FastMCP
- [x] Create `cline_bridge.py` script with MCP tool
- [x] Install and configure VS Code File Watcher extension
- [x] Update chatbot MCP server configuration
- [x] Configure Cline custom instructions for [PLAN]/[ACT] prefixes
- [x] Test end-to-end workflow functionality
- [x] Validate all gates pass (unit, lint, type, docs)
- [x] Update all living documentation

## Implementation Plan

### Phase 1: Setup and Installation
1. Install FastMCP via pip
2. Create project structure for bridge components
3. Install VS Code File Watcher extension
4. Verify all dependencies are available

### Phase 2: Bridge Script Development
1. Create `cline_bridge.py` with FastMCP tool
2. Implement `send_task_to_cline` function
3. Add markdown file writing functionality
4. Include VS Code command execution

### Phase 3: File Watcher Configuration
1. Configure `.vscode/settings.json` for file watching
2. Set up shared workspace directory
3. Test file watcher triggering VS Code commands

### Phase 4: Integration and Testing
1. Update chatbot MCP configuration
2. Configure Cline custom instructions
3. Test complete workflow from chatbot → FastMCP → File → Cline
4. Validate error handling and edge cases

### Phase 5: Documentation and Validation
1. Update all living docs with implementation details
2. Pass all validation gates
3. Create troubleshooting entries for potential issues
4. Document setup and usage procedures

## Dependencies
- Python 3.8+ with pip
- VS Code with Cline extension
- File Watcher VS Code extension
- FastMCP library
- Existing chatbot project

## Success Criteria
- Chatbot can send tasks to Cline via FastMCP
- File watcher automatically triggers VS Code commands
- Cline responds appropriately to [PLAN] and [ACT] prefixes
- All validation gates pass
- Complete documentation in living docs
- Reproducible setup process documented

## Risk Assessment
- **Medium**: FastMCP compatibility with existing setup
- **Low**: VS Code extension availability
- **Medium**: File watcher timing and reliability
- **High**: Cline command integration complexity

## Timeline
- **Phase 1**: 30 minutes (setup)
- **Phase 2**: 45 minutes (bridge script)
- **Phase 3**: 30 minutes (file watcher config)
- **Phase 4**: 60 minutes (integration testing)
- **Phase 5**: 45 minutes (documentation and validation)
