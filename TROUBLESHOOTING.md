# Chat Catalyst Extension - Troubleshooting Guide

## 🚨 Extension Not Working? Try These Steps:

### 1. **Reload VS Code Window**
- Press `Ctrl+Shift+P`
- Type "Developer: Reload Window" and press Enter
- This reloads the extension with latest changes

### 2. **Check Extension is Active**
- Open VS Code Developer Console: `Help > Toggle Developer Tools`
- Look for: "Chat Catalyst extension is now active!"
- Look for: "Chat Catalyst commands registered successfully!"

### 3. **Test the Commands**

#### Option A: Keyboard Shortcut (NEW)
- Press `Ctrl+Alt+C` (changed from Ctrl+Shift+C to avoid conflicts)

#### Option B: Command Palette
- Press `Ctrl+Shift+P`
- Type "Chat Catalyst: Start Chat"
- Press Enter

#### Option C: Manual Chat Participant
- Open GitHub Copilot Chat
- Type `@catalyst` followed by your message

### 4. **Check Your Settings**
- Press `Ctrl+,` to open Settings
- Search for "Chat Catalyst"
- Make sure:
  - ✅ "Enabled" is checked
  - ✅ "Auto Prompt" has text (not empty)

### 5. **If Still Not Working - Development Mode**
- Press `F5` in the extension project
- This opens Extension Development Host
- Test the extension in this new window

## 🔧 Quick Fixes:

**Problem**: Keyboard shortcut not working
**Solution**: Changed to `Ctrl+Alt+C` to avoid conflicts

**Problem**: No auto-prompt appears
**Solution**: Check Settings > Chat Catalyst > Auto Prompt

**Problem**: Extension not loading
**Solution**: Run "Developer: Reload Window" command

## 🎯 Expected Behavior:

1. Press `Ctrl+Alt+C`
2. GitHub Copilot Chat opens
3. Your custom prompt appears automatically in the input
4. You can immediately start typing your question

If you see "✅ Auto-prompt typed successfully!" in status bar, it worked!
