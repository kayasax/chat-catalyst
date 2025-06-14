# Chat Catalyst - Enhanced Debugging Guide

## 🚨 Chat Window Not Opening? Follow These Steps:

### STEP 1: Reload VS Code
```
1. Press Ctrl+Shift+P
2. Type "Developer: Reload Window"
3. Press Enter
```

### STEP 2: Run Debug Command
```
1. Press Ctrl+Shift+P
2. Type "Chat Catalyst: Debug - List Chat Commands"
3. Press Enter
4. Check Developer Console for available commands
```

### STEP 3: Test Extension
```
1. Press Ctrl+Shift+P
2. Type "Chat Catalyst: Test Extension"
3. Should show "🎉 Chat Catalyst extension is working!"
```

### STEP 4: Try Start Chat with Enhanced Logging
```
1. Open Developer Console: Help > Toggle Developer Tools
2. Press Ctrl+Alt+C OR use "Chat Catalyst: Start Chat"
3. Watch the console for detailed logs:
   - "Start Chat command triggered!"
   - "Available commands check:"
   - List of commands and whether they exist
   - Which commands succeed/fail
```

## 🔍 What to Look For in Console:

### ✅ Good Signs:
- "Chat Catalyst extension is now active!"
- "Chat Catalyst commands registered successfully!"
- "Successfully executed chat command: [command-name]"

### ❌ Bad Signs:
- Commands showing "NOT FOUND"
- All chat commands failing
- Error messages about GitHub Copilot not available

## 🛠️ Manual Solutions:

### If Auto-Open Fails:
1. **Click Copilot Icon** in Activity Bar (left side)
2. **OR** Press Ctrl+Shift+P and type "Chat: Focus on Chat View"
3. **OR** View menu > Extensions > GitHub Copilot
4. **OR** View menu > Open View... > GitHub Copilot Chat

### Once Chat is Open:
1. Extension should auto-inject your prompt
2. If not, prompt is in clipboard - press Ctrl+V
3. Or click "Show Prompt" to see what should be pasted

## 🎯 Testing Workflow:

1. **Reload Window** (Developer: Reload Window)
2. **Test Extension** (should see success message)
3. **Debug Commands** (see what chat commands exist)
4. **Try Start Chat** (watch console logs)
5. **Manual fallback** if needed

## 💡 Common Issues:

**GitHub Copilot Extension Missing:**
- Install GitHub Copilot extension first
- Sign in to GitHub Copilot

**Commands Not Found:**
- Update VS Code to latest version
- Update GitHub Copilot extension

**Chat Opens But No Auto-Prompt:**
- Check your settings: Chat Catalyst > Auto Prompt
- Make sure "Enabled" is checked
- Prompt should appear in clipboard anyway
