import * as vscode from 'vscode';
import { SessionPrimerManager, SessionTemplate, TemplatePlaceholder, UserSessionProfile } from './sessionPrimers';

export class TemplateConfigurationUI {
    private sessionManager: SessionPrimerManager;

    constructor(sessionManager: SessionPrimerManager) {
        this.sessionManager = sessionManager;
    }

    async showTemplateSelector(): Promise<string | null> {
        const templates = this.sessionManager.getAllTemplates();
        const workspaceContext = await this.sessionManager.detectWorkspaceContext();

        const items = templates.map(template => ({
            label: template.name,
            description: template.description,
            detail: template.id === workspaceContext.suggestedTemplate ? '🎯 Suggested for this workspace' : '',
            templateId: template.id
        }));

        const selected = await vscode.window.showQuickPick(items, {
            title: 'Chat Catalyst - Select Session Primer Template',
            placeHolder: 'Choose a template that matches your role and project type...',
            matchOnDescription: true
        });

        return selected?.templateId || null;
    }

    async configureTemplate(templateId: string): Promise<{ [key: string]: string } | null> {
        const template = this.sessionManager.getTemplate(templateId);
        if (!template) {
            return null;
        }

        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        // If user already has a profile for this workspace and template, offer to use it
        if (existingProfile && existingProfile.templateId === templateId) {
            const useExisting = await vscode.window.showQuickPick([
                { label: '✅ Use existing configuration', value: 'existing' },
                { label: '🔧 Reconfigure template', value: 'reconfigure' },
                { label: '🎯 Switch to different template', value: 'switch' }
            ], {
                title: 'Existing Configuration Found',
                placeHolder: 'You already have a configuration for this workspace...'
            });

            if (useExisting?.value === 'existing') {
                return existingProfile.placeholderValues;
            } else if (useExisting?.value === 'switch') {
                return await this.showFullConfigurationWorkflow();
            }
            // Continue to reconfigure
        }

        return await this.collectPlaceholderValues(template, existingProfile?.placeholderValues);
    }

    private async collectPlaceholderValues(
        template: SessionTemplate,
        existingValues?: { [key: string]: string }
    ): Promise<{ [key: string]: string } | null> {
        const values: { [key: string]: string } = {};

        vscode.window.showInformationMessage(
            `Configuring ${template.name} template. Fill in your project details to create the perfect session primer.`,
            { modal: false }
        );

        for (const placeholder of template.placeholders) {
            const existingValue = existingValues?.[placeholder.key];
            const value = await this.collectSingleValue(placeholder, existingValue);

            if (value === null) {
                // User cancelled
                return null;
            }

            values[placeholder.key] = value;
        }

        // Show preview
        const previewPrompt = this.sessionManager.generatePrompt(template.id, values);
        const preview = await this.showPreview(previewPrompt);

        if (!preview) {
            return null;
        }

        // Save the configuration
        const profile: UserSessionProfile = {
            templateId: template.id,
            placeholderValues: values,
            workspaceId: this.sessionManager.getCurrentWorkspaceId(),
            lastUpdated: new Date()
        };

        await this.sessionManager.saveUserProfile(profile);

        vscode.window.showInformationMessage(
            `✅ Session primer configured! Press Ctrl+Shift+C to start chats with your personalized prompt.`,
            { modal: false }
        );

        return values;
    }

    private async collectSingleValue(placeholder: TemplatePlaceholder, existingValue?: string): Promise<string | null> {
        switch (placeholder.type) {
            case 'select':
                return await this.collectSelectValue(placeholder, existingValue);
            case 'multiline':
                return await this.collectMultilineValue(placeholder, existingValue);
            default:
                return await this.collectTextValue(placeholder, existingValue);
        }
    }

    private async collectTextValue(placeholder: TemplatePlaceholder, existingValue?: string): Promise<string | null> {
        return await vscode.window.showInputBox({
            title: `Configure: ${placeholder.label}`,
            prompt: placeholder.description,
            value: existingValue || placeholder.defaultValue || '',
            placeHolder: placeholder.defaultValue || `Enter ${placeholder.label.toLowerCase()}...`
        }) || null;
    }

    private async collectSelectValue(placeholder: TemplatePlaceholder, existingValue?: string): Promise<string | null> {
        if (!placeholder.options) {
            return await this.collectTextValue(placeholder, existingValue);
        }

        const items = placeholder.options.map(option => ({
            label: option,
            picked: option === (existingValue || placeholder.defaultValue)
        }));

        const selected = await vscode.window.showQuickPick(items, {
            title: `Configure: ${placeholder.label}`,
            placeHolder: placeholder.description
        });

        return selected?.label || null;
    }

