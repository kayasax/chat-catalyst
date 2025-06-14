# Chat Catalyst Extension - Development Launcher
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "    Chat Catalyst Extension Dev" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Change to extension directory
Set-Location "c:\startprompt\chat-tutorial"

# Compile the extension
Write-Host "🔨 Compiling extension..." -ForegroundColor Yellow
npm run compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
    Write-Host ""

    Write-Host "🚀 Starting VS Code with Chat Catalyst extension..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "TESTING INSTRUCTIONS:" -ForegroundColor Yellow
    Write-Host "1. Wait for VS Code to load completely" -ForegroundColor White
    Write-Host "2. Look for 'Chat Catalyst is ready!' message" -ForegroundColor White
    Write-Host "3. Test with:" -ForegroundColor White
    Write-Host "   • Click 'Start Chat' button" -ForegroundColor Cyan
    Write-Host "   • OR press Ctrl+Alt+C" -ForegroundColor Cyan
    Write-Host "4. Check Developer Console (F12) for logs" -ForegroundColor White
    Write-Host ""    # Start VS Code with extension development mode (keeping other extensions enabled)
    Write-Host "🚀 Launching Extension Development Host..." -ForegroundColor Cyan
    & code --extensionDevelopmentPath="$PWD"

    Write-Host "🎯 VS Code started in extension development mode!" -ForegroundColor Green
    Write-Host "GitHub Copilot should be available for Chat Catalyst to work with." -ForegroundColor Green
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
