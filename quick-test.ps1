# 🚀 Quick VS Code Extension Test
# Simple script for rapid testing during development

Write-Host "🧪 Chat Catalyst Quick Test" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Step 1: Build test extension
Write-Host "📦 Building test extension..." -ForegroundColor Yellow
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

# Remove old test package if it exists
if (Test-Path "catalyst-testing.vsix") {
    Remove-Item "catalyst-testing.vsix" -Force
    Write-Host "🗑️ Removed old test package" -ForegroundColor Gray
}

npx vsce package --out catalyst-testing.vsix
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Test extension packaged successfully" -ForegroundColor Green

# Step 2: Install and launch
Write-Host "🔄 Installing test extension..." -ForegroundColor Yellow
code --uninstall-extension LoicMICHEL.chat-catalyst
Start-Sleep -Seconds 2

code --install-extension catalyst-testing.vsix --force
Start-Sleep -Seconds 3

# Step 3: Create test workspace and launch
$testDir = Join-Path $env:TEMP "quick-test-$(Get-Date -Format 'HHmmss')"
New-Item -ItemType Directory -Path $testDir -Force | Out-Null

# Create a realistic React project structure
@{
    name = "quick-test-project"
    version = "1.0.0"
    dependencies = @{
        react = "^18.0.0"
        "react-dom" = "^18.0.0"
    }
    scripts = @{
        start = "react-scripts start"
        test = "react-scripts test"
        build = "react-scripts build"
    }
} | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $testDir "package.json")

# Create basic project files to make it look realistic
$srcDir = Join-Path $testDir "src"
New-Item -ItemType Directory -Path $srcDir -Force | Out-Null
Set-Content (Join-Path $srcDir "App.js") -Value @"
import React from 'react';

function App() {
  return <div>Quick Test Project</div>;
}

export default App;
"@

Set-Content (Join-Path $testDir "README.md") -Value @"
# Quick Test Project

This is a test project for Chat Catalyst extension testing.
Press Ctrl+Alt+C to test the extension!
"@

Write-Host "📁 Test workspace created: $testDir" -ForegroundColor Green
Write-Host "🚀 Launching VS Code..." -ForegroundColor Green
Write-Host ""
Write-Host "🧪 TESTING INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Open Developer Console FIRST (Help > Toggle Developer Tools)" -ForegroundColor Cyan
Write-Host "2. Look for '🧪 TESTING VERSION: catalyst-testing.vsix' in console" -ForegroundColor Cyan
Write-Host "3. Press Ctrl+Alt+C to trigger the extension" -ForegroundColor Cyan
Write-Host "4. Check that .github/copilot-instructions.md is created" -ForegroundColor Cyan
Write-Host "5. Check that Session_starter.md is created" -ForegroundColor Cyan
Write-Host "6. Check that .github/prompts/session-startup.prompt.md is created" -ForegroundColor Cyan
Write-Host "7. Test 'Chat Catalyst: Test' command from Command Palette" -ForegroundColor Cyan
Write-Host ""

code $testDir --new-window

Write-Host "✅ Quick test setup complete!" -ForegroundColor Green