import * as vscode from 'vscode';

export interface SessionTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    placeholders: TemplatePlaceholder[];
    category: 'admin' | 'developer' | 'architect' | 'analyst' | 'custom';
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
    templateId: string;
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
    }

    private getBuiltInTemplates(): SessionTemplate[] {
        return [
            {
                id: 'powershell-admin',
                name: 'PowerShell Administrator',
                description: 'For Windows system administrators working with PowerShell automation',
                category: 'admin',
                template: `Hi! I'm a Windows System Administrator working on PowerShell automation scripts using PowerShell {{PS_VERSION}} and {{AZURE_MODULES}}.

My current context:
- Project: {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}
- Primary languages: PowerShell, {{OTHER_LANGUAGES}}
- Key frameworks/tools: {{FRAMEWORKS}}
- Current focus: {{CURRENT_FOCUS}}

My preferences:
- Communication style: {{COMMUNICATION_STYLE}}
- Code style: {{CODE_STYLE}}
- Expertise level: {{EXPERTISE_LEVEL}} in PowerShell scripting, {{AZURE_EXPERTISE}} in Azure services

Session goals:
- {{SESSION_GOALS}}

Previous context to remember:
- {{PREVIOUS_CONTEXT}}

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: `,
                placeholders: [
                    { key: 'PS_VERSION', label: 'PowerShell Version', description: 'e.g., PowerShell 7.4', type: 'text', defaultValue: 'PowerShell 7.4' },
                    { key: 'AZURE_MODULES', label: 'Azure Modules', description: 'e.g., Azure modules, Microsoft Graph API', type: 'text', defaultValue: 'Azure modules' },
                    { key: 'PROJECT_NAME', label: 'Project Name', description: 'Current project name', type: 'text', defaultValue: 'Enterprise automation' },
                    { key: 'PROJECT_DESCRIPTION', label: 'Project Description', description: 'Brief project description', type: 'text', defaultValue: 'automating user provisioning and system management' },
                    { key: 'OTHER_LANGUAGES', label: 'Other Languages', description: 'Additional languages you use', type: 'text', defaultValue: 'some Python for data processing' },
                    { key: 'FRAMEWORKS', label: 'Key Frameworks/Tools', description: 'Main tools and frameworks', type: 'text', defaultValue: 'Azure PowerShell, Active Directory, Group Policy' },
                    { key: 'CURRENT_FOCUS', label: 'Current Focus', description: 'What you\'re working on now', type: 'text', defaultValue: 'Error handling and logging improvements' },
                    { key: 'COMMUNICATION_STYLE', label: 'Communication Style', description: 'How you prefer AI responses', type: 'select', options: ['Detailed explanations with examples', 'Concise with code examples', 'Educational step-by-step'], defaultValue: 'Detailed explanations with examples' },
                    { key: 'CODE_STYLE', label: 'Code Style Preferences', description: 'Your coding preferences', type: 'text', defaultValue: 'Explicit error handling, verbose parameter names, comment-heavy' },
                    { key: 'EXPERTISE_LEVEL', label: 'PowerShell Expertise', description: 'Your PowerShell skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Expert'], defaultValue: 'Expert' },
                    { key: 'AZURE_EXPERTISE', label: 'Azure Expertise', description: 'Your Azure skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Expert'], defaultValue: 'Intermediate' },
                    { key: 'SESSION_GOALS', label: 'Session Goals', description: 'What you want to accomplish today', type: 'multiline', defaultValue: 'Improve error handling patterns in automation scripts\nLearn best practices for resilient automation' },
                    { key: 'PREVIOUS_CONTEXT', label: 'Previous Context', description: 'Important context from previous sessions', type: 'multiline', defaultValue: 'Working on modular script design with proper logging\nEmphasis on enterprise-grade reliability' }
                ]
            },
            {
                id: 'python-developer',
                name: 'Python Developer',
                description: 'For backend developers working with Python applications',
                category: 'developer',
                template: `Hi! I'm a Backend Developer working on a Python {{APP_TYPE}} using {{FRAMEWORK}} and {{DATABASE}}.

My current context:
- Project: {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}
- Primary languages: Python {{PYTHON_VERSION}}, {{OTHER_LANGUAGES}}
- Key frameworks/tools: {{FRAMEWORKS}}
- Current focus: {{CURRENT_FOCUS}}

My preferences:
- Communication style: {{COMMUNICATION_STYLE}}
- Code style: {{CODE_STYLE}}
- Expertise level: {{PYTHON_EXPERTISE}} in Python, {{OTHER_EXPERTISE}}

Session goals:
- {{SESSION_GOALS}}

Previous context to remember:
- {{PREVIOUS_CONTEXT}}

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: `,
                placeholders: [
                    { key: 'APP_TYPE', label: 'Application Type', description: 'Type of application', type: 'select', options: ['web service', 'data processing service', 'API backend', 'microservice', 'desktop application'], defaultValue: 'web service' },
                    { key: 'FRAMEWORK', label: 'Primary Framework', description: 'Main Python framework', type: 'select', options: ['FastAPI', 'Django', 'Flask', 'Streamlit', 'Jupyter'], defaultValue: 'FastAPI' },
                    { key: 'DATABASE', label: 'Database', description: 'Database technology', type: 'select', options: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis'], defaultValue: 'PostgreSQL' },
                    { key: 'PROJECT_NAME', label: 'Project Name', description: 'Current project name', type: 'text', defaultValue: 'Customer analytics pipeline' },
                    { key: 'PROJECT_DESCRIPTION', label: 'Project Description', description: 'Brief project description', type: 'text', defaultValue: 'processing e-commerce transaction data' },
                    { key: 'PYTHON_VERSION', label: 'Python Version', description: 'Python version you\'re using', type: 'text', defaultValue: '3.11' },
                    { key: 'OTHER_LANGUAGES', label: 'Other Languages', description: 'Additional languages you use', type: 'text', defaultValue: 'SQL, some JavaScript for dashboards' },
                    { key: 'FRAMEWORKS', label: 'Key Frameworks/Tools', description: 'Main tools and frameworks', type: 'text', defaultValue: 'FastAPI, SQLAlchemy, Pandas, Docker, Redis' },
                    { key: 'CURRENT_FOCUS', label: 'Current Focus', description: 'What you\'re working on now', type: 'text', defaultValue: 'Performance optimization and database query efficiency' },
                    { key: 'COMMUNICATION_STYLE', label: 'Communication Style', description: 'How you prefer AI responses', type: 'select', options: ['Detailed explanations with examples', 'Concise with code examples', 'Educational step-by-step'], defaultValue: 'Concise with code examples' },
                    { key: 'CODE_STYLE', label: 'Code Style Preferences', description: 'Your coding preferences', type: 'text', defaultValue: 'Type hints, async/await patterns, clean architecture principles' },
                    { key: 'PYTHON_EXPERTISE', label: 'Python Expertise', description: 'Your Python skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Expert'], defaultValue: 'Expert' },
                    { key: 'OTHER_EXPERTISE', label: 'Other Expertise', description: 'Your skill level in other areas', type: 'text', defaultValue: 'intermediate in database optimization' },
                    { key: 'SESSION_GOALS', label: 'Session Goals', description: 'What you want to accomplish today', type: 'multiline', defaultValue: 'Optimize slow database queries in analytics pipeline\nImplement better caching strategies' },
                    { key: 'PREVIOUS_CONTEXT', label: 'Previous Context', description: 'Important context from previous sessions', type: 'multiline', defaultValue: 'Working with time-series data, heavy aggregations\nFocus on horizontal scaling and performance monitoring' }
                ]
            },
            {
                id: 'csharp-developer',
                name: 'C# Developer',
                description: 'For .NET developers working with C# applications',
                category: 'developer',
                template: `Hi! I'm a .NET Developer working on a C# {{APP_TYPE}} using {{FRAMEWORK}} and {{DATABASE}}.

My current context:
- Project: {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}
- Primary languages: C# {{DOTNET_VERSION}}, {{OTHER_LANGUAGES}}
- Key frameworks/tools: {{FRAMEWORKS}}
- Current focus: {{CURRENT_FOCUS}}

My preferences:
- Communication style: {{COMMUNICATION_STYLE}}
- Code style: {{CODE_STYLE}}
- Expertise level: {{CSHARP_EXPERTISE}} in C#/.NET, {{OTHER_EXPERTISE}}

Session goals:
- {{SESSION_GOALS}}

Previous context to remember:
- {{PREVIOUS_CONTEXT}}

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: `,
                placeholders: [
                    { key: 'APP_TYPE', label: 'Application Type', description: 'Type of application', type: 'select', options: ['web API', 'desktop application', 'web application', 'microservice', 'console application'], defaultValue: 'web API' },
                    { key: 'FRAMEWORK', label: 'Primary Framework', description: 'Main .NET framework', type: 'select', options: ['.NET 8', '.NET 6', '.NET Framework 4.8', 'ASP.NET Core', 'Blazor'], defaultValue: '.NET 8' },
                    { key: 'DATABASE', label: 'Database', description: 'Database technology', type: 'select', options: ['SQL Server', 'PostgreSQL', 'SQLite', 'Entity Framework', 'Dapper'], defaultValue: 'SQL Server' },
                    { key: 'PROJECT_NAME', label: 'Project Name', description: 'Current project name', type: 'text', defaultValue: 'Enterprise web API' },
                    { key: 'PROJECT_DESCRIPTION', label: 'Project Description', description: 'Brief project description', type: 'text', defaultValue: 'managing customer data and business logic' },
                    { key: 'DOTNET_VERSION', label: '.NET Version', description: '.NET version you\'re using', type: 'text', defaultValue: '.NET 8' },
                    { key: 'OTHER_LANGUAGES', label: 'Other Languages', description: 'Additional languages you use', type: 'text', defaultValue: 'SQL, some JavaScript for frontend' },
                    { key: 'FRAMEWORKS', label: 'Key Frameworks/Tools', description: 'Main tools and frameworks', type: 'text', defaultValue: 'ASP.NET Core, Entity Framework, AutoMapper, FluentValidation' },
                    { key: 'CURRENT_FOCUS', label: 'Current Focus', description: 'What you\'re working on now', type: 'text', defaultValue: 'Clean architecture implementation and unit testing' },
                    { key: 'COMMUNICATION_STYLE', label: 'Communication Style', description: 'How you prefer AI responses', type: 'select', options: ['Detailed explanations with examples', 'Concise with code examples', 'Educational step-by-step'], defaultValue: 'Detailed explanations with examples' },
                    { key: 'CODE_STYLE', label: 'Code Style Preferences', description: 'Your coding preferences', type: 'text', defaultValue: 'SOLID principles, dependency injection, comprehensive testing' },
                    { key: 'CSHARP_EXPERTISE', label: 'C# Expertise', description: 'Your C#/.NET skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Expert'], defaultValue: 'Expert' },
                    { key: 'OTHER_EXPERTISE', label: 'Other Expertise', description: 'Your skill level in other areas', type: 'text', defaultValue: 'expert in software architecture, intermediate in cloud deployment' },
                    { key: 'SESSION_GOALS', label: 'Session Goals', description: 'What you want to accomplish today', type: 'multiline', defaultValue: 'Implement clean architecture patterns\nImprove unit test coverage and quality' },
                    { key: 'PREVIOUS_CONTEXT', label: 'Previous Context', description: 'Important context from previous sessions', type: 'multiline', defaultValue: 'Working on domain-driven design implementation\nFocus on maintainable and testable code structure' }
                ]
            },
            {
                id: 'javascript-developer',
                name: 'JavaScript Developer',
                description: 'For frontend/fullstack developers working with JavaScript',
                category: 'developer',
                template: `Hi! I'm a {{ROLE_TYPE}} Developer working on a JavaScript {{APP_TYPE}} using {{FRAMEWORK}} and {{BACKEND}}.

My current context:
- Project: {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}
- Primary languages: JavaScript/TypeScript, {{OTHER_LANGUAGES}}
- Key frameworks/tools: {{FRAMEWORKS}}
- Current focus: {{CURRENT_FOCUS}}

My preferences:
- Communication style: {{COMMUNICATION_STYLE}}
- Code style: {{CODE_STYLE}}
- Expertise level: {{JS_EXPERTISE}} in JavaScript/TypeScript, {{OTHER_EXPERTISE}}

Session goals:
- {{SESSION_GOALS}}

Previous context to remember:
- {{PREVIOUS_CONTEXT}}

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: `,
                placeholders: [
                    { key: 'ROLE_TYPE', label: 'Developer Role', description: 'Your primary role', type: 'select', options: ['Frontend', 'Fullstack', 'Node.js Backend'], defaultValue: 'Frontend' },
                    { key: 'APP_TYPE', label: 'Application Type', description: 'Type of application', type: 'select', options: ['web application', 'single-page application', 'mobile app', 'API service', 'desktop app'], defaultValue: 'web application' },
                    { key: 'FRAMEWORK', label: 'Primary Framework', description: 'Main JavaScript framework', type: 'select', options: ['React', 'Vue.js', 'Angular', 'Node.js', 'Next.js', 'Svelte'], defaultValue: 'React' },
                    { key: 'BACKEND', label: 'Backend/Database', description: 'Backend technology', type: 'select', options: ['Node.js + Express', 'REST APIs', 'GraphQL', 'Firebase', 'Supabase'], defaultValue: 'REST APIs' },
                    { key: 'PROJECT_NAME', label: 'Project Name', description: 'Current project name', type: 'text', defaultValue: 'E-commerce dashboard' },
                    { key: 'PROJECT_DESCRIPTION', label: 'Project Description', description: 'Brief project description', type: 'text', defaultValue: 'customer management and analytics interface' },
                    { key: 'OTHER_LANGUAGES', label: 'Other Languages', description: 'Additional languages you use', type: 'text', defaultValue: 'HTML, CSS, some Python for automation' },
                    { key: 'FRAMEWORKS', label: 'Key Frameworks/Tools', description: 'Main tools and frameworks', type: 'text', defaultValue: 'React, TypeScript, Tailwind CSS, React Query, Webpack' },
                    { key: 'CURRENT_FOCUS', label: 'Current Focus', description: 'What you\'re working on now', type: 'text', defaultValue: 'Component architecture and state management optimization' },
                    { key: 'COMMUNICATION_STYLE', label: 'Communication Style', description: 'How you prefer AI responses', type: 'select', options: ['Detailed explanations with examples', 'Concise with code examples', 'Educational step-by-step'], defaultValue: 'Concise with code examples' },
                    { key: 'CODE_STYLE', label: 'Code Style Preferences', description: 'Your coding preferences', type: 'text', defaultValue: 'Functional components, TypeScript, modular architecture, comprehensive testing' },
                    { key: 'JS_EXPERTISE', label: 'JavaScript Expertise', description: 'Your JavaScript/TypeScript skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Expert'], defaultValue: 'Expert' },
                    { key: 'OTHER_EXPERTISE', label: 'Other Expertise', description: 'Your skill level in other areas', type: 'text', defaultValue: 'expert in React ecosystem, intermediate in backend development' },
                    { key: 'SESSION_GOALS', label: 'Session Goals', description: 'What you want to accomplish today', type: 'multiline', defaultValue: 'Optimize component rendering performance\nImplement better error handling patterns' },
                    { key: 'PREVIOUS_CONTEXT', label: 'Previous Context', description: 'Important context from previous sessions', type: 'multiline', defaultValue: 'Working on scalable component architecture\nFocus on user experience and performance optimization' }
                ]
            },
            {
                id: 'custom-template',
                name: 'Custom Template',
                description: 'Create your own personalized session primer',
                category: 'custom',
                template: `{{CUSTOM_PROMPT}}`,
                placeholders: [
                    { key: 'CUSTOM_PROMPT', label: 'Custom Session Primer', description: 'Your personalized session primer template', type: 'multiline', defaultValue: `Hi! I'm a [YOUR_ROLE] working on [PROJECT_TYPE] using [TECH_STACK].

My current context:
- Project: [PROJECT_NAME] - [DESCRIPTION]
- Primary languages: [LANGUAGES]
- Key frameworks/tools: [FRAMEWORKS]
- Current focus: [CURRENT_FOCUS]

My preferences:
- Communication style: [STYLE]
- Code style: [PREFERENCES]
- Expertise level: [LEVEL]

Session goals:
- [GOALS]

Previous context to remember:
- [CONTEXT]

Please help me with questions about this project, keeping my preferences and context in mind.

Today's specific question: ` }
                ]
            }
        ];
    }

    async getUserProfile(workspaceId: string): Promise<UserSessionProfile | null> {
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

    getTemplate(templateId: string): SessionTemplate | null {
        return this.templates.find(t => t.id === templateId) || null;
    }

    getAllTemplates(): SessionTemplate[] {
        return this.templates;
    }

    generatePrompt(templateId: string, placeholderValues: { [key: string]: string }): string {
        const template = this.getTemplate(templateId);
        if (!template) {
            return '';
        }

        let prompt = template.template;

        // Replace placeholders with values
        for (const placeholder of template.placeholders) {
            const value = placeholderValues[placeholder.key] || placeholder.defaultValue || `[${placeholder.label}]`;
            const regex = new RegExp(`{{${placeholder.key}}}`, 'g');
            prompt = prompt.replace(regex, value);
        }

        return prompt;
    }

    async detectWorkspaceContext(): Promise<{ suggestedTemplate: string | null; detectedLanguages: string[] }> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { suggestedTemplate: null, detectedLanguages: [] };
        }

        const detectedLanguages: string[] = [];
        let suggestedTemplate: string | null = null;

        // Simple file-based detection
        try {
            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 50);

            for (const file of files) {
                const fileName = file.path.toLowerCase();

                if (fileName.endsWith('.ps1') || fileName.endsWith('.psm1')) {
                    detectedLanguages.push('PowerShell');
                    if (!suggestedTemplate) suggestedTemplate = 'powershell-admin';
                }

                if (fileName.endsWith('.py')) {
                    detectedLanguages.push('Python');
                    if (!suggestedTemplate) suggestedTemplate = 'python-developer';
                }

                if (fileName.endsWith('.cs') || fileName.endsWith('.csproj')) {
                    detectedLanguages.push('C#');
                    if (!suggestedTemplate) suggestedTemplate = 'csharp-developer';
                }

                if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
                    detectedLanguages.push('JavaScript/TypeScript');
                    if (!suggestedTemplate) suggestedTemplate = 'javascript-developer';
                }
            }
        } catch (error) {
            console.log('Could not detect workspace context:', error);
        }

        return {
            suggestedTemplate,
            detectedLanguages: Array.from(new Set(detectedLanguages))
        };
    }

    getCurrentWorkspaceId(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return 'default';
        }
        return workspaceFolders[0].uri.fsPath;
    }
}
