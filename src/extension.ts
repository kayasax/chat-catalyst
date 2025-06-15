import * as vscode from 'vscode';
import { SessionPrimerManager } from './sessionPrimers';
import { TemplateConfigurationUI } from './templateUI';

export function activate(context: vscode.ExtensionContext) {
	console.log('🚀 Chat Catalyst 1.1: Perfect Session Primers is now active!');

	// Initialize session primer system
	const sessionManager = new SessionPrimerManager(context);
	const templateUI = new TemplateConfigurationUI(sessionManager);

	// Track if we're currently executing to prevent conflicts
	let isExecuting = false;

	// Get extension configuration
	function getConfig() {
		return vscode.workspace.getConfiguration('chatCatalyst');
	}

	// Check if auto-injection is enabled and get the session primer or custom prompt
	async function getSessionPrimer(): Promise<string | null> {
		const config = getConfig();
		const enabled = config.get<boolean>('enabled', true);

		if (!enabled) return null;

		// First try to get session primer from user profile
		const workspaceId = sessionManager.getCurrentWorkspaceId();
		const userProfile = await sessionManager.getUserProfile(workspaceId);

		if (userProfile) {
			try {
				const sessionPrimer = sessionManager.generatePrompt(userProfile.placeholderValues);
				if (sessionPrimer) {
					console.log('📋 Using session primer from user profile');
					return sessionPrimer;
				}
			} catch (error) {
				console.log('⚠️ Failed to generate session primer, falling back to custom prompt:', error);
			}
		}

		// Fallback to custom auto-prompt from settings
		const autoPrompt = config.get<string>('autoPrompt', '');
		return autoPrompt || null;
	}

	// Function to detect if chat is currently open and focused
	async function isChatOpen(): Promise<boolean> {
		try {
			// Try to get current active editor/panel information
			const allCommands = await vscode.commands.getCommands();
			const chatCommands = allCommands.filter(cmd =>
				cmd.includes('chat') && cmd.includes('focus')
			);

			// If we have chat focus commands available, chat is likely installed
			return chatCommands.length > 0;
		} catch (error) {
			console.log('Could not detect chat state:', error);
			return false;
		}
	}

	// Function to clear existing text in chat input field
	async function clearChatInput(): Promise<boolean> {
		console.log('🧹 Clearing existing chat input text...');

		try {
			// Method 1: Select all and delete
			try {
				await vscode.commands.executeCommand('editor.action.selectAll');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteLeft');
				console.log('✅ Text cleared via selectAll + delete');
				return true;
			} catch (method1Error) {
				console.log('❌ Method 1 failed:', method1Error);
			}

			// Method 2: Ctrl+A + Delete key
			try {
				await vscode.commands.executeCommand('editor.action.selectAll');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteAllLeft');
				console.log('✅ Text cleared via selectAll + deleteAllLeft');
				return true;
			} catch (method2Error) {
				console.log('❌ Method 2 failed:', method2Error);
			}

			// Method 3: Multiple backspace commands
			try {
				// Select all first, then delete
				await vscode.commands.executeCommand('cursorEnd');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('cursorHomeSelect');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteLeft');
				console.log('✅ Text cleared via cursor + select + delete');
				return true;
			} catch (method3Error) {
				console.log('❌ Method 3 failed:', method3Error);
			}

			console.log('⚠️ All text clearing methods failed, continuing anyway...');
			return false;
		} catch (error) {
			console.log('⚠️ Could not clear existing text:', error);
			return false;
		}
	}

	// Simple, reliable function to inject session primer with better state management
	async function injectSessionPrimer(): Promise<boolean> {
		const sessionPrimer = await getSessionPrimer();
		if (!sessionPrimer) return false;

		console.log('🔄 Injecting session primer:', sessionPrimer.substring(0, 50) + '...');

		try {
			// Store original clipboard with better error handling
			let originalClipboard = '';
			try {
				originalClipboard = await vscode.env.clipboard.readText();
			} catch (clipError) {
				console.log('⚠️ Could not read clipboard, continuing anyway...');
			}

			// Step 1: Clear any existing text in the input field
			console.log('🧹 Clearing existing text...');
			const cleared = await clearChatInput();
			if (cleared) {
				console.log('✅ Existing text successfully cleared');
			} else {
				console.log('⚠️ Could not clear existing text, continuing anyway...');
			}

			// Small delay after clearing
			await new Promise(resolve => setTimeout(resolve, 100));

			// Step 2: Put session primer in clipboard
			await vscode.env.clipboard.writeText(sessionPrimer);

			// Shorter delay for faster response
			await new Promise(resolve => setTimeout(resolve, 150));

			// Step 3: Try type command first (most reliable when input is focused)
			try {
				await vscode.commands.executeCommand('type', { text: sessionPrimer });
				console.log('✅ Session primer injected via type command');
				vscode.window.setStatusBarMessage('✅ Session primer injected!', 2000);

				// Restore clipboard after success - with error handling
				setTimeout(async () => {
					try {
						if (originalClipboard !== undefined) {
							await vscode.env.clipboard.writeText(originalClipboard);
						}
					} catch (restoreError) {
						console.log('⚠️ Could not restore clipboard:', restoreError);
					}
				}, 800);
				return true;
			} catch (typeError) {
				console.log('Type failed, trying paste:', typeError);

				// Step 4: Fallback to paste
				try {
					await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
					console.log('✅ Session primer injected via paste command');
					vscode.window.setStatusBarMessage('✅ Session primer injected!', 2000);

					// Restore clipboard after success - with error handling
					setTimeout(async () => {
						try {
							if (originalClipboard !== undefined) {
								await vscode.env.clipboard.writeText(originalClipboard);
							}
						} catch (restoreError) {
							console.log('⚠️ Could not restore clipboard:', restoreError);
						}
					}, 800);
					return true;
				} catch (pasteError) {
					console.log('Both type and paste failed:', pasteError);
					vscode.window.setStatusBarMessage('📋 Session primer in clipboard - paste with Ctrl+V', 4000);

					// Don't restore clipboard so user can paste manually
					return false;
				}
			}
		} catch (error) {
			console.error('Session primer injection failed:', error);
			vscode.window.setStatusBarMessage('❌ Session primer injection failed', 2000);
			return false;
		}
	}

	// Create a chat handler that auto-injects the session primer
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {

		// Get the session primer from settings
		const sessionPrimer = await getSessionPrimer();

		// Initialize the messages array
		const messages: vscode.LanguageModelChatMessage[] = [];

		// If session primer is available, add it as the first system message
		if (sessionPrimer) {
			messages.push(vscode.LanguageModelChatMessage.User(sessionPrimer));
		}

		// Get all the previous participant messages from chat history
		const previousMessages = context.history.filter(
			(h) => h instanceof vscode.ChatResponseTurn
		);

		// Add the previous messages to maintain conversation context
		previousMessages.forEach((m) => {
			let fullMessage = '';
			m.response.forEach((r) => {
				const mdPart = r as vscode.ChatResponseMarkdownPart;
				fullMessage += mdPart.value.value;
			});
			messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
		});

		// Add the user's current message
		messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

		try {
			// Send the request to the language model
			const chatResponse = await request.model.sendRequest(messages, {}, token);

			// Stream the response back to the user
			for await (const fragment of chatResponse.text) {
				stream.markdown(fragment);
			}
		} catch (error) {
			// Handle errors gracefully
			stream.markdown(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
		}

		return;
	};

	// Create the chat participant
	const catalyst = vscode.chat.createChatParticipant("chat-catalyst.auto-prompter", handler);

	// Set the icon for the participant
	catalyst.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');
	// Register a command to start chat with auto-prompt - FAST & RELIABLE VERSION
	const startChatCommand = vscode.commands.registerCommand('chatCatalyst.startChat', async () => {
		// Prevent multiple simultaneous executions
		if (isExecuting) {
			console.log('⚠️ Command already executing, ignoring duplicate call');
			vscode.window.setStatusBarMessage('⚠️ Chat Catalyst is already running...', 1500);
			return;
		}

		isExecuting = true;
		console.log('🚀 Start Chat command triggered!');

		try {
			const sessionPrimer = await getSessionPrimer();
			if (!sessionPrimer) {
				vscode.window.showWarningMessage('No session primer configured. Use "Chat Catalyst: Configure Session Primer" to set one.');
				return;
			}

			console.log('📝 Session primer configured:', sessionPrimer.substring(0, 50) + '...');

			// Step 1: Fast chat opening strategy - try most reliable commands first
			console.log('🎯 Opening chat...');

			let chatOpened = false;

			// Primary strategy: Focus existing chat panel
			try {
				await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
				console.log('✅ Chat panel focused');
				chatOpened = true;
			} catch (error) {
				console.log('Chat panel focus failed, trying alternatives...');

				// Secondary strategy: Open chat dialog
				try {
					await vscode.commands.executeCommand('workbench.action.chat.open');
					console.log('✅ Chat opened via action.chat.open');
					chatOpened = true;
				} catch (altError) {
					console.log('Chat open failed, trying GitHub Copilot specific commands...');

					// Tertiary strategy: GitHub Copilot specific
					try {
						await vscode.commands.executeCommand('github.copilot.chat.focus');
						console.log('✅ GitHub Copilot Chat focused');
						chatOpened = true;
					} catch (copilotError) {
						console.log('All chat opening methods failed');

						// Show user-friendly error with options
						const result = await vscode.window.showErrorMessage(
							'Could not automatically open chat. Is GitHub Copilot installed and enabled?',
							'Try Manual Open',
							'Install Copilot',
							'Cancel'
						);

						if (result === 'Try Manual Open') {
							vscode.window.showInformationMessage(
								'Please open GitHub Copilot Chat manually:\n• Click GitHub Copilot icon in Activity Bar\n• Or use Ctrl+Shift+P → "Chat: Focus on Chat View"'
							);
						} else if (result === 'Install Copilot') {
							vscode.commands.executeCommand('workbench.extensions.search', 'GitHub.copilot');
						}
						return;
					}
				}
			}

			// Step 2: Quick initialization wait (reduced from 1000ms to 500ms)
			console.log('⏳ Brief initialization wait...');
			await new Promise(resolve => setTimeout(resolve, 500));

			// Step 3: Focus input field with quick fallback
			console.log('🎯 Focusing input field...');
			try {
				await vscode.commands.executeCommand('workbench.action.chat.focusInput');
				console.log('✅ Input focused');
			} catch (focusError) {
				console.log('Input focus failed, using general focus...');
				// Don't fail here, just continue - sometimes focus isn't needed
			}

			// Small delay for focus to settle
			await new Promise(resolve => setTimeout(resolve, 200));

			// Step 4: Fast prompt injection
			console.log('💉 Injecting prompt...');
			const success = await injectSessionPrimer();

			if (success) {
				console.log('🎉 Success! Prompt injected and chat ready.');
				vscode.window.setStatusBarMessage('🎉 Chat started with auto-prompt!', 2000);
			} else {
				console.log('⚠️ Injection failed, providing quick fallback.');
				vscode.window.setStatusBarMessage('📋 Prompt in clipboard - paste with Ctrl+V', 3000);

				// Quick retry option
				const retry = await vscode.window.showWarningMessage(
					'Auto-injection failed. Prompt is in clipboard.',
					'Try Again',
					'Paste Now'
				);

				if (retry === 'Try Again') {
					// Quick retry without delay
					isExecuting = false;
					setTimeout(() => vscode.commands.executeCommand('chatCatalyst.startChat'), 500);
					return;
				}
			}

		} catch (error) {
			console.error('❌ Start chat command failed:', error);
			vscode.window.showErrorMessage(`Chat Catalyst failed: ${error}`);
		} finally {
			// Reset execution flag quickly for better responsiveness
			setTimeout(() => {
				isExecuting = false;
				console.log('🏁 Command ready for next use');
			}, 100); // Reduced from 200ms to 100ms
		}
	});

	// Register a simple test command to verify extension is working
	const testCommand = vscode.commands.registerCommand('chatCatalyst.test', () => {
		console.log('Test command executed!');
		vscode.window.showInformationMessage('🎉 Chat Catalyst extension is working! Commands are registered correctly.');
	});

	// Register a debug command to list available chat commands
	const debugCommand = vscode.commands.registerCommand('chatCatalyst.debug', async () => {
		console.log('Debug command executed!');

		const allCommands = await vscode.commands.getCommands();
		const chatCommands = allCommands.filter(cmd =>
			cmd.toLowerCase().includes('chat') ||
			cmd.toLowerCase().includes('copilot')
		);

		console.log('Available chat/copilot commands:');
		chatCommands.forEach(cmd => console.log(`  - ${cmd}`));

		// Test specific GitHub Copilot commands
		const testCommands = [
			'github.copilot.chat.focus',
			'workbench.panel.chat.view.copilot.focus',
			'workbench.view.extension.github-copilot-chat',
			'workbench.action.chat.open',
			'workbench.action.chat.focusInput'
		];

		console.log('\nTesting specific commands:');
		for (const cmd of testCommands) {
			const exists = allCommands.includes(cmd);
			console.log(`  ${cmd}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
		}

		vscode.window.showInformationMessage(
			`Found ${chatCommands.length} chat/copilot commands. Check Developer Console for full list.`,
			'Open Console',
			'Test Chat Open'
		).then(async selection => {
			if (selection === 'Open Console') {
				vscode.commands.executeCommand('workbench.action.toggleDevTools');
			} else if (selection === 'Test Chat Open') {
				// Test each command manually
				for (const cmd of testCommands) {
					if (allCommands.includes(cmd)) {
						try {
							console.log(`Testing command: ${cmd}`);
							await vscode.commands.executeCommand(cmd);
							vscode.window.showInformationMessage(`✅ ${cmd} worked!`);
							break;
						} catch (error) {
							console.log(`❌ ${cmd} failed:`, error);
						}
					}
				}
			}
		});
	});

	// Register session primer management commands
	const configureSessionPrimerCommand = vscode.commands.registerCommand('chatCatalyst.configureSessionPrimer', async () => {
		try {
			const values = await templateUI.configureSessionPrimer();
			if (values) {
				// Save the configuration
				const workspaceId = sessionManager.getCurrentWorkspaceId();
				const profile = {
					placeholderValues: values,
					workspaceId: workspaceId,
					lastUpdated: new Date()
				};
				
				await sessionManager.saveUserProfile(profile);
				vscode.window.showInformationMessage('✅ Session primer configured successfully!');
			}
		} catch (error) {
			console.error('Session primer configuration failed:', error);
			vscode.window.showErrorMessage('Failed to configure session primer: ' + error);
		}
	});

	const manageSessionPrimersCommand = vscode.commands.registerCommand('chatCatalyst.manageSessionPrimers', async () => {
		try {
			await templateUI.showManageTemplates();
		} catch (error) {
			console.error('Session primer management failed:', error);
			vscode.window.showErrorMessage('Failed to manage session primers: ' + error);
		}
	});

	const quickConfigureCommand = vscode.commands.registerCommand('chatCatalyst.quickConfigure', async () => {
		try {
			const prompt = await templateUI.showQuickConfiguration();
			if (prompt) {
				vscode.window.showInformationMessage('✅ Quick session primer configured successfully!');
			}
		} catch (error) {
			console.error('Quick configuration failed:', error);
			vscode.window.showErrorMessage('Failed to quick configure: ' + error);
		}
	});

	// Keep the old editPrompt command for backward compatibility but update it
	const editPromptCommand = vscode.commands.registerCommand('chatCatalyst.editPrompt', async () => {
		const choice = await vscode.window.showQuickPick([
			{ label: '🔧 Configure Session Primer (Recommended)', value: 'configure' },
			{ label: '📝 Edit Simple Auto-Prompt (Legacy)', value: 'legacy' }
		], {
			title: 'Chat Catalyst - Choose Configuration Method',
			placeHolder: 'How would you like to configure your prompt?'
		});

		if (choice?.value === 'configure') {
			await vscode.commands.executeCommand('chatCatalyst.configureSessionPrimer');
		} else if (choice?.value === 'legacy') {
			// Legacy simple prompt editing
			const config = getConfig();
			const currentPrompt = config.get<string>('autoPrompt', '');

			const newPrompt = await vscode.window.showInputBox({
				title: 'Edit Auto-Prompt (Legacy)',
				prompt: 'Enter your custom auto-prompt (tip: use \\n for line breaks)',
				value: currentPrompt,
				ignoreFocusOut: true,
				placeHolder: 'Enter your auto-prompt here...'
			});

			if (newPrompt !== undefined) {
				await config.update('autoPrompt', newPrompt, vscode.ConfigurationTarget.Global);
				const promptPreview = newPrompt.length > 100
					? newPrompt.substring(0, 100) + '...'
					: newPrompt;

				vscode.window.setStatusBarMessage(
					`✅ Auto-prompt updated! Preview: "${promptPreview}"`,
					4000
				);
			}
		}
	});

	// Register a command to toggle auto-prompt on/off
	const toggleCommand = vscode.commands.registerCommand('chatCatalyst.toggle', async () => {
		const config = getConfig();
		const currentEnabled = config.get<boolean>('enabled', true);
		const newEnabled = !currentEnabled;

		await config.update('enabled', newEnabled, vscode.ConfigurationTarget.Global);

		const status = newEnabled ? 'enabled' : 'disabled';
		vscode.window.showInformationMessage(`Chat Catalyst auto-injection ${status}`);
	});

	// Add commands to the extension context
	context.subscriptions.push(
		startChatCommand, 
		editPromptCommand, 
		toggleCommand, 
		testCommand, 
		debugCommand,
		configureSessionPrimerCommand,
		manageSessionPrimersCommand,
		quickConfigureCommand
	);
	console.log('Chat Catalyst commands registered successfully!');
	// Show a welcome message when the extension activates
	const message = 'Chat Catalyst 1.1 is ready! Enhanced with perfect session primers.';

	vscode.window.showInformationMessage(message, 'Start Chat', 'Configure Session Primer', 'Open Settings').then(async selection => {
		console.log('Welcome action selected:', selection);

		if (selection === 'Start Chat') {
			console.log('🚀 Starting chat from welcome button (immediate)...');
			try {
				await vscode.commands.executeCommand('chatCatalyst.startChat');
			} catch (error) {
				console.error('Start chat from welcome failed:', error);
				vscode.window.showErrorMessage('Failed to start chat. Try using Ctrl+Alt+C instead.');
			}
		} else if (selection === 'Configure Session Primer') {
			vscode.commands.executeCommand('chatCatalyst.configureSessionPrimer');
		} else if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'chatCatalyst');
		}
	});
}

export function deactivate() { }
