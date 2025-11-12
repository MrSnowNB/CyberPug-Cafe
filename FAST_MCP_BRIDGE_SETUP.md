# FastMCP + File Watcher Bridge Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the FastMCP + File Watcher bridge that enables seamless communication between the Cyberpunk Pug Cafe chatbot and Cline agent.

## Prerequisites

### System Requirements
- **Python 3.8+** with pip installed
- **VS Code** with Cline extension installed
- **File Watcher** VS Code extension (`filewatcher`)
- **FastMCP** library (automatically installed via setup)

### Verified Environment
- **OS:** Windows 11
- **Python:** 3.10.11
- **FastMCP:** 2.13.0.2
- **VS Code:** Latest stable with Cline extension

## Step-by-Step Setup

### Step 1: Install FastMCP
```bash
# Install FastMCP library
pip install fastmcp
```

**Expected Output:**
```
Collecting fastmcp
Installing collected packages: fastmcp, mcp, ...
Successfully installed fastmcp-2.13.0.2
```

**Verification:**
```bash
python -c "import fastmcp; print('FastMCP version:', fastmcp.__version__)"
# Output: FastMCP version: 2.13.0.2
```

### Step 2: Verify Bridge Script
The `cline_bridge.py` script should be present in the project root.

**Test the bridge:**
```bash
python test_bridge.py
```

**Expected Output:**
```
🚀 FastMCP Bridge Test Suite
========================================
🧪 Testing bridge script import...
✅ Bridge script imports successfully
✅ FastMCP available (version: 2.13.0.2)
🧪 Testing file creation...
✅ File creation works correctly
🧪 Testing VS Code command structure...
✅ Command structure: code --command cline.addFileToChat shared_workspace/test.md
🧪 Testing shared workspace...
✅ Shared workspace directory created successfully
========================================
📊 Test Results: 4/4 tests passed
🎉 All tests passed! Bridge is ready for integration.
```

### Step 3: Install File Watcher Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "File Watcher"
4. Install the extension by `filewatcher` (not the one by `appulate.filewatcher`)

**Verification:** Extension should appear in the installed extensions list.

### Step 4: Configure VS Code Settings
The `.vscode/settings.json` should contain the file watcher configuration:

```json
{
  "filewatcher.commands": [
    {
      "match": "shared_workspace/*.md",
      "cmd": "code --command 'cline.addFileToChat ${file}'",
      "event": "onFileChange"
    }
  ]
}
```

**Note:** The `event: "onFileChange"` ensures the command runs when files are created or modified.

### Step 5: Configure MCP Server
Update the Cline MCP settings file:

