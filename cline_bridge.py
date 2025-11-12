#!/usr/bin/env python3
"""
Cline Bridge - FastMCP server for chatbot-Cline integration
Provides MCP tools to send tasks from chatbot to Cline via markdown files
"""

from fastmcp import FastMCP
import subprocess
from pathlib import Path
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("Cline Bridge")

@mcp.tool()
def send_task_to_cline(task_content: str, mode: str = "plan") -> str:
    """
    Send a task to Cline agent via markdown file and VS Code command.

    Args:
        task_content: The task description/content to send
        mode: Either "plan" or "act" - determines how Cline handles the task

    Returns:
        Confirmation message about the task being sent
    """
    try:
        # Validate mode
        if mode.lower() not in ["plan", "act"]:
            mode = "plan"  # Default to plan mode

        # Create shared workspace directory
        shared_workspace = Path("shared_workspace")
        shared_workspace.mkdir(exist_ok=True)

        # Create task file with mode prefix
        task_file = shared_workspace / "current_task.md"
        prefixed_content = f"[{mode.upper()}]\n\n{task_content}"

        # Write task to file
        task_file.write_text(prefixed_content, encoding='utf-8')
        logger.info(f"Task written to {task_file} with mode {mode}")

        # Execute VS Code command to add file to chat
        try:
            cmd = ["code", "--command", f"cline.addFileToChat {task_file}"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                logger.info("VS Code command executed successfully")
                return f"Task sent to Cline in {mode} mode - file added to chat"
            else:
                logger.warning(f"VS Code command failed: {result.stderr}")
                return f"Task file created but VS Code command failed: {result.stderr}"

        except subprocess.TimeoutExpired:
            logger.error("VS Code command timed out")
            return "Task file created but VS Code command timed out"
        except FileNotFoundError:
            logger.error("VS Code 'code' command not found")
            return "Task file created but VS Code CLI not available"

    except Exception as e:
        error_msg = f"Failed to send task to Cline: {str(e)}"
        logger.error(error_msg)
        return error_msg

@mcp.tool()
def get_bridge_status() -> str:
    """
    Get the current status of the bridge and shared workspace.

    Returns:
        Status information about the bridge
    """
    try:
        shared_workspace = Path("shared_workspace")
        if shared_workspace.exists():
            files = list(shared_workspace.glob("*.md"))
            return f"Bridge active. Shared workspace contains {len(files)} markdown files: {[f.name for f in files]}"
        else:
            return "Bridge active. Shared workspace not yet created."
    except Exception as e:
        return f"Bridge status check failed: {str(e)}"

if __name__ == "__main__":
    logger.info("Starting Cline Bridge FastMCP server...")
    logger.info("Available tools:")
    logger.info("  - send_task_to_cline(task_content, mode): Send task to Cline")
    logger.info("  - get_bridge_status(): Check bridge status")

    try:
        mcp.run()
    except KeyboardInterrupt:
        logger.info("Bridge server stopped by user")
    except Exception as e:
        logger.error(f"Bridge server failed: {e}")
        sys.exit(1)
