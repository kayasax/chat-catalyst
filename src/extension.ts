import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Global state management for proper cleanup
interface ExtensionState {
	isExecuting: boolean;
	activeTimers: NodeJS.Timeout[];
	tempFiles: string[];
	disposables: vscode.Disposable[];
}

export function activate(context: vscode.ExtensionContext) {
	console.log('🚀 Chat Catalyst Enhanced with Long Prompt Support is now active!');

	// Initialize extension state for proper cleanup
	const state: ExtensionState = {
		isExecuting: false,
		activeTimers: [],
		tempFiles: [],
		disposables: []
	};

	// Helper to safely create timers that can be cleaned up
	function createManagedTimer(callback: () => void, delay: number): NodeJS.Timeout {
		const timer = setTimeout(() => {
			callback();
			// Remove timer from active list once it executes
			const index = state.activeTimers.indexOf(timer);
			if (index > -1) {
				state.activeTimers.splice(index, 1);
			}
		}, delay);
		state.activeTimers.push(timer);
		return timer;
	}
	// Helper to cleanup resources
	function cleanup() {
		console.log('🧹 Starting extension cleanup...');

		// Clear all active timers
		state.activeTimers.forEach(timer => clearTimeout(timer));
		state.activeTimers = [];
		console.log('✅ Cleared all active timers');

		// Dispose all registered disposables
		state.disposables.forEach(disposable => {
			try {
				disposable.dispose();
			} catch (error) {
				console.error('❌ Error disposing resource:', error);
			}
		});
		state.disposables = [];

		// Clean up temporary files older than 24 hours (86400000 ms)
		state.tempFiles.forEach(file => {
			try {
				if (fs.existsSync(file)) {
					fs.unlinkSync(file);
					console.log(`🗑️ Deleted temp file: ${file}`);
				}
			} catch (error) {
				console.error(`❌ Error cleaning up temp file: ${file}`, error);
			}
		});
		state.tempFiles = [];
		console.log('✅ Cleaned up temporary files');

		console.log('✅ Extension cleanup completed');
	}

	// Register commands with proper disposable tracking
	const startChatCommand = vscode.commands.registerCommand('chatCatalyst.startChat', enhancedStartChat);

	// Add test command to verify extension is working
	const testCommand = vscode.commands.registerCommand('chatCatalyst.test', async () => {
		console.log('🧪 Test command executed!');
		vscode.window.showInformationMessage('✅ Chat Catalyst extension is working! Check the console for logs.');

		// Test workspace detection
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (workspaceFolder) {
			console.log(`📁 Workspace detected: ${workspaceFolder.uri.fsPath}`);
			const projectType = await detectProjectType();
			console.log(`🔍 Project type detected: ${projectType}`);
			vscode.window.showInformationMessage(`Workspace: ${workspaceFolder.name}, Project Type: ${projectType}`);
		} else {
			vscode.window.showWarningMessage('No workspace folder detected!');
		}
	});

	// Add template editing commands
	const editCustomInstructionsCommand = vscode.commands.registerCommand('chatCatalyst.editCustomInstructions', async () => {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'chatCatalyst.customInstructionsTemplate');
	});

	const editSessionStarterCommand = vscode.commands.registerCommand('chatCatalyst.editSessionStarter', async () => {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'chatCatalyst.sessionStarterTemplate');
	});

	const resetTemplatesCommand = vscode.commands.registerCommand('chatCatalyst.resetTemplates', async () => {
		const result = await vscode.window.showWarningMessage(
			'Reset templates to default? This will overwrite your customizations.',
			{ modal: true },
			'Reset', 'Cancel'
		);

		if (result === 'Reset') {
			const config = vscode.workspace.getConfiguration('chatCatalyst');
			await config.update('customInstructionsTemplate', undefined, vscode.ConfigurationTarget.Global);
			await config.update('sessionStarterTemplate', undefined, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage('✅ Templates reset to default!');
		}
	});

	// Track all disposables properly
	state.disposables.push(
		startChatCommand,
		testCommand,
		editCustomInstructionsCommand,
		editSessionStarterCommand,
		resetTemplatesCommand
	);
	context.subscriptions.push(
		startChatCommand,
		testCommand,
		editCustomInstructionsCommand,
		editSessionStarterCommand,
		resetTemplatesCommand
	);

	// Register cleanup to be called on deactivation
	const cleanupDisposable = {
		dispose: cleanup
	};
	context.subscriptions.push(cleanupDisposable);
	state.disposables.push(cleanupDisposable);

	// New Session Continuity Setup Functions

	// Check if custom instructions file exists
	async function checkCustomInstructions(): Promise<boolean> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return false;
		}

		const customInstructionsPath = path.join(workspaceFolder.uri.fsPath, '.github', 'copilot-instructions.md');
		return fs.existsSync(customInstructionsPath);
	}

	// Create custom instructions file for session continuity
	async function createCustomInstructions(): Promise<void> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return;
		}

		const githubDir = path.join(workspaceFolder.uri.fsPath, '.github');
		const customInstructionsPath = path.join(githubDir, 'copilot-instructions.md');

		// Ensure .github directory exists
		if (!fs.existsSync(githubDir)) {
			fs.mkdirSync(githubDir, { recursive: true });
		}

		// Get template from settings
		const config = vscode.workspace.getConfiguration('chatCatalyst');
		const templateContent = config.get<string>('customInstructionsTemplate', '');

		// Debug logging
		console.log('🔍 Debug: Reading custom instructions template from settings...');
		console.log('📝 Template length:', templateContent.length);
		console.log('📝 Template starts with:', templateContent.substring(0, 100));

		// Apply template variables
		const projectName = path.basename(workspaceFolder.uri.fsPath);
		const projectType = await detectProjectType();
		const currentDate = new Date().toISOString().split('T')[0];

		console.log('🔧 Variables:', { projectName, projectType, currentDate });

		const instructionsContent = templateContent
			.replace(/\{\{PROJECT_NAME\}\}/g, projectName)
			.replace(/\{\{PROJECT_TYPE\}\}/g, projectType)
			.replace(/\{\{DATE\}\}/g, currentDate);

		console.log('📄 Final content length:', instructionsContent.length);
		console.log('📄 Final content starts with:', instructionsContent.substring(0, 100));

		fs.writeFileSync(customInstructionsPath, instructionsContent);
		console.log(`✅ Created custom instructions: ${customInstructionsPath}`);
	}

	// Detect project type based on files and structure
	async function detectProjectType(): Promise<string> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return 'general';
		}

		const basePath = workspaceFolder.uri.fsPath;

		// Check for specific project indicators
		if (fs.existsSync(path.join(basePath, 'package.json'))) {
			const packageJson = JSON.parse(fs.readFileSync(path.join(basePath, 'package.json'), 'utf8'));

			// Check for specific frameworks
			if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
				return 'react';
			}
			if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
				return 'nextjs';
			}
			if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
				return 'vue';
			}
			if (packageJson.dependencies?.angular || packageJson.devDependencies?.angular) {
				return 'angular';
			}
			if (packageJson.dependencies?.express || packageJson.devDependencies?.express) {
				return 'nodejs-express';
			}
			if (packageJson.dependencies?.vscode || packageJson.devDependencies?.vscode) {
				return 'vscode-extension';
			}

			return 'nodejs';
		}

		if (fs.existsSync(path.join(basePath, 'requirements.txt')) || fs.existsSync(path.join(basePath, 'pyproject.toml'))) {
			return 'python';
		}

		if (fs.existsSync(path.join(basePath, 'Cargo.toml'))) {
			return 'rust';
		}
		if (fs.existsSync(path.join(basePath, 'go.mod'))) {
			return 'go';
		}
		if (fs.existsSync(path.join(basePath, 'pom.xml')) || fs.existsSync(path.join(basePath, 'build.gradle'))) {
			return 'java';
		}
		if (fs.existsSync(path.join(basePath, '*.csproj')) || fs.existsSync(path.join(basePath, '*.sln'))) {
			return 'dotnet';
		}

		return 'general';
	}

	// Create Session_starter.md template based on project type
	async function createSessionStarter(projectType: string): Promise<void> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return;
		}

		const sessionStarterPath = path.join(workspaceFolder.uri.fsPath, 'Session_starter.md');
		if (fs.existsSync(sessionStarterPath)) {
			return; // Don't overwrite existing file
		}

		const projectName = path.basename(workspaceFolder.uri.fsPath);
		const currentDate = new Date().toISOString().split('T')[0];

		const sessionContent = generateSessionTemplate(projectName, projectType, currentDate);
		fs.writeFileSync(sessionStarterPath, sessionContent);
		console.log(`✅ Created Session_starter.md for ${projectType} project: ${sessionStarterPath}`);
	}

	// Generate session template based on project type
	function generateSessionTemplate(projectName: string, projectType: string, date: string): string {
		const techStack = getTechStackForProjectType(projectType);
		const commonCommands = getCommonCommandsForProjectType(projectType);

		// Get template from settings
		const config = vscode.workspace.getConfiguration('chatCatalyst');
		const templateContent = config.get<string>('sessionStarterTemplate', '');

		// Prepare tech stack string
		const techStackString = techStack.technologies.map(tech => `- ${tech}`).join('\n');
		const commonCommandsString = commonCommands.map(cmd => `- \`${cmd}\``).join('\n');

		// Apply template variables
		return templateContent
			.replace(/\{\{PROJECT_NAME\}\}/g, projectName)
			.replace(/\{\{PROJECT_TYPE\}\}/g, techStack.type)
			.replace(/\{\{DATE\}\}/g, date)
			.replace(/\{\{TECH_STACK\}\}/g, techStackString)
			.replace(/\{\{COMMON_COMMANDS\}\}/g, commonCommandsString);
	}

	// Get technology stack information for project type
	function getTechStackForProjectType(projectType: string): { type: string; technologies: string[] } {
		const stacks: Record<string, { type: string; technologies: string[] }> = {
			'react': {
				type: 'React Web Application',
				technologies: ['React', 'JavaScript/TypeScript', 'HTML/CSS', 'Node.js', 'Webpack/Vite']
			},
			'nextjs': {
				type: 'Next.js Full-Stack Application',
				technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Vercel/SSR']
			},
			'vue': {
				type: 'Vue.js Web Application',
				technologies: ['Vue.js', 'JavaScript/TypeScript', 'HTML/CSS', 'Node.js', 'Vite']
			},
			'angular': {
				type: 'Angular Web Application',
				technologies: ['Angular', 'TypeScript', 'HTML/CSS', 'Node.js', 'Angular CLI']
			},
			'nodejs': {
				type: 'Node.js Application',
				technologies: ['Node.js', 'JavaScript/TypeScript', 'NPM/Yarn', 'Express/Fastify']
			},
			'nodejs-express': {
				type: 'Node.js Express Application',
				technologies: ['Node.js', 'Express.js', 'JavaScript/TypeScript', 'NPM/Yarn']
			},
			'vscode-extension': {
				type: 'VS Code Extension',
				technologies: ['TypeScript', 'VS Code Extension API', 'Node.js', 'Webpack']
			},
			'python': {
				type: 'Python Application',
				technologies: ['Python', 'pip/poetry', 'Virtual Environment', 'pytest']
			},
			'rust': {
				type: 'Rust Application',
				technologies: ['Rust', 'Cargo', 'rustc', 'Crates.io']
			},
			'go': {
				type: 'Go Application',
				technologies: ['Go', 'Go Modules', 'go build', 'go test']
			},
			'java': {
				type: 'Java Application',
				technologies: ['Java', 'Maven/Gradle', 'JUnit', 'Spring Framework']
			},
			'dotnet': {
				type: '.NET Application',
				technologies: ['.NET Core/Framework', 'C#', 'NuGet', 'MSBuild']
			}
		};

		return stacks[projectType] || {
			type: 'General Development Project',
			technologies: ['Various technologies', 'Project-specific tools']
		};
	}

	// Get common commands for project type
	function getCommonCommandsForProjectType(projectType: string): string[] {
		const commands: Record<string, string[]> = {
			'react': ['npm start', 'npm run build', 'npm test', 'npm install'],
			'nextjs': ['npm run dev', 'npm run build', 'npm run start', 'npm install'],
			'vue': ['npm run serve', 'npm run build', 'npm test', 'npm install'],
			'angular': ['ng serve', 'ng build', 'ng test', 'npm install'],
			'nodejs': ['npm start', 'npm run dev', 'npm test', 'npm install'],
			'nodejs-express': ['npm start', 'npm run dev', 'npm test', 'npm install'],
			'vscode-extension': ['npm run compile', 'npm run watch', 'npm run test', 'F5 (Debug)'],
			'python': ['python main.py', 'pip install -r requirements.txt', 'pytest', 'python -m venv venv'],
			'rust': ['cargo run', 'cargo build', 'cargo test', 'cargo check'],
			'go': ['go run .', 'go build', 'go test', 'go mod tidy'],
			'java': ['mvn spring-boot:run', 'mvn clean install', 'mvn test', 'gradle build'],
			'dotnet': ['dotnet run', 'dotnet build', 'dotnet test', 'dotnet restore']
		};

		return commands[projectType] || ['[Add project-specific commands]'];
	}

	// Build session startup prompt that references Session_starter.md
	async function buildSessionStartupPrompt(): Promise<string> {
		return `#file:Session_starter.md

🎯 **Session Context Loaded**

I've attached the Session_starter.md file which contains the project context and current state for this session. Please:

1. **Review the session file** for project overview, current status, and established patterns
2. **Follow the documented technical decisions** and architectural patterns
3. **Update the session file** as we make progress with new discoveries and achievements
4. **Maintain project continuity** by building upon previous session work

Ready to continue where we left off! 🚀`;
	}

	// Enhanced startChat command that handles session continuity setup
	async function enhancedStartChat(): Promise<void> {
		if (state.isExecuting) {
			console.log('⏳ Already executing, skipping...');
			return;
		}

		state.isExecuting = true;

		try {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder open. Please open a project folder first.');
				return;
			}

			console.log('🚀 Starting enhanced Chat Catalyst...');

			// Check if this is a new project setup
			const hasCustomInstructions = await checkCustomInstructions();
			const sessionStarterPath = path.join(workspaceFolder.uri.fsPath, 'Session_starter.md');
			let sessionStarterExists = fs.existsSync(sessionStarterPath);

			const setupChanges: string[] = [];

			// Always create/update custom instructions to reflect template changes
			await createCustomInstructions();
			if (!hasCustomInstructions) {
				setupChanges.push('Created .github/copilot-instructions.md for session continuity');
			} else {
				setupChanges.push('Updated .github/copilot-instructions.md with latest template');
			}

			// Create Session_starter.md if missing (don't overwrite existing)
			if (!sessionStarterExists) {
				const projectType = await detectProjectType();
				await createSessionStarter(projectType);
				setupChanges.push(`Created Session_starter.md template for ${projectType} project`);
				sessionStarterExists = true; // Update flag since we just created it
			}

			// Show setup confirmation if we created files
			if (setupChanges.length > 0) {
				const message = `🎯 Session Continuity Setup Complete!\n\n${setupChanges.join('\n')}\n\nYour project now has persistent AI memory across sessions!`;
				vscode.window.showInformationMessage(message);
			}

			// Open Copilot Chat
			await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
			await new Promise(resolve => setTimeout(resolve, 500));

			// Always prioritize session startup prompt if Session_starter.md exists or was just created
			if (sessionStarterExists) {
				console.log('🎯 Using session startup prompt - Session_starter.md exists');
				const promptToUse = await buildSessionStartupPrompt();
				const success = await injectPromptToChat(promptToUse);
				if (!success) {
					vscode.window.showWarningMessage('Failed to inject session startup prompt. Chat might not be focused.');
				} else {
					console.log('✅ Session startup prompt injected successfully');
				}
			} else {
				// No Session_starter.md available
				console.log('📋 No Session_starter.md found, opening empty chat');
				vscode.window.showInformationMessage('Chat Catalyst activated! Session_starter.md will be created automatically for project continuity.');
			}

		} finally {
			createManagedTimer(() => {
				state.isExecuting = false;
			}, 1000);
		}
	}

	// Helper function to inject any prompt to chat
	async function injectPromptToChat(prompt: string): Promise<boolean> {
		try {
			// Focus chat and wait
			await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
			await new Promise(resolve => setTimeout(resolve, 300));

			// Type the prompt
			await vscode.commands.executeCommand('type', { text: prompt });
			console.log(`📝 Injected prompt (${prompt.length} characters)`);

			return true;
		} catch (error) {
			console.error('❌ Failed to inject prompt:', error);
			return false;
		}
	}
}

export function deactivate() {
	console.log('🧹 Chat Catalyst is deactivating, cleaning up resources...');
	// Cleanup will be handled by the dispose method registered in activate()
}
