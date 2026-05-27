"""Transcribe Radwan's 9 WhatsApp voice notes in chronological order using Gemini 3 Flash.

Sends all clips in a single request so the model has the full conversation context
when producing Arabizi transcripts + English translations.
"""

import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

ENV_PATH = Path(r"C:\Users\user\Documents\Me\personal-documents\.env.txt")
VOICE_DIR = Path(r"C:\Users\user\Documents\Me\projects\radwan-portfolio")
OUT_PATH = VOICE_DIR / "transcripts.json"

# Load API key
api_key = None
for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
    if line.startswith("GEMINI_API_KEY="):
        api_key = line.split("=", 1)[1].strip()
        break
if not api_key:
    sys.exit("No GEMINI_API_KEY found")

# Collect files in chronological order (filenames sort correctly because of HH.MM.SS)
files = sorted(VOICE_DIR.glob("WhatsApp Ptt *.ogg"))
print(f"Found {len(files)} voice notes:")
for f in files:
    print(f"  {f.name}  ({f.stat().st_size} bytes)")

# Build a labeled multi-part request
prompt_intro = (
    "You will receive 9 WhatsApp voice notes from a Lebanese man named Radwan, "
    "sent in chronological order. He is speaking in Lebanese Arabic (with English "
    "code-switching). He is describing an app idea inspired by 'The Secret Society' "
    "iOS app and wants to build something similar for Lebanon.\n\n"
    "For EACH voice note (1 through 9), produce:\n"
    "  1. A faithful transcript in Lebanese Arabizi (Latin-script Arabic with "
    "     numerals 2/3/5/7/9 for ع/ء/ح/خ/ق as appropriate). Keep English words as English. "
    "     Mark fillers and false starts; do not clean up too aggressively. "
    "  2. A clean, natural English translation that preserves his intent.\n\n"
    "Return STRICT JSON only, matching this schema exactly (no markdown, no commentary):\n"
    "{\n"
    '  "clips": [\n'
    '    {"index": 1, "filename": "...", "arabizi": "...", "english": "..."},\n'
    "    ...\n"
    "  ],\n"
    '  "overall_summary": "2-3 sentence summary of what Radwan is proposing across all 9 clips"\n'
    "}\n\n"
    "The clips follow in order. Each is preceded by a text marker like 'CLIP 1: <filename>'."
)

parts = [{"text": prompt_intro}]
for i, f in enumerate(files, start=1):
    parts.append({"text": f"\n\nCLIP {i}: {f.name}"})
    audio_b64 = base64.b64encode(f.read_bytes()).decode("ascii")
    parts.append({
        "inlineData": {
            "mimeType": "audio/ogg",
            "data": audio_b64,
        }
    })

body = {
    "contents": [{"parts": parts}],
    "generationConfig": {
        "temperature": 0.2,
        "responseMimeType": "application/json",
        "thinkingConfig": {"thinkingLevel": "high"},
    },
}

url = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-3-flash-preview:generateContent"
    f"?key={api_key}"
)

print(f"\nSending {len(files)} clips to Gemini 3 Flash (thinking=high)...")
req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=600) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.reason)
    print(e.read().decode("utf-8", errors="replace"))
    sys.exit(1)

# Extract the model's text output
try:
    text = payload["candidates"][0]["content"]["parts"][0]["text"]
except (KeyError, IndexError):
    print("Unexpected response shape:")
    print(json.dumps(payload, indent=2)[:4000])
    sys.exit(1)

# Save the raw text and also save parsed JSON if possible
OUT_PATH.write_text(text, encoding="utf-8")
print(f"\nSaved transcript to: {OUT_PATH}")
print("\n--- Preview (first 2000 chars) ---")
print(text[:2000])
