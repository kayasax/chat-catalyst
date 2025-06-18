# 📋 Changelog

All notable changes to the Chat Catalyst extension will be documented in this file.

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
