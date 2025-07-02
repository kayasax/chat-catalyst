# 📋 Changelog

All notable changes to the Chat Catalyst extension will be documented in this file.

## [0.2.0] - 2025-07-02

### 🚀 **Major New Features - Session Continuity Bootstrap**
- **Auto-creation of session infrastructure**: Extension now automatically creates `.github/copilot-instructions.md` and `Session_starter.md` for new projects
- **Smart project type detection**: Automatically detects React, Node.js, Python, Vue, Angular, Rust, Go, Java, .NET, and other project types
- **Intelligent session startup**: Prioritizes session continuity over old auto-prompt logic - always creates proper session files
- **One-click team setup**: Press `Ctrl+Alt+C` in any folder to instantly bootstrap session continuity infrastructure

### ✨ **Enhanced Session Management**
- **Project-specific templates**: Session_starter.md templates customized for detected project type with relevant technologies and commands
- **Native VS Code integration**: Leverages `.github/copilot-instructions.md` for persistent behavior instructions across all conversations
- **Session startup prompts**: Clean `#file:Session_starter.md` references instead of temporary context files
- **Graceful empty folder handling**: Works perfectly in empty directories with generic development project templates

### 🛠️ **Technical Improvements**
- **Priority logic overhaul**: Session continuity setup now takes precedence over legacy auto-prompt functionality
- **Better workspace detection**: Enhanced project type detection logic with comprehensive file pattern matching
- **Command registration cleanup**: Improved extension activation and command management
- **Debug capabilities**: Added test commands for extension validation and troubleshooting

### 🔧 **Architecture Changes**
- **Bootstrap-first approach**: Extension now focuses on creating session infrastructure rather than just prompt injection
- **Template system**: Modular project type templates with appropriate technology stacks and common commands
- **Fallback handling**: Intelligent fallback to auto-prompt logic only when session files cannot be created

### 📚 **Validation & Testing**
- **Comprehensive testing**: Successfully validated in both new project scenarios and completely empty folders
- **Cross-platform compatibility**: Tested on Windows with PowerShell integration
- **Extension Development Host**: Full validation using VS Code's extension development environment

## [0.1.3] - 2025-06-18

### 🐛 **Critical Bug Fixes**
- **Fixed context file persistence issue**: Context files now persist for 24 hours instead of 30 minutes, ensuring `#file:` references remain valid throughout extended chat sessions
- **Improved memory management**: Implemented managed timer system to prevent memory leaks and properly track active timers
- **Enhanced resource cleanup**: Better disposal of event listeners and temporary files on extension deactivation

### ✨ **Enhancements**
- **Smart long-prompt handling**: Automatically creates persistent context files for prompts longer than 1000 characters
- **Session_starter.md auto-detection**: Extension now intelligently finds and attaches Session_starter.md files from workspace or parent directory
- **Improved error handling**: Better fallback mechanisms when context file creation fails
- **Enhanced logging**: More detailed console output for debugging and monitoring

### 🔧 **Technical Improvements**
- **Workspace integration**: Context files are properly copied to `.vscode/` directory for reliable file attachment
- **File reference generation**: Improved `#workspace #file:` syntax generation for better chat integration
- **Timer management**: Cleanup timers are properly tracked and can be cleared on extension deactivation
- **File verification**: Added checks to ensure context files are actually created before referencing them

### 📚 **Documentation**
- Added comprehensive debugging reports and implementation guides
- Improved code comments and structure
- Updated Session_starter.md template with better formatting

## [0.1.2] - Previous Release
- Basic auto-prompt injection functionality
- Session starter file detection
- Initial context file creation

## [0.1.1] - Previous Release
- Core extension framework
- Basic configuration options

## [0.1.0] - Initial Release
- Auto-prompt injection into GitHub Copilot Chat
- Configurable custom prompts
- Hotkey support (Ctrl+Alt+C)
