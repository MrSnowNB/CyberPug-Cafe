# Current Issues - Cyberpunk Pug Cafe Chatbot

## Open Issues

### Phase 3 Testing & Validation Implementation
**Status:** Open - Pending Implementation
**Priority:** High
**Assignee:** Development Team

**Description:**
Complete Phase 3 of the enhancement plan: automated testing suite, human validation sessions, and performance optimization.

**Context:**
- Phases 1 & 2 completed successfully (MP4 switching and voice integration)
- Project is fully functional but lacks comprehensive testing
- Living documentation framework now established

**Requirements:**
- Implement automated testing suite with pytest/unit tests
- Add linting with ruff/flake8
- Add type checking with mypy/pyright
- Create performance benchmarks and monitoring
- Conduct human validation testing
- Optimize for target metrics (<2s response time, <100MB memory)

**Validation Gates:**
- [ ] `unit`: pytest fully green
- [ ] `lint`: ruff/flake8 clean
- [ ] `type`: mypy/pyright clean
- [ ] `docs`: Spec drift check passes

**Next Steps:**
1. Set up testing framework and write unit tests
2. Implement linting and type checking
3. Create performance monitoring
4. Conduct validation testing
5. Optimize based on results

**Dependencies:**
- pytest testing framework
- ruff/flake8 linters
- mypy/pyright type checkers
- Performance monitoring tools

---

### MCP Server Integration Completion
**Status:** Open - Waiting on Cline Extension
**Priority:** Medium
**Assignee:** Cline Extension Team

**Description:**
Complete MCP integration by implementing server-side endpoints in Cline VSCode extension.

**Context:**
- Chatbot-side MCP integration is fully implemented
- Plan/Act modes working with local file saving
- Waiting for Cline extension to add MCP server capabilities

**Requirements:**
- Cline extension adds GET /health and POST /execute endpoints
- YAML task parsing and execution using VSCode APIs
- Proper CORS handling for localhost connections
- Security validation and rate limiting

**Current Workaround:**
Tasks are saved as downloadable Markdown files for manual processing.

**Expected Resolution:**
When Cline MCP server is available, seamless task execution will be enabled.

---

### Cross-Platform Testing Coverage
**Status:** Open - Enhancement
**Priority:** Low
**Assignee:** Development Team

**Description:**
Expand testing to ensure compatibility across different operating systems and environments.

**Context:**
- Currently tested primarily on Windows
- Some platform-specific code (signal handling, process management)
- Browser compatibility tested but could be more comprehensive

**Requirements:**
- Test on Windows, macOS, and Linux
- Verify all features work across platforms
- Update REPLICATION-NOTES.md with platform deltas
- Ensure setup scripts work on all platforms

**Impact:**
Improved reliability for contributors and users on different systems.

---

## Recently Resolved Issues

### TTS Server Persistence After VSCode Shutdown
**Status:** Resolved
**Resolution Date:** 2025-11-12
**Resolution:** Implemented comprehensive process management

**Summary:**
- Added signal handlers to TTS server
- Created cleanup script with port-based detection
- Added UI controls for monitoring and cleanup
- Updated documentation with prevention procedures

**Files Modified:**
- `tts_server.py` - Added graceful shutdown
- `cleanup.py` - New comprehensive cleanup script
- `src/main.js` - Added service monitoring
- `src/index.html` - Added status indicators
- `README.md` - Added process management section

### Video Loading Path Issues
**Status:** Resolved
**Resolution Date:** 2025-11-11
**Resolution:** Corrected path resolution

**Summary:**
- Fixed path resolution from `../mp4/` to `./mp4/`
- Standardized asset paths relative to `index.html`
- Added path validation and error handling

### Sentiment Analysis Performance Issues
**Status:** Resolved
**Resolution Date:** 2025-11-11
**Resolution:** Optimized response times

**Summary:**
- Implemented context-aware response length limits
- Added coding mode detection
- Optimized sentiment analysis processing
- Added performance monitoring

## Issue Template

When creating new issues, use this template:

```markdown
### [Issue Title]
**Status:** [Open|In Progress|Resolved]
**Priority:** [High|Medium|Low]
**Assignee:** [Assignee Name]

**Description:**
[Brief description of the issue]

**Context:**
[Background information and when the issue occurs]

**Requirements:**
- [ ] Requirement 1
- [ ] Requirement 2

**Validation Gates:**
- [ ] `unit`: [Criteria]
- [ ] `lint`: [Criteria]
- [ ] `type`: [Criteria]
- [ ] `docs`: [Criteria]

**Next Steps:**
1. [Step 1]
2. [Step 2]

**Dependencies:**
- [Dependency 1]
- [Dependency 2]
```

## Issue Management Process

1. **Discovery:** Issue identified during development or testing
2. **Documentation:** Add to this file with full context
3. **Triage:** Assign priority and assignee
4. **Resolution:** Implement fix following lifecycle (Plan → Build → Validate → Review → Release)
5. **Closure:** Move to "Recently Resolved" section with resolution details

## Metrics

- **Total Issues:** 3 (2 open, 1 resolved)
- **High Priority:** 1 open
- **Medium Priority:** 1 open
- **Low Priority:** 1 open
- **Resolution Rate:** 33% (1 resolved out of 3 total)

Last Updated: 2025-11-12
