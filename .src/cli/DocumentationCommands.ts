/**
 * Documentation Commands for Dual Claude System
 * Manages Claude documentation with CLI commands for show, regenerate, validate, edit, and debug
 */

import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
// import { claudeDocManager } from '../utils/ClaudeDocManager.js'; // TODO: Use in future for advanced operations
// import { logger } from '../utils/Logger.js';

interface DocumentationValidation {
    isValid: boolean;
    globalPath?: string;
    globalExists: boolean;
    globalSize?: number;
    projectPath?: string;
    projectExists: boolean;
    projectSize?: number;
    masterExists: boolean;
    masterSize?: number;
    lastRegenerated?: string;
    issues: string[];
    warnings: string[];
}

interface DocumentationDebugInfo {
    workingDirectory: string;
    globalClaudePath: string;
    projectClaudePath: string;
    masterClaudePath: string;
    globalExists: boolean;
    globalSize?: number;
    globalModified?: string;
    projectExists: boolean;
    projectSize?: number;
    projectModified?: string;
    masterExists: boolean;
    masterSize?: number;
    masterGenerated?: string;
    managerInitialized: boolean;
    cacheStatus?: string;
    lastOperation?: string;
    performanceMetrics?: Record<string, any>;
}

export class DocumentationCommands {
    constructor() {
        // Simplified implementation for initial release
    }

    private log(message: string) {
        // Simple console logging for now
        console.log(`[DocumentationCommands] ${message}`);
    }

    /**
     * Handle documentation commands
     */
    async handleDocsCommand(args: string[]): Promise<number> {
        if (args.length === 0) {
            this.showUsage();
            return 1;
        }

        const command = args[0];
        const subArgs = args.slice(1);

        try {
            switch (command) {
                case 'show':
                    return await this.showDocs(subArgs);
                case 'regenerate':
                case 'regen':
                    return await this.regenerateDocs(subArgs);
                case 'validate':
                    return await this.validateDocs(subArgs);
                case 'edit':
                    return await this.editDocs(subArgs);
                case 'debug':
                    return await this.debugDocs(subArgs);
                default:
                    this.log(`Unknown docs command: ${command}`);
                    this.showUsage();
                    return 1;
            }
        } catch (error) {
            this.log(`Documentation command failed: ${error instanceof Error ? error.message : String(error)}`);
            return 1;
        }
    }

