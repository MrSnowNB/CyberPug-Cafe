#!/usr/bin/env python3
"""
Setup script for Coqui XTTS v2 TTS Server
Installs dependencies and downloads the model
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🎤 Setting up Coqui XTTS v2 for Cyberpunk Pug Cafe")
    print("=" * 50)

    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)

    print(f"✅ Python {sys.version.split()[0]} detected")

    # Install dependencies
    if not run_command("pip install coqui-tts flask torch torchaudio",
                      "Installing Coqui TTS and dependencies"):
        print("\n💡 If pip install fails, try:")
        print("   pip install --upgrade pip")
        print("   pip install coqui-tts flask torch torchaudio --user")
        sys.exit(1)

    # Download XTTS v2 model (this takes time)
    print("\n⏳ Downloading XTTS v2 model (this may take several minutes)...")
    print("   This downloads ~1.5GB of model files")

    if not run_command('python -c "from TTS.api import TTS; print(\'Downloading...\'); tts = TTS(\'tts_models/multilingual/multi-dataset/xtts_v2\'); print(\'Model ready!\')"',
                      "Downloading XTTS v2 model"):
        print("\n💡 If model download fails, try running manually:")
        print("   python -c \"from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')\"")
        sys.exit(1)

    print("\n🎉 Setup complete!")
    print("\n🚀 To start the TTS server:")
    print("   python tts_server.py")
    print("\n📝 The server will run on http://localhost:5000")
    print("   Your browser will automatically detect and use the high-quality voice!")

if __name__ == "__main__":
    main()