    private async collectMultilineValue(placeholder: TemplatePlaceholder, existingValue?: string): Promise<string | null> {
        // For multiline input, we'll create a temporary document
        const initialContent = existingValue || placeholder.defaultValue || '';

        const doc = await vscode.workspace.openTextDocument({
            content: initialContent,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        const result = await vscode.window.showInformationMessage(
            `Edit ${placeholder.label} in the opened editor. Click 'Done' when finished.`,
            { modal: true },
            'Done',
            'Cancel'
        );

        const content = result === 'Done' ? editor.document.getText() : null;

        // Close the temporary document
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        return content;
    }

    private async showPreview(prompt: string): Promise<boolean> {
        const truncated = prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt;

        const result = await vscode.window.showInformationMessage(
            `Preview of your session primer:\n\n${truncated}\n\nDoes this look good?`,
            { modal: true },
            'Yes, save it',
            'No, edit again',
            'Cancel'
        );

        return result === 'Yes, save it';
    }

    async showFullConfigurationWorkflow(): Promise<{ [key: string]: string } | null> {
        // Step 1: Select template
        const templateId = await this.showTemplateSelector();
        if (!templateId) {
            return null;
        }

        // Step 2: Configure template
        return await this.configureTemplate(templateId);
    }

    async showQuickConfiguration(): Promise<string | null> {
        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        if (existingProfile) {
            // User has existing configuration, use it
            return this.sessionManager.generatePrompt(existingProfile.templateId, existingProfile.placeholderValues);
        }

        // Check if we can auto-detect and suggest a template
        const workspaceContext = await this.sessionManager.detectWorkspaceContext();

        if (workspaceContext.suggestedTemplate) {
            const useDetected = await vscode.window.showInformationMessage(
                `Chat Catalyst detected ${workspaceContext.detectedLanguages.join(', ')} in your workspace. Would you like to use the ${this.sessionManager.getTemplate(workspaceContext.suggestedTemplate)?.name} template?`,
                'Yes, configure it',
                'Choose different template',
                'Use simple prompt'
            );

            if (useDetected === 'Yes, configure it') {
                const values = await this.configureTemplate(workspaceContext.suggestedTemplate);
                return values ? this.sessionManager.generatePrompt(workspaceContext.suggestedTemplate, values) : null;
            } else if (useDetected === 'Choose different template') {
                const values = await this.showFullConfigurationWorkflow();
                return values ? this.sessionManager.generatePrompt(workspaceContext.suggestedTemplate, values) : null;
            }
        } else {
            // No detection, show template selector
            const configure = await vscode.window.showInformationMessage(
                'No session primer configured for this workspace. Would you like to set one up?',
                'Yes, configure now',
                'Use simple prompt'
            );

            if (configure === 'Yes, configure now') {
                const values = await this.showFullConfigurationWorkflow();
                if (values) {
                    const profile = await this.sessionManager.getUserProfile(workspaceId);
                    return profile ? this.sessionManager.generatePrompt(profile.templateId, values) : null;
                }
            }
        }

        return null; // Fall back to simple prompt
    }

    async showManageTemplates(): Promise<void> {
        const workspaceId = this.sessionManager.getCurrentWorkspaceId();
        const existingProfile = await this.sessionManager.getUserProfile(workspaceId);

        const actions = [
            { label: '🎯 Configure new session primer', value: 'configure' },
            { label: '📝 Edit current configuration', value: 'edit', disabled: !existingProfile },
            { label: '👀 Preview current prompt', value: 'preview', disabled: !existingProfile },
            { label: '🗑️ Reset to simple prompt', value: 'reset', disabled: !existingProfile }
        ].filter(action => !action.disabled);

        const selected = await vscode.window.showQuickPick(actions, {
            title: 'Chat Catalyst - Manage Session Primers',
            placeHolder: 'What would you like to do?'
        });

        switch (selected?.value) {
            case 'configure':
                await this.showFullConfigurationWorkflow();
                break;
            case 'edit':
                if (existingProfile) {
                    await this.configureTemplate(existingProfile.templateId);
                }
                break;
            case 'preview':
                if (existingProfile) {
                    const prompt = this.sessionManager.generatePrompt(existingProfile.templateId, existingProfile.placeholderValues);
                    const doc = await vscode.workspace.openTextDocument({
                        content: prompt,
                        language: 'plaintext'
                    });
                    await vscode.window.showTextDocument(doc);
                }
                break;
            case 'reset':
                const profiles = this.sessionManager.context.globalState.get<UserSessionProfile[]>('sessionProfiles', []);
                const filteredProfiles = profiles.filter(p => p.workspaceId !== workspaceId);
                await this.sessionManager.context.globalState.update('sessionProfiles', filteredProfiles);
                vscode.window.showInformationMessage('Session primer reset. Will use simple prompt until reconfigured.');
                break;
        }
    }
}
