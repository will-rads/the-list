# Prompts

Starter prompts to paste into a **fresh chat** with each agent. Each one tells the agent which MD files to read, what it owns, and asks for a 3-line "ready" reply so you know context loaded cleanly.

| File | Agent | Role |
| --- | --- | --- |
| [`claude-starter.md`](claude-starter.md) | Claude (Anthropic) | Implementation, design, ops |
| [`codex-starter.md`](codex-starter.md) | Codex / GPT-5 (OpenAI) | Auditor, second opinion, prompt partner |

## How to start a new chat

1. Copy the file content.
2. Paste as the very first message.
3. Wait for the agent to reply with the 3-line ready check.
4. Then start the actual task.

If the agent skips the ready check or invents context that isn't in the MD files, that's a red flag — make it re-read.
