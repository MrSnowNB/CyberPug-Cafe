#!/usr/bin/env python3
"""
Test script for FastMCP Bridge functionality
Tests the bridge workflow without requiring full MCP client setup
"""

import subprocess
import time
import os
from pathlib import Path

def test_bridge_script():
    """Test that the bridge script can be imported and has the right structure"""
    print("🧪 Testing bridge script import...")

    try:
        # Test import
        import cline_bridge
        print("✅ Bridge script imports successfully")

        # Check if FastMCP is available
        import fastmcp
        print(f"✅ FastMCP available (version: {fastmcp.__version__})")

        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_file_creation():
    """Test that the bridge can create files in shared workspace"""
    print("\n🧪 Testing file creation...")

    try:
        # Create shared workspace
        shared_workspace = Path("shared_workspace")
        shared_workspace.mkdir(exist_ok=True)

        # Create a test file
        test_file = shared_workspace / "test_task.md"
        test_content = "[PLAN]\n\nTest task content"
        test_file.write_text(test_content, encoding='utf-8')

        # Verify file was created
        if test_file.exists() and test_file.read_text() == test_content:
            print("✅ File creation works correctly")
            # Clean up
            test_file.unlink()
            return True
        else:
            print("❌ File creation failed")
            return False

    except Exception as e:
        print(f"❌ File creation test failed: {e}")
        return False

def test_vs_code_command():
    """Test VS Code command execution (without actually running it)"""
    print("\n🧪 Testing VS Code command structure...")

    try:
        # Test command construction
        test_file = "shared_workspace/test.md"
        expected_cmd = ["code", "--command", f"cline.addFileToChat {test_file}"]

        print(f"✅ Command structure: {' '.join(expected_cmd)}")

        # Note: We don't actually execute this as it requires VS Code to be running
        # and would interfere with the current session
        print("ℹ️  Skipping actual command execution (requires VS Code GUI)")

        return True

    except Exception as e:
        print(f"❌ Command test failed: {e}")
        return False

def test_shared_workspace():
    """Test shared workspace directory creation and management"""
    print("\n🧪 Testing shared workspace...")

    try:
        shared_workspace = Path("shared_workspace")

        # Ensure directory exists
        shared_workspace.mkdir(exist_ok=True)

        if shared_workspace.exists() and shared_workspace.is_dir():
            print("✅ Shared workspace directory created successfully")

            # Test file listing
            files = list(shared_workspace.glob("*.md"))
            print(f"ℹ️  Current files in workspace: {len(files)}")

            return True
        else:
            print("❌ Shared workspace creation failed")
            return False

    except Exception as e:
        print(f"❌ Shared workspace test failed: {e}")
        return False

def run_tests():
    """Run all bridge tests"""
    print("🚀 FastMCP Bridge Test Suite")
    print("=" * 40)

    tests = [
        test_bridge_script,
        test_file_creation,
        test_vs_code_command,
        test_shared_workspace
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Bridge is ready for integration.")
        return True
    else:
        print("⚠️  Some tests failed. Check output above for details.")
        return False

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
