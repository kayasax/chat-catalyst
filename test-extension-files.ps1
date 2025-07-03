#!/usr/bin/env pwsh
# Test Extension File Creation Script

Write-Host "🧪 Testing Chat Catalyst File Creation" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Find the latest test workspace
$testDir = Get-ChildItem -Path "$env:TEMP\quick-test-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $testDir) {
    Write-Host "❌ No test workspace found. Run quick-test.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Test workspace: $($testDir.FullName)" -ForegroundColor Green

# Change to test directory
Set-Location $testDir.FullName

Write-Host "🚀 Opening VS Code and triggering extension..." -ForegroundColor Yellow

# Open VS Code in test workspace
Start-Process "code" -ArgumentList ".", "--new-window" -Wait:$false

# Wait a bit for VS Code to load
Start-Sleep 3

Write-Host "⏳ Waiting for VS Code to load..." -ForegroundColor Yellow
Start-Sleep 2

Write-Host "🔧 Triggering Chat Catalyst start command..." -ForegroundColor Yellow

# Use code command to trigger the extension
& code --command "chatCatalyst.start"

# Wait for extension to process
Start-Sleep 3

Write-Host "📋 Checking created files..." -ForegroundColor Yellow

# Check for expected files
$files = @{
    ".github\copilot-instructions.md" = "Copilot Instructions"
    "Session_starter.md" = "Session Starter Template"
    ".github\prompts\session-startup.prompt.md" = "Session Startup Prompt"
}

$allFound = $true

foreach ($file in $files.Keys) {
    $fullPath = Join-Path $testDir.FullName $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "✅ $($files[$file]): $file ($size bytes)" -ForegroundColor Green

        # Show first few lines of the file
        Write-Host "   Preview:" -ForegroundColor DarkGray
        Get-Content $fullPath -TotalCount 3 | ForEach-Object {
            Write-Host "   > $_" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "❌ MISSING: $($files[$file]) - $file" -ForegroundColor Red
        $allFound = $false
    }
    Write-Host ""
}

if ($allFound) {
    Write-Host "🎉 SUCCESS: All expected files were created!" -ForegroundColor Green
    Write-Host "🧪 Extension test completed successfully." -ForegroundColor Green
} else {
    Write-Host "⚠️ Some files are missing. Check the extension logs." -ForegroundColor Yellow
    Write-Host "💡 Try running the 'Chat Catalyst: Test' command in VS Code Command Palette" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Test workspace location: $($testDir.FullName)" -ForegroundColor Cyan
Write-Host "🔍 You can manually inspect the files at the location above." -ForegroundColor Cyan
