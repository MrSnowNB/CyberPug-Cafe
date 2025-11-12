#!/usr/bin/env python3
"""
Cleanup script for Cyberpunk Pug Cafe processes
Kills any running TTS servers and development processes
"""

import subprocess
import sys
import os
import signal
import time

def run_command(cmd, description=""):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            if description:
                print(f"✅ {description}")
            return True
        else:
            print(f"⚠️  {description} - {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def kill_process_by_port(port):
    """Kill process listening on specific port"""
    try:
        # Find PID using port
        result = subprocess.run(f"netstat -ano | findstr :{port}", shell=True, capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if f":{port}" in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            # Kill the process
                            subprocess.run(f"taskkill /f /pid {pid}", shell=True, capture_output=True)
                            print(f"✅ Killed process on port {port} (PID: {pid})")
                            return True
                        except:
                            pass
        print(f"ℹ️  No process found on port {port}")
        return False
    except Exception as e:
        print(f"❌ Error killing process on port {port}: {e}")
        return False

def kill_python_processes():
    """Kill all Python processes that might be related to the chatbot"""
    try:
        # Get all python processes
        result = subprocess.run("tasklist /fi \"imagename eq python.exe\"", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            killed = 0
            for line in lines[3:]:  # Skip header lines
                if line.strip() and 'python.exe' in line:
                    parts = line.split()
                    if len(parts) >= 2:
                        pid = parts[1]
                        try:
                            # Check if this is our TTS server or setup script
                            cmd_result = subprocess.run(f"tasklist /fi \"pid eq {pid}\" /fo csv", shell=True, capture_output=True, text=True)
                            if 'tts_server.py' in cmd_result.stdout or 'setup_tts.py' in cmd_result.stdout:
                                subprocess.run(f"taskkill /f /pid {pid}", shell=True, capture_output=True)
                                print(f"✅ Killed chatbot Python process (PID: {pid})")
                                killed += 1
                        except:
                            pass
            if killed == 0:
                print("ℹ️  No chatbot Python processes found")
            return killed > 0
    except Exception as e:
        print(f"❌ Error killing Python processes: {e}")
        return False

def main():
    print("🧹 Cyberpunk Pug Cafe Cleanup")
    print("=" * 40)

    cleaned = False

    # Kill TTS server on port 5000
    if kill_process_by_port(5000):
        cleaned = True

    # Kill any development servers on common ports
    for port in [8000, 3000, 8080]:
        if kill_process_by_port(port):
            cleaned = True

    # Kill specific Python processes
    if kill_python_processes():
        cleaned = True

    # Kill any Node.js processes that might be running the app
    try:
        result = subprocess.run("tasklist /fi \"imagename eq node.exe\"", shell=True, capture_output=True, text=True)
        if result.returncode == 0 and 'node.exe' in result.stdout:
            print("⚠️  Found Node.js processes - these may need manual termination")
            print("   Run: taskkill /f /im node.exe")
    except:
        pass

    if cleaned:
        print("\n✅ Cleanup completed successfully")
        print("💡 Tip: Run this script before closing VSCode to ensure clean shutdown")
    else:
        print("\nℹ️  No chatbot processes found running")

    print("\n🔍 To check for remaining processes:")
    print("   tasklist | findstr python")
    print("   netstat -ano | findstr :5000")

if __name__ == "__main__":
    main()