    /**
     * Display merged CLAUDE-MASTER.md documentation
     */
    private async showDocs(_args: string[]): Promise<number> {
        try {
            console.log(chalk.cyan('\n🔍 Displaying merged CLAUDE-MASTER.md documentation...\n'));
            
            const masterPath = path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md');
            
            if (!fsSync.existsSync(masterPath)) {
                console.log(chalk.red('❌ CLAUDE-MASTER.md not found. Run "docs regenerate" first.'));
                this.log('CLAUDE-MASTER.md not found');
                return 1;
            }

            const content = await fs.readFile(masterPath, 'utf-8');
            
            if (!content || content.trim().length === 0) {
                console.log(chalk.yellow('⚠️  CLAUDE-MASTER.md is empty. Run "docs regenerate" to generate content.'));
                return 1;
            }

            // Display the documentation with proper formatting
            console.log(chalk.cyan('═'.repeat(80)));
            console.log(chalk.cyan('CLAUDE-MASTER.MD - MERGED DOCUMENTATION'));
            console.log(chalk.cyan('═'.repeat(80)));
            console.log(content);
            console.log(chalk.cyan('═'.repeat(80)));

            this.log('Documentation displayed successfully');
            
            return 0;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`❌ Failed to show documentation: ${errorMessage}`));
            this.log('Failed to show documentation: ' + errorMessage);
            return 1;
        }
    }

    /**
     * Regenerate CLAUDE-MASTER.md from source files
     */
    private async regenerateDocs(_args: string[]): Promise<number> {
        try {
            console.log(chalk.cyan('\n🔄 Regenerating CLAUDE-MASTER.md from source files...\n'));
            
            // Use the merge script if available
            const mergeScriptPath = path.join(process.cwd(), 'scripts', 'merge-claude-docs.sh');
            
            if (fsSync.existsSync(mergeScriptPath)) {
                // Execute the merge script
                const result = await this.executeScript(mergeScriptPath, ['--merge']);
                
                if (result.exitCode === 0) {
                    console.log(chalk.green('✅ Documentation regenerated successfully using merge script'));
                    
                    // Display statistics
                    await this.displayRegenerationStats();
                    
                    this.log('Documentation regenerated successfully via merge script');
                    return 0;
                } else {
                    console.log(chalk.red('❌ Merge script failed'));
                    this.log('Merge script execution failed');
                }
            }
            
            // Fallback to manual generation
            console.log(chalk.yellow('🔄 Fallback to manual generation...'));
            const success = await this.manualRegeneration();
            
            if (success) {
                console.log(chalk.green('✅ Documentation regenerated successfully'));
                await this.displayRegenerationStats();
                this.log('Documentation regenerated successfully via manual method');
                return 0;
            } else {
                console.log(chalk.red('❌ Documentation regeneration failed'));
                return 1;
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`❌ Failed to regenerate documentation: ${errorMessage}`));
            this.log('Failed to regenerate documentation');
            return 1;
        }
    }

    /**
     * Validate documentation compatibility and status
     */
    private async validateDocs(_args: string[]): Promise<number> {
        try {
            console.log(chalk.cyan('\n🔍 Validating documentation compatibility...\n'));
            
            const validation = await this.performValidation();
            
            // Display validation results
            console.log(chalk.cyan('═'.repeat(70)));
            console.log(chalk.cyan('DOCUMENTATION VALIDATION REPORT'));
            console.log(chalk.cyan('═'.repeat(70)));
            
            console.log(`\n📋 Overall Status: ${validation.isValid ? chalk.green('✅ VALID') : chalk.red('❌ INVALID')}`);
            
            // Global documentation status
            console.log(`\n🌍 Global Documentation:`);
            console.log(`   Path: ${validation.globalPath || 'Not specified'}`);
            console.log(`   Exists: ${validation.globalExists ? chalk.green('✅') : chalk.red('❌')}`);
            if (validation.globalSize !== undefined) {
                console.log(`   Size: ${validation.globalSize} bytes`);
            }
            
            // Project documentation status
            console.log(`\n📁 Project Documentation:`);
            console.log(`   Path: ${validation.projectPath || process.cwd() + '/CLAUDE.md'}`);
            console.log(`   Exists: ${validation.projectExists ? chalk.green('✅') : chalk.red('❌')}`);
            if (validation.projectSize !== undefined) {
                console.log(`   Size: ${validation.projectSize} bytes`);
            }
            
            // Master documentation status
            console.log(`\n🔄 Master Documentation:`);
            console.log(`   Exists: ${validation.masterExists ? chalk.green('✅') : chalk.red('❌')}`);
            if (validation.masterSize !== undefined) {
                console.log(`   Size: ${validation.masterSize} bytes`);
            }
            if (validation.lastRegenerated) {
                console.log(`   Last Regenerated: ${validation.lastRegenerated}`);
            }
            
            // Issues and warnings
            if (validation.issues.length > 0) {
                console.log(`\n⚠️  Issues Found:`);
                validation.issues.forEach((issue, index) => {
                    console.log(chalk.yellow(`   ${index + 1}. ${issue}`));
                });
            }
            
            if (validation.warnings.length > 0) {
                console.log(`\n🔶 Warnings:`);
                validation.warnings.forEach((warning, index) => {
                    console.log(chalk.yellow(`   ${index + 1}. ${warning}`));
                });
            }
            
            // Recommendations
            if (!validation.isValid) {
                console.log(`\n💡 Recommendations:`);
                if (!validation.globalExists) {
                    console.log(`   - Create global CLAUDE.md in your Claude configuration directory`);
                }
                if (!validation.projectExists) {
                    console.log(`   - Create project CLAUDE.md with project-specific instructions`);
                }
                if (!validation.masterExists) {
                    console.log(`   - Run "docs regenerate" to create merged documentation`);
                }
            }
            
            console.log(chalk.cyan('═'.repeat(70)));
            
            this.log('Validation completed');
            
            return validation.isValid ? 0 : 1;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`❌ Failed to validate documentation: ${errorMessage}`));
            this.log('Failed to validate documentation');
            return 1;
        }
    }

    /**
     * Edit project CLAUDE.md with auto-regeneration
     */
    private async editDocs(_args: string[]): Promise<number> {
        try {
            const projectClaudePath = path.join(process.cwd(), 'CLAUDE.md');
            
            console.log(chalk.cyan(`\n✏️  Opening project CLAUDE.md for editing: ${projectClaudePath}\n`));
            
            // Ensure the file exists
            if (!fsSync.existsSync(projectClaudePath)) {
                console.log(chalk.yellow('📄 Project CLAUDE.md not found, creating template...'));
                await this.createProjectTemplate(projectClaudePath);
                console.log(chalk.green('✅ Created project CLAUDE.md template'));
            }
            
            // Determine editor to use
            const editor = process.env.CES_EDITOR || 
                          process.env.EDITOR || 
                          process.env.VISUAL || 
                          'nano';
            
            console.log(chalk.blue(`🖋️  Using editor: ${editor}`));
            
            // Launch editor
            const editorProcess = spawn(editor, [projectClaudePath], {
                stdio: 'inherit',
                shell: true
            });
            
            return new Promise<number>((resolve) => {
                editorProcess.on('close', async (code) => {
                    if (code === 0) {
                        console.log(chalk.green('\n✅ Editor closed successfully'));
                        
                        // Auto-regenerate documentation after editing
                        console.log(chalk.cyan('🔄 Auto-regenerating documentation...'));
                        try {
                            const regenResult = await this.regenerateDocs([]);
                            if (regenResult === 0) {
                                console.log(chalk.green('✅ Documentation auto-regenerated successfully'));
                            } else {
                                console.log(chalk.yellow('⚠️  Auto-regeneration had issues, check output above'));
                            }
                        } catch (error) {
                            console.log(chalk.yellow('⚠️  Auto-regeneration failed, run "docs regenerate" manually'));
                            this.log('Auto-regeneration failed after edit');
                        }
                        
                        resolve(0);
                    } else {
                        console.log(chalk.red(`❌ Editor exited with code: ${code}`));
                        this.log('Editor exited with error code');
                        resolve(code || 1);
                    }
                });
                
                editorProcess.on('error', (error) => {
                    console.log(chalk.red(`❌ Failed to launch editor: ${error.message}`));
                    console.log(chalk.blue('💡 Tip: Set CES_EDITOR environment variable to specify your preferred editor'));
                    this.log('Failed to launch editor');
                    resolve(1);
                });
            });
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`❌ Failed to edit documentation: ${errorMessage}`));
            this.log('Failed to edit documentation');
            return 1;
        }
    }

    /**
     * Display debug information about documentation system
     */
    private async debugDocs(_args: string[]): Promise<number> {
        try {
            console.log(chalk.cyan('\n🔧 Gathering documentation debug information...\n'));
            
            const debugInfo = await this.gatherDebugInfo();
            
            console.log(chalk.cyan('═'.repeat(80)));
            console.log(chalk.cyan('CLAUDE DOCUMENTATION SYSTEM - DEBUG INFO'));
            console.log(chalk.cyan('═'.repeat(80)));
            
            // System Information
            console.log('\n🔧 System Information:');
            console.log(`   Working Directory: ${debugInfo.workingDirectory}`);
            console.log(`   Global Claude Path: ${debugInfo.globalClaudePath}`);
            console.log(`   Project Claude Path: ${debugInfo.projectClaudePath}`);
            console.log(`   Master Claude Path: ${debugInfo.masterClaudePath}`);
            
            // File Status
            console.log('\n📁 File Status:');
            console.log(`   Global CLAUDE.md: ${debugInfo.globalExists ? chalk.green('✅ EXISTS') : chalk.red('❌ MISSING')}`);
            if (debugInfo.globalExists && debugInfo.globalSize !== undefined) {
                console.log(`     Size: ${debugInfo.globalSize} bytes`);
                console.log(`     Modified: ${debugInfo.globalModified || 'Unknown'}`);
            }
            
            console.log(`   Project CLAUDE.md: ${debugInfo.projectExists ? chalk.green('✅ EXISTS') : chalk.red('❌ MISSING')}`);
            if (debugInfo.projectExists && debugInfo.projectSize !== undefined) {
                console.log(`     Size: ${debugInfo.projectSize} bytes`);
                console.log(`     Modified: ${debugInfo.projectModified || 'Unknown'}`);
            }
            
            console.log(`   Master CLAUDE.md: ${debugInfo.masterExists ? chalk.green('✅ EXISTS') : chalk.red('❌ MISSING')}`);
            if (debugInfo.masterExists && debugInfo.masterSize !== undefined) {
                console.log(`     Size: ${debugInfo.masterSize} bytes`);
                console.log(`     Generated: ${debugInfo.masterGenerated || 'Unknown'}`);
            }
            
            // Environment Variables
            console.log('\n🌍 Environment Variables:');
            console.log(`   CES_EDITOR: ${process.env.CES_EDITOR || 'Not set'}`);
            console.log(`   EDITOR: ${process.env.EDITOR || 'Not set'}`);
            console.log(`   VISUAL: ${process.env.VISUAL || 'Not set'}`);
            console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
            
            // Manager State
            console.log('\n🔄 Manager State:');
            console.log(`   Initialized: ${debugInfo.managerInitialized ? chalk.green('✅') : chalk.red('❌')}`);
            console.log(`   Cache Status: ${debugInfo.cacheStatus || 'Unknown'}`);
            if (debugInfo.lastOperation) {
                console.log(`   Last Operation: ${debugInfo.lastOperation}`);
            }
            
            // Validation Summary
            const validation = await this.performValidation();
            console.log('\n✅ Validation Summary:');
            console.log(`   Overall Valid: ${validation.isValid ? chalk.green('✅') : chalk.red('❌')}`);
            console.log(`   Issues Count: ${validation.issues.length}`);
            console.log(`   Warnings Count: ${validation.warnings.length}`);
            
            // Performance Metrics
            if (debugInfo.performanceMetrics) {
                console.log('\n⚡ Performance Metrics:');
                Object.entries(debugInfo.performanceMetrics).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            }
            
            console.log(chalk.cyan('═'.repeat(80)));
            
            this.log('Debug information gathered successfully');
            return 0;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`❌ Failed to gather debug information: ${errorMessage}`));
            this.log('Failed to gather debug information');
            return 1;
        }
    }

    /**
     * Show command usage information
     */
    private showUsage(): void {
        console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║            CLAUDE DOCUMENTATION COMMANDS                 ║
╚══════════════════════════════════════════════════════════╝

${chalk.yellow('Available Commands:')}

  ${chalk.green('docs show')}                    Display the merged CLAUDE-MASTER.md
  ${chalk.green('docs regenerate | regen')}      Regenerate CLAUDE-MASTER.md from source files
  ${chalk.green('docs validate')}               Validate documentation compatibility
  ${chalk.green('docs edit')}                   Edit project CLAUDE.md with auto-regeneration
  ${chalk.green('docs debug')}                  Show debug information about documentation system

${chalk.yellow('Examples:')}
  npm run dev -- docs show
  npm run dev -- docs regen
  npm run dev -- docs validate
  npm run dev -- docs edit
  npm run dev -- docs debug

${chalk.yellow('Environment Variables:')}
  ${chalk.blue('CES_EDITOR')}                  Preferred editor for editing CLAUDE.md
  ${chalk.blue('EDITOR')}                      System default editor
  ${chalk.blue('VISUAL')}                      Visual editor preference

${chalk.yellow('Documentation Flow:')}
  1. Create/edit project CLAUDE.md (docs edit)
  2. Regenerate master document (docs regen)
  3. Validate setup (docs validate)
  4. View merged result (docs show)
`));
    }

    // Helper methods

    private async executeScript(scriptPath: string, args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
        return new Promise((resolve) => {
            const process = spawn('bash', [scriptPath, ...args], {
                cwd: path.dirname(scriptPath),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                resolve({
                    exitCode: code || 0,
                    stdout,
                    stderr
                });
            });
        });
    }

    private async manualRegeneration(): Promise<boolean> {
        try {
            const masterPath = path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md');
            const globalPath = path.join(process.env.HOME || '', '.claude', 'CLAUDE.md');
            const projectPath = path.join(process.cwd(), 'CLAUDE.md');

            // Ensure .claude directory exists
            await fs.mkdir(path.dirname(masterPath), { recursive: true });

            let content = `# CLAUDE-MASTER.md
# Auto-generated unified Claude configuration
# Generated: ${new Date().toISOString()}
# Source: Dual Claude Implementation

`;

            // Add global CLAUDE.md if exists
            if (fsSync.existsSync(globalPath)) {
                const globalContent = await fs.readFile(globalPath, 'utf-8');
                content += `\n## Global Configuration (from ~/.claude/CLAUDE.md)\n\n${globalContent}\n`;
            }

            // Add project CLAUDE.md if exists
            if (fsSync.existsSync(projectPath)) {
                const projectContent = await fs.readFile(projectPath, 'utf-8');
                content += `\n## Project Configuration (from CLAUDE.md)\n\n${projectContent}\n`;
            }

            // Add CES-specific configuration
            content += `\n## CES Configuration\n\nCES Version: 2.7.0\nDual Claude Implementation: Active\nMaster Document Path: ${masterPath}\n`;

            await fs.writeFile(masterPath, content, 'utf-8');
            return true;

        } catch (error) {
            this.log('Manual regeneration failed');
            return false;
        }
    }

    private async displayRegenerationStats(): Promise<void> {
        try {
            const masterPath = path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md');
            const globalPath = path.join(process.env.HOME || '', '.claude', 'CLAUDE.md');
            const projectPath = path.join(process.cwd(), 'CLAUDE.md');

            console.log(chalk.blue('\n📊 Regeneration Statistics:'));

            if (fsSync.existsSync(globalPath)) {
                const stats = await fs.stat(globalPath);
                console.log(`   Global CLAUDE.md: ${stats.size} bytes`);
            } else {
                console.log('   Global CLAUDE.md: Not found');
            }

            if (fsSync.existsSync(projectPath)) {
                const stats = await fs.stat(projectPath);
                console.log(`   Project CLAUDE.md: ${stats.size} bytes`);
            } else {
                console.log('   Project CLAUDE.md: Not found');
            }

            if (fsSync.existsSync(masterPath)) {
                const stats = await fs.stat(masterPath);
                console.log(`   Merged size: ${stats.size} bytes`);
                console.log(`   Last updated: ${stats.mtime.toLocaleString()}`);
            }

        } catch (error) {
            this.log('Failed to display regeneration stats');
        }
    }

    private async performValidation(): Promise<DocumentationValidation> {
        const validation: DocumentationValidation = {
            isValid: true,
            globalExists: false,
            projectExists: false,
            masterExists: false,
            issues: [],
            warnings: []
        };

        try {
            const globalPath = path.join(process.env.HOME || '', '.claude', 'CLAUDE.md');
            const projectPath = path.join(process.cwd(), 'CLAUDE.md');
            const masterPath = path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md');

            validation.globalPath = globalPath;
            validation.projectPath = projectPath;

            // Check global CLAUDE.md
            if (fsSync.existsSync(globalPath)) {
                validation.globalExists = true;
                const stats = await fs.stat(globalPath);
                validation.globalSize = stats.size;
            } else {
                validation.warnings.push('Global CLAUDE.md not found (optional)');
            }

            // Check project CLAUDE.md
            if (fsSync.existsSync(projectPath)) {
                validation.projectExists = true;
                const stats = await fs.stat(projectPath);
                validation.projectSize = stats.size;
            } else {
                validation.issues.push('Project CLAUDE.md not found');
                validation.isValid = false;
            }

            // Check master CLAUDE.md
            if (fsSync.existsSync(masterPath)) {
                validation.masterExists = true;
                const stats = await fs.stat(masterPath);
                validation.masterSize = stats.size;
                validation.lastRegenerated = stats.mtime.toLocaleString();
            } else {
                validation.issues.push('CLAUDE-MASTER.md not found - run "docs regenerate"');
                validation.isValid = false;
            }

            // Additional validations
            if (validation.masterExists && validation.masterSize === 0) {
                validation.issues.push('CLAUDE-MASTER.md is empty');
                validation.isValid = false;
            }

        } catch (error) {
            validation.issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
            validation.isValid = false;
        }

        return validation;
    }

    private async gatherDebugInfo(): Promise<DocumentationDebugInfo> {
        const debugInfo: DocumentationDebugInfo = {
            workingDirectory: process.cwd(),
            globalClaudePath: path.join(process.env.HOME || '', '.claude', 'CLAUDE.md'),
            projectClaudePath: path.join(process.cwd(), 'CLAUDE.md'),
            masterClaudePath: path.join(process.cwd(), '.claude', 'CLAUDE-MASTER.md'),
            globalExists: false,
            projectExists: false,
            masterExists: false,
            managerInitialized: true, // Assume initialized if we can run this
            cacheStatus: 'Active'
        };

        try {
            // Check global file
            if (fsSync.existsSync(debugInfo.globalClaudePath)) {
                debugInfo.globalExists = true;
                const stats = await fs.stat(debugInfo.globalClaudePath);
                debugInfo.globalSize = stats.size;
                debugInfo.globalModified = stats.mtime.toLocaleString();
            }

            // Check project file
            if (fsSync.existsSync(debugInfo.projectClaudePath)) {
                debugInfo.projectExists = true;
                const stats = await fs.stat(debugInfo.projectClaudePath);
                debugInfo.projectSize = stats.size;
                debugInfo.projectModified = stats.mtime.toLocaleString();
            }

            // Check master file
            if (fsSync.existsSync(debugInfo.masterClaudePath)) {
                debugInfo.masterExists = true;
                const stats = await fs.stat(debugInfo.masterClaudePath);
                debugInfo.masterSize = stats.size;
                debugInfo.masterGenerated = stats.mtime.toLocaleString();
            }

            debugInfo.lastOperation = 'Debug info gathering';
            debugInfo.performanceMetrics = {
                'Memory Usage': `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                'Uptime': `${Math.round(process.uptime())} seconds`,
                'Node Version': process.version,
                'Platform': process.platform
            };

        } catch (error) {
            this.log('Error gathering debug info');
        }

        return debugInfo;
    }

    private async createProjectTemplate(filePath: string): Promise<void> {
        const projectName = path.basename(process.cwd());
        const template = `# 📋 PROJECT DOCUMENTATION: ${projectName}

> This file contains project-specific instructions that extend CES system documentation.
> It will be automatically merged with CES CLAUDE.md when sessions start.

## 🎯 Project Overview

**Project Name**: ${projectName}  
**Type**: [Web App / API / Library / CLI Tool]  
**Primary Language**: [JavaScript/TypeScript/Python/etc]  
**Started**: ${new Date().toISOString().split('T')[0]}

### Description
[Provide a brief description of what this project does and its main goals]

## 🏗️ Architecture

### Project Structure
\`\`\`
${projectName}/
├── src/           # [Describe source code organization]
├── tests/         # [Describe test structure]
├── docs/          # [Describe documentation]
└── ...
\`\`\`

## 🔧 Development Guidelines

### Coding Standards
- **Style Guide**: [ESLint/Prettier/Black/etc]
- **Naming Conventions**: [camelCase/snake_case/etc]
- **File Organization**: [How files should be organized]

### Git Workflow
- **Branch Strategy**: [main/develop/feature branches]
- **Commit Messages**: [Conventional commits/Custom format]
- **PR Process**: [Review requirements]

## 🚀 Custom Workflows

### Build Process
\`\`\`bash
# Commands for building the project
npm run build
\`\`\`

### Testing
\`\`\`bash
# Commands for testing
npm test
\`\`\`

### Deployment
\`\`\`bash
# Deployment process
npm run deploy
\`\`\`

## ⚠️ Important Notes

### Known Issues
- [List any known issues and workarounds]

### Security Considerations
- [Any security notes specific to this project]

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Maintained By**: [Team/Person Name]

<!--
This file is automatically merged with CES CLAUDE.md.
To see the merged result: npm run dev -- docs show
To regenerate: npm run dev -- docs regenerate
-->`;

        await fs.writeFile(filePath, template, 'utf-8');
    }
}