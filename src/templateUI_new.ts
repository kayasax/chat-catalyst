import * as vscode from 'vscode';
import { SessionPrimerManager, SessionTemplate, TemplatePlaceholder, UserSessionProfile } from './sessionPrimers';

export class TemplateConfigurationUI {
    private sessionManager: SessionPrimerManager;

    constructor(sessionManager: SessionPrimerManager) {
        this.sessionManager = sessionManager;
    }

    async configureSessionPrimer(): Promise<{ [key: string]: string } | null> {
        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        // If user already has a profile for this workspace, offer to use it
        if (existingProfile) {
            const useExisting = await vscode.window.showQuickPick([
                { label: '✅ Use existing session primer', value: 'existing' },
                { label: '🔧 Reconfigure session primer', value: 'reconfigure' },
                { label: '👁️ Preview current session primer', value: 'preview' }
            ], {
                title: 'Chat Catalyst - Existing Session Primer Found',
                placeHolder: 'You already have a session primer configured for this workspace...'
            });

            if (useExisting?.value === 'existing') {
                return existingProfile.placeholderValues;
            } else if (useExisting?.value === 'preview') {
                await this.previewSessionPrimer(existingProfile.placeholderValues);
                return null;
            } else if (useExisting?.value !== 'reconfigure') {
                return null;
            }
        }

        // Auto-detect workspace context to provide intelligent defaults
        const workspaceContext = await this.sessionManager.detectWorkspaceContext();
        const template = this.sessionManager.getUniversalTemplate();

        // Start with existing values or workspace-detected defaults
        const values: { [key: string]: string } = {};

        // Set intelligent defaults based on workspace detection
        for (const placeholder of template.placeholders) {
            if (existingProfile) {
                values[placeholder.key] = existingProfile.placeholderValues[placeholder.key] || placeholder.defaultValue || '';
            } else {
                // Provide intelligent defaults based on workspace detection
                switch (placeholder.key) {
                    case 'LANGUAGES':
                        values[placeholder.key] = workspaceContext.projectInfo.languages;
                        break;
                    case 'FRAMEWORKS':
                        values[placeholder.key] = workspaceContext.projectInfo.frameworks;
                        break;
                    case 'PROJECT_NAME':
                        const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name || 'My Project';
                        values[placeholder.key] = workspaceName;
                        break;
                    default:
                        values[placeholder.key] = placeholder.defaultValue || '';
                }
            }
        }

        // Configure each placeholder
        for (const placeholder of template.placeholders) {
            const result = await this.configureField(placeholder, values[placeholder.key]);
            if (result === null) {
                return null;
            }
            values[placeholder.key] = result;
        }

        // Offer to preview before saving
        const previewChoice = await vscode.window.showQuickPick([
            { label: '💾 Save session primer', value: 'save' },
            { label: '👁️ Preview session primer first', value: 'preview' }
        ], {
            title: 'Chat Catalyst - Configuration Complete',
            placeHolder: 'Your session primer is ready...'
        });

        if (previewChoice?.value === 'preview') {
            const shouldSave = await this.previewSessionPrimer(values);
            if (!shouldSave) {
                return null;
            }
        } else if (previewChoice?.value !== 'save') {
            return null;
        }

        return values;
    }

    private async configureField(placeholder: TemplatePlaceholder, currentValue: string): Promise<string | null> {
        switch (placeholder.type) {
            case 'text':
                return await vscode.window.showInputBox({
                    title: `Chat Catalyst - ${placeholder.label}`,
                    prompt: placeholder.description,
                    value: currentValue,
                    placeHolder: placeholder.defaultValue || `Enter ${placeholder.label.toLowerCase()}...`
                }) || null;

            case 'select':
                if (!placeholder.options) {
                    return currentValue;
                }

                const items = placeholder.options.map(option => ({
                    label: option,
                    picked: option === currentValue
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    title: `Chat Catalyst - ${placeholder.label}`,
                    placeHolder: placeholder.description,
                    canPickMany: false
                });

                return selected ? selected.label : null;

            case 'multiline':
                return await this.configureMultilineField(placeholder, currentValue);

            default:
                return currentValue;
        }
    }

    private async configureMultilineField(placeholder: TemplatePlaceholder, currentValue: string): Promise<string | null> {
        const initialContent = currentValue || placeholder.defaultValue || '';

        const doc = await vscode.workspace.openTextDocument({
            content: initialContent,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        const result = await vscode.window.showInformationMessage(
            `Edit ${placeholder.label} in the opened editor. Click 'Done' when finished.`,
            'Done',
            'Cancel'
        );

        const content = result === 'Done' ? editor.document.getText() : null;
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        return content;
    }

    private async previewSessionPrimer(values: { [key: string]: string }): Promise<boolean> {
        const prompt = this.sessionManager.generatePrompt(values);
        const truncated = prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt;

        const result = await vscode.window.showInformationMessage(
            `Preview of your session primer:\n\n${truncated}\n\nDoes this look good?`,
            'Yes, save it',
            'No, go back'
        );

        return result === 'Yes, save it';
    }

    async showQuickConfiguration(): Promise<string | null> {
        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        if (existingProfile) {
            return this.sessionManager.generatePrompt(existingProfile.placeholderValues);
        }

        const workspaceContext = await this.sessionManager.detectWorkspaceContext();

        // Quick configuration using intelligent defaults
        const template = this.sessionManager.getUniversalTemplate();
        const values: { [key: string]: string } = {};

        // Auto-fill with intelligent defaults
        for (const placeholder of template.placeholders) {
            switch (placeholder.key) {
                case 'LANGUAGES':
                    values[placeholder.key] = workspaceContext.projectInfo.languages;
                    break;
                case 'FRAMEWORKS':
                    values[placeholder.key] = workspaceContext.projectInfo.frameworks;
                    break;
                case 'PROJECT_NAME':
                    const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name || 'My Project';
                    values[placeholder.key] = workspaceName;
                    break;
                default:
                    values[placeholder.key] = placeholder.defaultValue || '';
            }
        }

        // Save the quick configuration
        const profile: UserSessionProfile = {
            placeholderValues: values,
            workspaceId: workspaceId,
            lastUpdated: new Date()
        };

        await this.sessionManager.saveUserProfile(profile);

        return this.sessionManager.generatePrompt(values);
    }

    async showManageTemplates(): Promise<void> {
        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        const actions = [
            { label: '🔧 Configure session primer', value: 'configure' },
            { label: '📝 Edit current configuration', value: 'edit', disabled: !existingProfile },
            { label: '👀 Preview current prompt', value: 'preview', disabled: !existingProfile },
            { label: '🗑️ Reset to simple prompt', value: 'reset', disabled: !existingProfile }
        ].filter(action => !action.disabled);

        const selected = await vscode.window.showQuickPick(actions, {
            title: 'Chat Catalyst - Manage Session Primers',
            placeHolder: 'Choose an action...'
        });

        switch (selected?.value) {
            case 'configure':
                await this.configureSessionPrimer();
                break;

            case 'edit':
                if (existingProfile) {
                    await this.configureSessionPrimer();
                }
                break;

            case 'preview':
                if (existingProfile) {
                    await this.previewSessionPrimer(existingProfile.placeholderValues);
                }
                break;

            case 'reset':
                const profiles = await this.sessionManager.getStoredProfiles();
                const filteredProfiles = profiles.filter(p => p.workspaceId !== workspaceId);
                await this.sessionManager.saveStoredProfiles(filteredProfiles);
                vscode.window.showInformationMessage('Session primer reset. Will use simple prompt until reconfigured.');
                break;
        }
    }
}
