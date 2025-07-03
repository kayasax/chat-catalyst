# Chat Catalyst

**Automatically inject custom prompts into GitHub Copilot Chat for consistent, productive AI sessions**

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/LoicMICHEL.chat-catalyst?color=blue&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=LoicMICHEL.chat-catalyst)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/LoicMICHEL.chat-catalyst?color=green)](https://marketplace.visualstudio.com/items?itemName=LoicMICHEL.chat-catalyst)

## What is Chat Catalyst?

Chat Catalyst eliminates repetitive setup when starting GitHub Copilot Chat sessions. Instead of manually typing the same context and instructions every time, this extension automatically injects your custom prompts and sets up session continuity for your projects.

## Key Productivity Benefits

- **Save Time**: No more retyping the same prompts every chat session
- **Maintain Context**: Automatic session continuity with project memory files
- **Team Consistency**: Shared AI instructions across your development team
- **Project Bootstrap**: One-click setup of session infrastructure for any project
- **Smart Detection**: Automatically detects project type and creates appropriate context

## How It Works

1. **Press `Ctrl+Alt+C`** in any VS Code workspace
2. **Extension detects your project type** (React, Node.js, Python, etc.)
3. **Creates session infrastructure**:
   - `.github/copilot-instructions.md` - Persistent AI behavior for all chats
   - `Session_starter.md` - Project-specific context and memory
   - `.github/prompts/session-startup.prompt.md` - Automated session startup
4. **Copilot Chat opens with full context** and project understanding

## Installation

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=LoicMICHEL.chat-catalyst)
2. Press `Ctrl+Alt+C` in any project to get started
3. Customize templates in Settings > Extensions > Chat Catalyst (optional)

## Features

### Session Continuity Setup
- Automatically creates `.github/copilot-instructions.md` for consistent AI behavior
- Generates `Session_starter.md` with project-specific context
- Creates `.github/prompts/session-startup.prompt.md` for automated startup
- Template variables for project name, type, date, and common commands

### Template Customization
- Edit custom instructions template globally
- Modify session starter template structure
- Reset to defaults when needed
- Variable substitution for dynamic content

## Commands

- **Start Chat with Auto-Prompt** (`Ctrl+Alt+C`) - Launch Copilot Chat with your project context
- **Edit Custom Instructions Template** - Customize the `.github/copilot-instructions.md` template
- **Edit Session Starter Template** - Modify the `Session_starter.md` template
- **Reset Templates to Default** - Restore original templates

## Configuration

Access settings via `Settings > Extensions > Chat Catalyst`:

- **Custom Instructions Template**: Template for `.github/copilot-instructions.md`
- **Session Starter Template**: Template for `Session_starter.md`



## Example Session Startup Prompt

When you press `Ctrl+Alt+C`, Chat Catalyst automatically injects:

```
#file:Session_starter.md

🎯 Session Context Loaded

I've attached the Session_starter.md file which contains the project context and current state for this session. Please:

1. Review the session file for project overview, current status, and established patterns
2. Follow the documented technical decisions and architectural patterns
3. Update the session file as we make progress with new discoveries and achievements
4. Maintain project continuity by building upon previous session work

Ready to continue where we left off! 🚀
```

## Contributing

- Report bugs: [GitHub Issues](https://github.com/kayasax/chat-catalyst/issues)
- Feature requests: [GitHub Issues](https://github.com/kayasax/chat-catalyst/issues)
- Rate the extension: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=LoicMICHEL.chat-catalyst)

## License

MIT License - See LICENSE file for details.
