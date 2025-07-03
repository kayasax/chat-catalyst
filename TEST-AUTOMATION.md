# 🧪 Chat Catalyst Test Automation

This directory contains comprehensive automated testing for the Chat Catalyst VS Code extension.

## Overview

The test automation validates:
- ✅ Extension packaging and integrity
- ✅ Project type detection (React, Node.js, Python, Generic)
- ✅ Template generation and variable substitution
- ✅ File system operations (.github directory, Session_starter.md)
- ✅ Command registration and availability
- ✅ Package.json configuration

## Usage

### Quick Test (All Scenarios)
```powershell
.\test-automation.ps1
```

### Test Specific Project Type
```powershell
.\test-automation.ps1 -Scenario react
.\test-automation.ps1 -Scenario nodejs  
.\test-automation.ps1 -Scenario python
.\test-automation.ps1 -Scenario empty
```

### Verbose Output
```powershell
.\test-automation.ps1 -Verbose
```

### Help
```powershell
.\test-automation.ps1 -Help
```

## Test Scenarios

### Extension Packaging
- Verifies VSIX file exists and has reasonable size
- Validates extension can be packaged successfully

### Package.json Integrity  
- Checks version number (0.3.1)
- Validates command registrations
- Verifies template settings configuration

### Extension Commands
- Confirms all required commands are registered:
  - `chatCatalyst.startChat`
  - `chatCatalyst.editCustomInstructions`
  - `chatCatalyst.editSessionStarter`
  - `chatCatalyst.resetTemplates`
  - `chatCatalyst.test`

### Project Detection
- **React**: package.json with react dependency → "React"
- **Node.js**: package.json without react → "Node.js"  
- **Python**: requirements.txt or .py files → "Python"
- **Empty**: no indicators → "Generic"

### Template Generation
- Tests variable substitution in templates:
  - `{{PROJECT_NAME}}` → actual project name
  - `{{PROJECT_TYPE}}` → detected project type
  - `{{DATE}}` → current date
  - `{{TECH_STACK}}` → project-specific stack
  - `{{COMMON_COMMANDS}}` → project-specific commands
- Validates generated .github/copilot-instructions.md
- Validates generated Session_starter.md

### File System Operations
- Directory creation (.github)
- File creation and content validation
- Existing file handling and preservation

## Output

### Success (100% Pass Rate)
```
============================================================
🧪 CHAT CATALYST TEST AUTOMATION SUMMARY  
============================================================
Total Tests: 6
Passed: 6
Failed: 0
Success Rate: 100%

📊 DETAILED RESULTS:
  ✅ Extension Packaging
  ✅ Package.json Integrity  
  ✅ Extension Commands
  ✅ Project Detection
  ✅ Template Generation
  ✅ File System Operations
============================================================
🎉 ALL TESTS PASSED! Chat Catalyst is ready for production.
```

### Failure Example
```
❌ FAILED TESTS:
  - Template Generation: Custom instructions does not contain expected content: test-react-app

📊 DETAILED RESULTS:
  ✅ Extension Packaging
  ❌ Template Generation
  ✅ Project Detection
```

## Requirements

- PowerShell 5.1+ (Windows PowerShell or PowerShell Core)
- VS Code with Chat Catalyst extension VSIX file
- Write permissions for temp directory

## CI/CD Integration

This script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Extension Tests
  run: .\test-automation.ps1
  shell: powershell
  working-directory: ./chat-tutorial
```

## Troubleshooting

### "Extension package not found"
- Ensure `chat-catalyst-0.3.1.vsix` exists in the project root
- Run `npx @vscode/vsce package` to generate the VSIX

### "Command not found" errors
- Check that all commands are properly registered in package.json
- Verify extension.ts contains the command implementations

### Permission errors
- Run PowerShell as Administrator if needed
- Check temp directory write permissions

## Development

To add new tests:

1. Create a new test function following the pattern:
```powershell
function Test-NewFeature {
    # Test implementation
    Write-Verbose-Log "Test description"
}
```

2. Add the test to the main execution:
```powershell
Invoke-Test "New Feature Test" { Test-NewFeature }
```

3. Update this README with the new test description

## Version History

- **v1.0** (2025-07-03): Initial comprehensive test automation
  - 6 core test scenarios
  - PowerShell-based implementation
  - Support for all project types
  - Automated cleanup and reporting
