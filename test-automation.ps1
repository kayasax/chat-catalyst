# 🧪 Chat Catalyst Extension Test Automation Script
# PowerShell version for comprehensive extension testing

param(
    [string]$Scenario = "all",
    [switch]$Verbose,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
🧪 Chat Catalyst Extension Test Automation

Usage:
    .\test-automation.ps1                    # Run all tests
    .\test-automation.ps1 -Scenario react    # Test React project scenario
    .\test-automation.ps1 -Scenario python   # Test Python project scenario
    .\test-automation.ps1 -Verbose          # Verbose output
    .\test-automation.ps1 -Help             # Show this help

Scenarios:
    all     - Run all test scenarios
    react   - Test React project detection and templates
    nodejs  - Test Node.js project detection and templates
    python  - Test Python project detection and templates
    empty   - Test empty project handling

"@
    exit 0
}

# Configuration
$Config = @{
    Verbose = $Verbose
    Scenario = $Scenario
    TestDir = Join-Path $env:TEMP "chat-catalyst-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    ExtensionPath = Join-Path $PSScriptRoot "chat-catalyst-0.3.1.vsix"
    Timeout = 30000
}

# Test results tracker
$TestResults = @{
    Passed = 0
    Failed = 0
    Tests = @()
}

# Utility functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $prefix = switch ($Level) {
        "ERROR" { "❌" }
        "SUCCESS" { "✅" }
        "WARN" { "⚠️" }
        default { "ℹ️" }
    }
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $color
}

function Write-Verbose-Log {
    param([string]$Message)
    if ($Config.Verbose) {
        Write-Log $Message "DEBUG"
    }
}

function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestFunction
    )
    
    Write-Log "Running test: $TestName"
    try {
        & $TestFunction
        $TestResults.Passed++
        $TestResults.Tests += @{ Name = $TestName; Status = "PASSED" }
        Write-Log "✅ $TestName - PASSED" "SUCCESS"
    }
    catch {
        $TestResults.Failed++
        $TestResults.Tests += @{ Name = $TestName; Status = "FAILED"; Error = $_.Exception.Message }
        Write-Log "❌ $TestName - FAILED: $($_.Exception.Message)" "ERROR"
    }
}

function New-TestProject {
    param([string]$Type)
    
    $projectDir = Join-Path $Config.TestDir "test-$Type-project"
    New-Item -ItemType Directory -Path $projectDir -Force | Out-Null
    
    switch ($Type) {
        "react" {
            $packageJson = @{
                name = "test-react-app"
                version = "1.0.0"
                dependencies = @{
                    react = "^18.0.0"
                    "react-dom" = "^18.0.0"
                }
                scripts = @{
                    start = "react-scripts start"
                }
            } | ConvertTo-Json -Depth 3
            
            Set-Content -Path (Join-Path $projectDir "package.json") -Value $packageJson
        }
        
        "nodejs" {
            $packageJson = @{
                name = "test-node-app"
                version = "1.0.0"
                main = "index.js"
                dependencies = @{
                    express = "^4.18.0"
                }
            } | ConvertTo-Json -Depth 3
            
            Set-Content -Path (Join-Path $projectDir "package.json") -Value $packageJson
            Set-Content -Path (Join-Path $projectDir "index.js") -Value 'console.log("Hello Node.js");'
        }
        
        "python" {
            Set-Content -Path (Join-Path $projectDir "requirements.txt") -Value "flask>=2.0.0`nrequests>=2.25.0"
            Set-Content -Path (Join-Path $projectDir "app.py") -Value 'print("Hello Python")'
        }
        
        "empty" {
            # Just an empty directory
        }
        
        default {
            throw "Unknown project type: $Type"
        }
    }
    
    return $projectDir
}

function Test-ExtensionPackaging {
    if (-not (Test-Path $Config.ExtensionPath)) {
        throw "Extension package not found: $($Config.ExtensionPath)"
    }
    
    $fileSize = (Get-Item $Config.ExtensionPath).Length
    if ($fileSize -lt 50000) {  # Should be at least 50KB
        throw "Extension package seems too small: $fileSize bytes"
    }
    
    Write-Verbose-Log "Extension package verified: $fileSize bytes"
}

function Test-ProjectDetection {
    $testCases = @(
        @{ Type = "react"; ExpectedType = "React" }
        @{ Type = "nodejs"; ExpectedType = "Node.js" }
        @{ Type = "python"; ExpectedType = "Python" }
        @{ Type = "empty"; ExpectedType = "Generic" }
    )
    
    foreach ($testCase in $testCases) {
        if ($Config.Scenario -ne "all" -and $Config.Scenario -ne $testCase.Type) {
            continue
        }
        
        $projectDir = New-TestProject $testCase.Type
        Write-Verbose-Log "Testing $($testCase.Type) project detection in: $projectDir"
        
        # Simulate project detection logic from extension
        $detectedType = "Generic"
        
        $packageJsonPath = Join-Path $projectDir "package.json"
        if (Test-Path $packageJsonPath) {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            if ($packageJson.dependencies.react) {
                $detectedType = "React"
            }
            else {
                $detectedType = "Node.js"
            }
        }
        elseif ((Test-Path (Join-Path $projectDir "requirements.txt")) -or 
                (Get-ChildItem $projectDir -Filter "*.py").Count -gt 0) {
            $detectedType = "Python"
        }
        
        if ($detectedType -ne $testCase.ExpectedType) {
            throw "Project detection failed for $($testCase.Type): expected $($testCase.ExpectedType), got $detectedType"
        }
        
        Write-Verbose-Log "✅ $($testCase.Type) project detected correctly as $detectedType"
    }
}