**File:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "cline-bridge": {
      "command": "python",
      "args": [
        "cline_bridge.py"
      ],
      "cwd": "c:/Users/AMD/Desktop/cyberpunk-pug-cafe"
    }
  }
}
```

**Important:** Update the `cwd` path to match your actual project directory.

### Step 6: Configure Cline Custom Instructions
Set up Cline to respond to `[PLAN]` and `[ACT]` prefixes:

**In Cline settings, add custom instructions:**
```
When you see a message starting with [PLAN], treat it as a planning request only.
When you see a message starting with [ACT], execute the task immediately.
```

## Testing the Complete Workflow

### Test 1: Bridge Server Startup
```bash
python cline_bridge.py
```

**Expected:** Server starts and shows FastMCP interface with available tools.

### Test 2: Manual Task Creation
Create a test markdown file manually:

```bash
echo "[PLAN]\n\nTest task: Update the README file" > shared_workspace/test_task.md
```

**Expected:** File Watcher extension should trigger and add the file to Cline chat.

### Test 3: Chatbot Integration
1. Open `src/index.html` in browser
2. Switch to ACT mode in the chatbot
3. Send a coding request: "update the main.js file to add error handling"

**Expected Workflow:**
1. Chatbot detects coding request
2. Sends task to FastMCP bridge
3. Bridge creates markdown file in `shared_workspace/`
4. File Watcher detects file change
5. VS Code command adds file to Cline chat
6. Cline processes the task with [ACT] prefix

## Troubleshooting

### Bridge Server Won't Start
**Symptoms:** `python cline_bridge.py` fails to start
**Solutions:**
- Verify FastMCP installation: `pip list | grep fastmcp`
- Check Python path and version
- Ensure no port conflicts

### File Watcher Not Triggering
**Symptoms:** Files created but no VS Code command executed
**Solutions:**
- Verify File Watcher extension is installed and enabled
- Check `.vscode/settings.json` syntax
- Restart VS Code after configuration changes
- Check VS Code developer console for errors

### MCP Server Not Connecting
**Symptoms:** Cline shows "MCP server not available"
**Solutions:**
- Verify MCP settings file path and syntax
- Check that `cline_bridge.py` is in the correct directory
- Ensure Python is available in PATH
- Restart VS Code after MCP configuration changes

### Tasks Not Appearing in Cline
**Symptoms:** Bridge creates files but Cline doesn't see them
**Solutions:**
- Verify Cline custom instructions are set
- Check that VS Code commands are working
- Ensure file paths are correct
- Test manual file addition to Cline chat

## Performance Considerations

### File Watcher Timing
- File watcher triggers on file creation/modification
- There may be a small delay (100-500ms) before VS Code command executes
- Bridge includes error handling for command timeouts

### Resource Usage
- Bridge script is lightweight (< 50MB memory)
- File operations are fast and don't block
- Shared workspace should be cleaned periodically

## Security Notes

### File System Access
- Bridge creates files in `shared_workspace/` directory
- Files contain task descriptions and metadata
- No sensitive information should be included in task content

### Command Execution
- VS Code commands are executed with user privileges
- Bridge validates file paths to prevent directory traversal
- Commands are constructed safely to prevent injection

## Maintenance

### Regular Tasks
- Clean `shared_workspace/` directory periodically
- Update FastMCP if new versions are available
- Monitor VS Code extension updates
- Review MCP server logs for issues

### Backup and Recovery
- MCP configuration is in user settings
- Bridge script can be recreated if lost
- Test files in `shared_workspace/` can be safely deleted

## Advanced Configuration

### Multiple MCP Servers
You can add additional MCP servers to the configuration:

```json
{
  "mcpServers": {
    "cline-bridge": { ... },
    "other-server": {
      "command": "python",
      "args": ["other_server.py"]
    }
  }
}
```

### Custom File Watcher Rules
Add additional file watching rules for different file types:

```json
{
  "filewatcher.commands": [
    {
      "match": "shared_workspace/*.md",
      "cmd": "code --command 'cline.addFileToChat ${file}'",
      "event": "onFileChange"
    },
    {
      "match": "logs/*.log",
      "cmd": "code --command 'workbench.action.terminal.focus'",
      "event": "onFileChange"
    }
  ]
}
```

## Support and Documentation

### Documentation Files
- `TROUBLESHOOTING.md` - Issue resolution database
- `REPLICATION-NOTES.md` - Setup and environment notes
- `ISSUE.md` - Current issues and tracking
- `PROJECT-POLICY.md` - Development guidelines

### Getting Help
1. Check existing documentation first
2. Run diagnostic tests: `python test_bridge.py`
3. Review VS Code developer console for errors
4. Check MCP server logs for connection issues

---

**Setup Complete Checklist:**
- [ ] FastMCP installed and tested
- [ ] Bridge script functional
- [ ] File Watcher extension installed
- [ ] VS Code settings configured
- [ ] MCP server settings updated
- [ ] Cline custom instructions set
- [ ] End-to-end workflow tested
- [ ] Documentation reviewed

**Last Updated:** 2025-11-12
**Tested Environment:** Windows 11, Python 3.10.11, VS Code Latest
