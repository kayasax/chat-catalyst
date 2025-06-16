import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('🚀 Chat Catalyst extension is now active!');

	// Track if we're currently executing to prevent conflicts
	let isExecuting = false;

	// Get extension configuration
	function getConfig() {
		return vscode.workspace.getConfiguration('chatCatalyst');
	}

	// Check if auto-injection is enabled and get the custom prompt
	function getAutoPrompt(): string | null {
		const config = getConfig();
		const enabled = config.get<boolean>('enabled', true);
		const autoPrompt = config.get<string>('autoPrompt', '');

		return enabled && autoPrompt ? autoPrompt : null;
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
		// console.log('🧹 Clearing existing chat input text...');

		try {
			// Method 1: Select all and delete
			try {
				await vscode.commands.executeCommand('editor.action.selectAll');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteLeft');
				// console.log('✅ Text cleared via selectAll + delete');
				return true;
			} catch (method1Error) {
				// console.log('❌ Method 1 failed:', method1Error);
			}

			// Method 2: Ctrl+A + Delete key
			try {
				await vscode.commands.executeCommand('editor.action.selectAll');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteAllLeft');
				// console.log('✅ Text cleared via selectAll + deleteAllLeft');
				return true;
			} catch (method2Error) {
				// console.log('❌ Method 2 failed:', method2Error);
			}

			// Method 3: Multiple backspace commands
			try {
				// Select all first, then delete
				await vscode.commands.executeCommand('cursorEnd');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('cursorHomeSelect');
				await new Promise(resolve => setTimeout(resolve, 50));
				await vscode.commands.executeCommand('deleteLeft');
				// console.log('✅ Text cleared via cursor + select + delete');
				return true;
			} catch (method3Error) {
				// console.log('❌ Method 3 failed:', method3Error);
			}

			console.log('⚠️ All text clearing methods failed, continuing anyway...');
			return false;
		} catch (error) {
			console.log('⚠️ Could not clear existing text:', error);
			return false;
		}
	}
	// Simple, reliable function to inject auto-prompt with better state management
	async function injectAutoPrompt(): Promise<boolean> {
		const autoPrompt = getAutoPrompt();
		if (!autoPrompt) { return false; }

		// console.log('🔄 Injecting prompt:', autoPrompt.substring(0, 50) + '...');

		try {
			// Store original clipboard with better error handling
			let originalClipboard = '';
			try {
				originalClipboard = await vscode.env.clipboard.readText();
			} catch {
				// console.log('⚠️ Could not read clipboard, continuing anyway...');
			}

			// Step 1: Clear any existing text in the input field
			// console.log('🧹 Clearing existing text...');
			const cleared = await clearChatInput();
			if (!cleared) {
				// console.log('⚠️ Could not clear existing text, continuing anyway...');
			}			// Minimal delay after clearing (reduced to 10ms)
			await new Promise(resolve => setTimeout(resolve, 10));

			// Step 2: Put prompt in clipboard
			await vscode.env.clipboard.writeText(autoPrompt);			// Faster delay for better responsiveness (reduced to 10ms)
			await new Promise(resolve => setTimeout(resolve, 10));

			// Step 3: Try type command first (most reliable when input is focused)
			try {
				await vscode.commands.executeCommand('type', { text: autoPrompt });				console.log('✅ Prompt injected successfully');
				vscode.window.setStatusBarMessage('✅ Prompt injected!', 2000);

				// Fast clipboard restore after success
				setTimeout(async () => {
					try {
						if (originalClipboard !== undefined) {
							await vscode.env.clipboard.writeText(originalClipboard);
						}
					} catch {
						// console.log('⚠️ Could not restore clipboard:', restoreError);
					}
				}, 200);
				return true;
			} catch {
				// console.log('Type failed, trying paste:', typeError);

				// Step 4: Fallback to paste
				try {
					await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
					console.log('✅ Prompt injected via paste fallback');
					vscode.window.setStatusBarMessage('✅ Prompt injected!', 2000);

					// Restore clipboard after success - with error handling
					setTimeout(async () => {
						try {
							if (originalClipboard !== undefined) {
								await vscode.env.clipboard.writeText(originalClipboard);
							}
						} catch {
							// console.log('⚠️ Could not restore clipboard:', restoreError);
						}
					}, 800);
					return true;
				} catch {
					console.log('❌ Both type and paste failed - prompt in clipboard');
					vscode.window.setStatusBarMessage('📋 Prompt in clipboard - paste with Ctrl+V', 4000);

					// Don't restore clipboard so user can paste manually
					return false;
				}
			}
		} catch (error) {
			console.error('❌ Injection failed:', error);
			vscode.window.setStatusBarMessage('❌ Injection failed', 2000);
			return false;
		}
	}

	// Create a chat handler that auto-injects the custom prompt
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {

		// Get the auto-prompt from settings
		const autoPrompt = getAutoPrompt();

		// Initialize the messages array
		const messages: vscode.LanguageModelChatMessage[] = [];

		// If auto-prompt is enabled, add it as the first system message
		if (autoPrompt) {
			messages.push(vscode.LanguageModelChatMessage.User(autoPrompt));
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
			const autoPrompt = getAutoPrompt();
			if (!autoPrompt) {
				vscode.window.showWarningMessage('No auto-prompt configured. Use "Chat Catalyst: Edit Auto-Prompt" to set one.');
				return;
			}			// console.log('📝 Auto-prompt configured:', autoPrompt.substring(0, 50) + '...');			// Step 1: Fast chat opening strategy - try most reliable commands first
			// console.log('🎯 Opening chat...');

			// Primary strategy: Focus existing chat panel
			try {
				await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
				// console.log('✅ Chat panel focused');
			} catch {
				// console.log('Chat panel focus failed, trying alternatives...');

				// Secondary strategy: Open chat dialog
				try {
					await vscode.commands.executeCommand('workbench.action.chat.open');
					// console.log('✅ Chat opened via action.chat.open');
				} catch {
					// console.log('Chat open failed, trying GitHub Copilot specific commands...');

					// Tertiary strategy: GitHub Copilot specific
					try {
						await vscode.commands.executeCommand('github.copilot.chat.focus');
						console.log('✅ Chat Catalyst: GitHub Copilot Chat focused');
					} catch {
						console.log('❌ Chat Catalyst: All chat opening methods failed');

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
			}			// Step 2: Minimal initialization wait (reduced to 25ms for faster response)
			// console.log('⏳ Brief initialization wait...');
			await new Promise(resolve => setTimeout(resolve, 25));

			// Step 3: Focus input field with quick fallback
			// console.log('🎯 Focusing input field...');
			try {
				await vscode.commands.executeCommand('workbench.action.chat.focusInput');
				// console.log('✅ Input focused');
			} catch {
				// console.log('Input focus failed, using general focus...');
				// Don't fail here, just continue - sometimes focus isn't needed
			}			// Minimal delay for focus to settle (reduced to 10ms)
			await new Promise(resolve => setTimeout(resolve, 10));

			// Step 4: Fast prompt injection
			// console.log('💉 Injecting prompt...');
			const success = await injectAutoPrompt();

			if (success) {
				console.log('🎉 Chat Catalyst: Prompt injected successfully');
				vscode.window.setStatusBarMessage('🎉 Chat started with auto-prompt!', 2000);
			} else {
				console.log('⚠️ Chat Catalyst: Injection failed - prompt in clipboard');
				vscode.window.setStatusBarMessage('📋 Prompt in clipboard - paste with Ctrl+V', 3000);

				// Quick retry option
				const retry = await vscode.window.showWarningMessage(
					'Auto-injection failed. Prompt is in clipboard.',
					'Try Again',
					'Paste Now'
				);

				if (retry === 'Try Again') {					// Fast retry for better responsiveness
					isExecuting = false;
					setTimeout(() => vscode.commands.executeCommand('chatCatalyst.startChat'), 100);
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

	// Register a command to edit the auto-prompt (simple input box - no file operations)
	const editPromptCommand = vscode.commands.registerCommand('chatCatalyst.editPrompt', async () => {
		const config = getConfig();
		const currentPrompt = config.get<string>('autoPrompt', '');

		// Use simple input box - no file operations that trigger "Save As" dialogs
		const newPrompt = await vscode.window.showInputBox({
			title: 'Edit Auto-Prompt',
			prompt: 'Enter your custom auto-prompt (tip: use \\n for line breaks)',
			value: currentPrompt,
			ignoreFocusOut: true,
			placeHolder: 'Enter your auto-prompt here...'
		});

		if (newPrompt !== undefined) {
			// Update configuration directly - no file saving involved
			await config.update('autoPrompt', newPrompt, vscode.ConfigurationTarget.Global);

			// Show success message with preview
			const promptPreview = newPrompt.length > 100
				? newPrompt.substring(0, 100) + '...'
				: newPrompt;

			vscode.window.setStatusBarMessage(
				`✅ Auto-prompt updated! Preview: "${promptPreview}"`,
				4000
			);

			console.log('✅ Auto-prompt updated via input box');
		} else {
			vscode.window.setStatusBarMessage('Auto-prompt editing cancelled', 2000);
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
	context.subscriptions.push(startChatCommand, editPromptCommand, toggleCommand, testCommand, debugCommand);
	console.log('Chat Catalyst commands registered successfully!');
	// Show a welcome message when the extension activates
	const message = 'Chat Catalyst is ready! Press Ctrl+Alt+C to start chat with auto-prompt.';

	vscode.window.showInformationMessage(message, 'Start Chat', 'Edit Prompt', 'Open Settings').then(async selection => {
		console.log('Welcome action selected:', selection);

		if (selection === 'Start Chat') {
			console.log('🚀 Starting chat from welcome button (immediate)...');
			// Execute immediately without delay for faster response
			try {
				await vscode.commands.executeCommand('chatCatalyst.startChat');
			} catch (error) {
				console.error('Start chat from welcome failed:', error);
				vscode.window.showErrorMessage('Failed to start chat. Try using Ctrl+Alt+C instead.');
			}
		} else if (selection === 'Edit Prompt') {
			vscode.commands.executeCommand('chatCatalyst.editPrompt');
		} else if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'chatCatalyst');
		}
	});
}

export function deactivate() { }