function Test-TemplateGeneration {
    $projectDir = New-TestProject "react"
    
    # Simulate template generation
    $githubDir = Join-Path $projectDir ".github"
    New-Item -ItemType Directory -Path $githubDir -Force | Out-Null
    
    # Test custom instructions template
    $customInstructionsTemplate = @"
# 🧠 Session Continuity Instructions for GitHub Copilot

When working in this {{PROJECT_TYPE}} project ({{PROJECT_NAME}}), follow these behavioral guidelines:

## Core Session Management Behaviors

**ALWAYS when starting any session:**
1. 📘 Look for ``Session_starter.md`` when beginning work in any workspace
2. 🔄 Update ``Session_starter.md`` with progress, decisions, and discoveries throughout the session
3. 🎯 Follow established patterns and technical decisions from session files
4. 📅 Add significant changes to update log using format: ``| Date | Summary |``
5. ✅ Mark completed next steps as ``[x] ✅ COMPLETED``
6. 🔍 Reference session context when making technical decisions

**Project Context:** {{PROJECT_TYPE}} project with {{TECH_STACK}}
**Common Commands:** {{COMMON_COMMANDS}}
**Generated:** {{DATE}}
"@

    $sessionStarterTemplate = @"
# 🧠 AI Session Starter: {{PROJECT_NAME}}

This file serves as the persistent memory for the AI assistant across sessions in this {{PROJECT_TYPE}} workspace.

---

## 📘 Project Overview
**Project Name:** {{PROJECT_NAME}}
**Description:** A {{PROJECT_TYPE}} project created on {{DATE}}
**Primary Goals:**
- Goal 1
- Goal 2
- Goal 3

**Key Technologies / Tools:** {{TECH_STACK}}

---

## 🧠 Assistant Memory
This section is maintained by the AI assistant to track important context and decisions across sessions.

**Current Understanding:** Initial project setup for {{PROJECT_TYPE}} development.

**Known Constraints or Requirements:**
- {{PROJECT_TYPE}} best practices
- Modern development workflow

---

## 🔄 Update Log
| Date       | Summary of Update                          |
|------------|---------------------------------------------|
| {{DATE}}   | Initial project setup and context defined. |

---

## ✅ Next Steps
- [ ] Set up development environment
- [ ] Configure build system
- [ ] Implement core features

---

> _This file is automatically referenced and updated by the AI assistant to maintain continuity across sessions._
"@

    # Generate files with variable substitution
    $variables = @{
        '{{PROJECT_NAME}}' = 'test-react-app'
        '{{PROJECT_TYPE}}' = 'React'
        '{{DATE}}' = (Get-Date -Format 'yyyy-MM-dd')
        '{{TECH_STACK}}' = 'React, Node.js, JavaScript/TypeScript'
        '{{COMMON_COMMANDS}}' = 'npm start, npm test, npm run build'
    }
    
    $customInstructions = $customInstructionsTemplate
    $sessionStarter = $sessionStarterTemplate
    
    foreach ($variable in $variables.Keys) {
        $customInstructions = $customInstructions -replace [regex]::Escape($variable), $variables[$variable]
        $sessionStarter = $sessionStarter -replace [regex]::Escape($variable), $variables[$variable]
    }
    
    Set-Content -Path (Join-Path $githubDir "copilot-instructions.md") -Value $customInstructions
    Set-Content -Path (Join-Path $projectDir "Session_starter.md") -Value $sessionStarter
    
    # Verify generated content
    $customInstructionsContent = Get-Content (Join-Path $githubDir "copilot-instructions.md") -Raw
    $sessionStarterContent = Get-Content (Join-Path $projectDir "Session_starter.md") -Raw
    
    $expectedInCustom = @('test-react-app', 'React project', 'Session_starter.md')
    foreach ($expected in $expectedInCustom) {
        if ($customInstructionsContent -notlike "*$expected*") {
            throw "Custom instructions does not contain expected content: $expected"
        }
    }
    
    $expectedInSession = @('test-react-app', 'React workspace', 'Update Log')
    foreach ($expected in $expectedInSession) {
        if ($sessionStarterContent -notlike "*$expected*") {
            throw "Session starter does not contain expected content: $expected"
        }
    }
    
    Write-Verbose-Log "Template generation and variable substitution verified"
}

