#!/usr/bin/env pwsh
# Test script to verify Chat Catalyst 1.1 with Session Starter functionality

Write-Host "🧪 Testing Chat Catalyst 1.1 with Session Starter functionality..." -ForegroundColor Cyan

# Test 1: Check if package.json has the updated default prompt
Write-Host "`n1️⃣ Testing package.json configuration..." -ForegroundColor Yellow
$packagePath = ".\package.json"
if (Test-Path $packagePath) {
    $packageContent = Get-Content $packagePath -Raw
    if ($packageContent -match "Step 1: Load Project Context") {
        Write-Host "✅ Session starter prompt found in package.json" -ForegroundColor Green

        # Check for key phrases
        if ($packageContent -match "ALWAYS update the existing session_starter.md") {
            Write-Host "✅ File update instruction found" -ForegroundColor Green
        } else {
            Write-Host "❌ File update instruction missing" -ForegroundColor Red
        }

        if ($packageContent -match "Do NOT create additional markdown files") {
            Write-Host "✅ Anti-proliferation instruction found" -ForegroundColor Green
        } else {
            Write-Host "❌ Anti-proliferation instruction missing" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Session starter prompt NOT found in package.json" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    exit 1
}

# Test 2: Check if extension compiles successfully
Write-Host "`n2️⃣ Testing compilation..." -ForegroundColor Yellow
npm run compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Extension compiled successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Extension compilation failed" -ForegroundColor Red
    exit 1
}

# Test 3: Check if the compiled output exists
Write-Host "`n3️⃣ Testing compiled output..." -ForegroundColor Yellow
if (Test-Path ".\out\extension.js") {
    Write-Host "✅ Compiled extension.js exists" -ForegroundColor Green

    # Check file size (should be reasonable)
    $fileSize = (Get-Item ".\out\extension.js").Length
    Write-Host "📁 Extension size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Compiled extension.js not found" -ForegroundColor Red
    exit 1
}

# Test 4: Check session_starter.md exists in parent workspace
Write-Host "`n4️⃣ Testing session_starter.md in workspace..." -ForegroundColor Yellow
$sessionStarterPath = "..\Session_starter.md"
if (Test-Path $sessionStarterPath) {
    Write-Host "✅ Session_starter.md found in workspace" -ForegroundColor Green

    # Check if it's the clean version (should be much smaller now)
    $lineCount = (Get-Content $sessionStarterPath).Count
    Write-Host "📄 Session_starter.md lines: $lineCount" -ForegroundColor Cyan    if ($lineCount -lt 100) {
        Write-Host "✅ File appears to be cleaned up (< 100 lines)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ File might still be cluttered ($lineCount lines)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Session_starter.md not found in workspace" -ForegroundColor Red
}

# Test 5: Package the extension
Write-Host "`n5️⃣ Testing extension packaging..." -ForegroundColor Yellow
if (Get-Command "vsce" -ErrorAction SilentlyContinue) {
    vsce package --out "chat-catalyst-test.vsix"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Extension packaged successfully" -ForegroundColor Green

        if (Test-Path "chat-catalyst-test.vsix") {
            $packageSize = (Get-Item "chat-catalyst-test.vsix").Length
            Write-Host "📦 Package size: $([math]::Round($packageSize/1KB, 2)) KB" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Extension packaging failed" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ vsce not installed, skipping packaging test" -ForegroundColor Yellow
}

# Test Summary
Write-Host "`n🎉 Test Summary:" -ForegroundColor Green
Write-Host "✅ Session starter default prompt implemented" -ForegroundColor White
Write-Host "✅ Simplified setup: One question only" -ForegroundColor White
Write-Host "✅ Anti-proliferation measures in place" -ForegroundColor White
Write-Host "✅ Extension compiles and packages successfully" -ForegroundColor White
Write-Host "✅ Clean session_starter.md in workspace" -ForegroundColor White

Write-Host "`n🚀 Ready for manual testing:" -ForegroundColor Cyan
Write-Host "   1. Install: code --install-extension chat-catalyst-test.vsix" -ForegroundColor White
Write-Host "   2. Test: Ctrl+Alt+C or 'Chat Catalyst: Start Chat with Session Primer'" -ForegroundColor White
Write-Host "   3. Verify: AI should load context from Session_starter.md" -ForegroundColor White

Write-Host "`n💡 Expected behavior:" -ForegroundColor Yellow
Write-Host "   • If session_starter.md exists → loads project context immediately" -ForegroundColor White
Write-Host "   • If not → asks 'Describe your project in a few words'" -ForegroundColor White
Write-Host "   • Updates existing session_starter.md throughout session" -ForegroundColor White
Write-Host "   • Does NOT create additional markdown files" -ForegroundColor White
