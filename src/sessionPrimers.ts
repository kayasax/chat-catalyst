import * as vscode from 'vscode';

export interface SessionTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    placeholders: TemplatePlaceholder[];
}

export interface TemplatePlaceholder {
    key: string;
    label: string;
    description: string;
    type: 'text' | 'multiline' | 'select';
    options?: string[];
    defaultValue?: string;
}

export interface UserSessionProfile {
    placeholderValues: { [key: string]: string };
    workspaceId: string;
    lastUpdated: Date;
}

export class SessionPrimerManager {
    private context: vscode.ExtensionContext;
    private templates: SessionTemplate[];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.templates = this.getBuiltInTemplates();
    }    private getBuiltInTemplates(): SessionTemplate[] {
        return [
            {
                id: 'universal-primer',
                name: 'Universal Session Primer',
                description: 'Perfect session primer that works for all developers and projects',
                template: `Hi! I'm a developer working on {{PROJECT_NAME}} using {{TECH_STACK}}.

My current context:
- Project: {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}
- Primary languages: {{LANGUAGES}}
- Key frameworks/tools: {{FRAMEWORKS}}
- Current focus: {{CURRENT_FOCUS}}

My preferences:
- Communication style: {{COMMUNICATION_STYLE}}
- Code style: {{CODE_STYLE}}
- Expertise level: {{EXPERTISE_LEVEL}}

Session goals:
- {{SESSION_GOALS}}

Previous context to remember:
- {{PREVIOUS_CONTEXT}}

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: `,
                placeholders: [
                    { key: 'PROJECT_NAME', label: 'Project Name', description: 'Name of your current project', type: 'text', defaultValue: 'My Project' },
                    { key: 'PROJECT_DESCRIPTION', label: 'Project Description', description: 'Brief description of what your project does', type: 'text', defaultValue: 'software development project' },
                    { key: 'TECH_STACK', label: 'Technology Stack', description: 'Main technologies, frameworks, or languages you use', type: 'text', defaultValue: 'modern development tools' },
                    { key: 'LANGUAGES', label: 'Programming Languages', description: 'Primary programming languages you work with', type: 'text', defaultValue: 'TypeScript, JavaScript' },
                    { key: 'FRAMEWORKS', label: 'Frameworks & Tools', description: 'Key frameworks, libraries, and tools in your workflow', type: 'text', defaultValue: 'VS Code, Git, Node.js' },
                    { key: 'CURRENT_FOCUS', label: 'Current Focus', description: 'What you\'re primarily working on right now', type: 'text', defaultValue: 'feature development and bug fixes' },
                    { key: 'COMMUNICATION_STYLE', label: 'Communication Style', description: 'How you prefer AI responses', type: 'select', options: ['Detailed explanations with examples', 'Concise with code examples', 'Educational step-by-step', 'Quick and direct'], defaultValue: 'Detailed explanations with examples' },
                    { key: 'CODE_STYLE', label: 'Code Style Preferences', description: 'Your coding style and best practices preferences', type: 'text', defaultValue: 'Clean, readable code with good documentation' },
                    { key: 'EXPERTISE_LEVEL', label: 'Experience Level', description: 'Your overall development experience level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], defaultValue: 'Intermediate' },
                    { key: 'SESSION_GOALS', label: 'Session Goals', description: 'What you want to accomplish in this session', type: 'multiline', defaultValue: 'Get help with current development challenges\nLearn best practices and improve code quality' },
                    { key: 'PREVIOUS_CONTEXT', label: 'Previous Context', description: 'Important context from recent work or previous sessions', type: 'multiline', defaultValue: 'Working on improving code architecture\nFocus on maintainable and scalable solutions' }
                ]
            }
        ];
    }    async getUserProfile(workspaceId: string): Promise<UserSessionProfile | null> {
        const profiles = this.context.globalState.get<UserSessionProfile[]>('sessionProfiles', []);
        return profiles.find(p => p.workspaceId === workspaceId) || null;
    }

    async saveUserProfile(profile: UserSessionProfile): Promise<void> {
        const profiles = this.context.globalState.get<UserSessionProfile[]>('sessionProfiles', []);
        const existingIndex = profiles.findIndex(p => p.workspaceId === profile.workspaceId);

        if (existingIndex >= 0) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push(profile);
        }

        await this.context.globalState.update('sessionProfiles', profiles);
    }

    getUniversalTemplate(): SessionTemplate {
        return this.templates[0]; // Universal template is the first and only template
    }

    getAllTemplates(): SessionTemplate[] {
        return this.templates;
    }

    generatePrompt(placeholderValues: { [key: string]: string }): string {
        const template = this.getUniversalTemplate();
        let prompt = template.template;

        // Replace placeholders with values
        for (const placeholder of template.placeholders) {
            const value = placeholderValues[placeholder.key] || placeholder.defaultValue || `[${placeholder.label}]`;
            const regex = new RegExp(`{{${placeholder.key}}}`, 'g');
            prompt = prompt.replace(regex, value);
        }

        return prompt;
    }    async detectWorkspaceContext(): Promise<{ detectedLanguages: string[]; projectInfo: { languages: string; frameworks: string } }> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return {
                detectedLanguages: [],
                projectInfo: {
                    languages: 'Various languages',
                    frameworks: 'Standard development tools'
                }
            };
        }

        const detectedLanguages: string[] = [];
        const detectedFrameworks: string[] = [];

        // Simple file-based detection
        try {
            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 50);

            for (const file of files) {
                const fileName = file.path.toLowerCase();

                if (fileName.endsWith('.ps1') || fileName.endsWith('.psm1')) {
                    detectedLanguages.push('PowerShell');
                    detectedFrameworks.push('PowerShell modules');
                }

                if (fileName.endsWith('.py')) {
                    detectedLanguages.push('Python');
                }

                if (fileName.endsWith('.cs') || fileName.endsWith('.csproj')) {
                    detectedLanguages.push('C#');
                    detectedFrameworks.push('.NET');
                }

                if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
                    detectedLanguages.push('JavaScript/TypeScript');
                }

                if (fileName.includes('package.json')) {
                    detectedFrameworks.push('Node.js');
                }

                if (fileName.includes('requirements.txt') || fileName.includes('pyproject.toml')) {
                    detectedFrameworks.push('Python packages');
                }

                if (fileName.includes('.sln') || fileName.includes('.csproj')) {
                    detectedFrameworks.push('.NET/Visual Studio');
                }
            }
        } catch (error) {
            console.log('Could not detect workspace context:', error);
        }

        const uniqueLanguages = Array.from(new Set(detectedLanguages));
        const uniqueFrameworks = Array.from(new Set(detectedFrameworks));

        return {
            detectedLanguages: uniqueLanguages,
            projectInfo: {
                languages: uniqueLanguages.length > 0 ? uniqueLanguages.join(', ') : 'Various languages',
                frameworks: uniqueFrameworks.length > 0 ? uniqueFrameworks.join(', ') : 'Standard development tools'
            }
        };
    }

    getCurrentWorkspaceId(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return 'default';
        }
        return workspaceFolders[0].uri.fsPath;
    }

    async getStoredProfiles(): Promise<UserSessionProfile[]> {
        return this.context.globalState.get<UserSessionProfile[]>('sessionProfiles', []);
    }

    async saveStoredProfiles(profiles: UserSessionProfile[]): Promise<void> {
        await this.context.globalState.update('sessionProfiles', profiles);
    }
}