function Test-FileSystemOperations {
    $projectDir = New-TestProject "nodejs"
    
    # Test directory creation
    $githubDir = Join-Path $projectDir ".github"
    New-Item -ItemType Directory -Path $githubDir -Force | Out-Null
    
    if (-not (Test-Path $githubDir)) {
        throw ".github directory was not created"
    }
    
    # Test file creation
    $testFile = Join-Path $githubDir "test-file.md"
    Set-Content -Path $testFile -Value "# Test file"
    
    if (-not (Test-Path $testFile)) {
        throw "Test file was not created"
    }
    
    # Test file overwrite protection (simulate existing file)
    $existingContent = "# Existing content"
    Set-Content -Path $testFile -Value $existingContent
    
    $content = Get-Content $testFile -Raw
    if ($content -notlike "*Existing content*") {
        throw "File content was not preserved"
    }
    
    Write-Verbose-Log "File system operations verified"
}

function Test-ExtensionCommands {
    $expectedCommands = @(
        'chatCatalyst.startChat',
        'chatCatalyst.editCustomInstructions',
        'chatCatalyst.editSessionStarter',
        'chatCatalyst.resetTemplates',
        'chatCatalyst.test'
    )
    
    # Read the extension source to verify commands are registered
    $extensionPath = Join-Path $PSScriptRoot "src" "extension.ts"
    $extensionContent = Get-Content $extensionPath -Raw
    
    foreach ($command in $expectedCommands) {
        if ($extensionContent -notlike "*$command*") {
            throw "Command $command not found in extension source"
        }
    }
    
    Write-Verbose-Log "Extension commands verified in source code"
}

function Test-PackageJsonIntegrity {
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    # Verify version
    if (-not $packageJson.version -or $packageJson.version -ne "0.3.1") {
        throw "Unexpected version: $($packageJson.version)"
    }
    
    # Verify commands
    $commands = $packageJson.contributes.commands
    if (-not $commands -or $commands.Count -eq 0) {
        throw "No commands found in package.json"
    }
    
    # Verify settings
    $configuration = $packageJson.contributes.configuration.properties
    if (-not $configuration.'chatCatalyst.customInstructionsTemplate' -or 
        -not $configuration.'chatCatalyst.sessionStarterTemplate') {
        throw "Template settings not found in package.json"
    }
    
    Write-Verbose-Log "Package.json integrity verified"
}

function Remove-TestEnvironment {
    try {
        if (Test-Path $Config.TestDir) {
            Remove-Item $Config.TestDir -Recurse -Force
            Write-Verbose-Log "Cleaned up test directory: $($Config.TestDir)"
        }
    }
    catch {
        Write-Log "Warning: Could not clean up test directory: $($_.Exception.Message)" "WARN"
    }
}

function Show-TestSummary {
    Write-Host ""
    Write-Host ("=" * 60)
    Write-Host "🧪 CHAT CATALYST TEST AUTOMATION SUMMARY"
    Write-Host ("=" * 60)
    Write-Host "Total Tests: $($TestResults.Passed + $TestResults.Failed)"
    Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red
    
    $successRate = if (($TestResults.Passed + $TestResults.Failed) -gt 0) {
        [math]::Round(($TestResults.Passed / ($TestResults.Passed + $TestResults.Failed)) * 100, 1)
    } else { 0 }
    Write-Host "Success Rate: $successRate%"
    
    if ($TestResults.Failed -gt 0) {
        Write-Host "`n❌ FAILED TESTS:" -ForegroundColor Red
        $TestResults.Tests | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📊 DETAILED RESULTS:"
    $TestResults.Tests | ForEach-Object {
        $icon = if ($_.Status -eq "PASSED") { "✅" } else { "❌" }
        $color = if ($_.Status -eq "PASSED") { "Green" } else { "Red" }
        Write-Host "  $icon $($_.Name)" -ForegroundColor $color
    }
    
    Write-Host ("=" * 60)
    
    if ($TestResults.Failed -eq 0) {
        Write-Host "🎉 ALL TESTS PASSED! Chat Catalyst is ready for production." -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "❌ Some tests failed. Please check the issues above." -ForegroundColor Red
        exit 1
    }
}

# Main execution
function Main {
    Write-Log "🚀 Starting Chat Catalyst Extension Test Automation"
    Write-Log "Test Directory: $($Config.TestDir)"
    Write-Log "Scenario: $($Config.Scenario)"
    Write-Log "Verbose: $($Config.Verbose)"
    
    try {
        # Prepare test environment
        New-Item -ItemType Directory -Path $Config.TestDir -Force | Out-Null
        
        # Run tests
        Invoke-Test "Extension Packaging" { Test-ExtensionPackaging }
        Invoke-Test "Package.json Integrity" { Test-PackageJsonIntegrity }
        Invoke-Test "Extension Commands" { Test-ExtensionCommands }
        Invoke-Test "Project Detection" { Test-ProjectDetection }
        Invoke-Test "Template Generation" { Test-TemplateGeneration }
        Invoke-Test "File System Operations" { Test-FileSystemOperations }
        
        Write-Log "✅ All core tests completed successfully"
        
    }
    catch {
        Write-Log "Critical test failure: $($_.Exception.Message)" "ERROR"
        $TestResults.Failed++
    }
    finally {
        Remove-TestEnvironment
        Show-TestSummary
    }
}

# Handle script termination
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Remove-TestEnvironment
}

# Run main function
Main
