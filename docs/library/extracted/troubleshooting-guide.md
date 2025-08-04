# CES v2.7.0 Troubleshooting Guide

*Auto-extracted from codebase*

## Common Issues and Solutions

### Error Handling Patterns

src/utils/ClaudeMergeSystem.ts:            throw new Error('Merge operation failed');
src/cli/AutoRecoveryManager.ts:                console.error(chalk.red('❌ Monitoring error:'), error instanceof Error ? error.message : error);
src/cli/AutoRecoveryManager.ts:            console.error(chalk.red(`❌ Failed to restart ${serviceName}:`), error instanceof Error ? error.message : error);
src/cli/AutoRecoveryManager.ts:            console.error(chalk.red(`❌ Failed to cleanup ${serviceName}:`), error instanceof Error ? error.message : error);
src/cli/AutoRecoveryManager.ts:            console.error(chalk.red(`❌ Failed to repair ${serviceName}:`), error instanceof Error ? error.message : error);
src/cli/AnthropicCLI.ts:                    console.error(chalk.red('❌ Failed to get response:'), (error as Error).message);
src/cli/AnthropicCLI.ts:                    console.error(chalk.red('❌ Analysis failed:'), (error as Error).message);
src/cli/AnthropicCLI.ts:                    console.error(chalk.red('❌ Generation failed:'), (error as Error).message);
src/cli/AnthropicCLI.ts:                            console.error(chalk.red('❌ Failed to get response:'), (error as Error).message);
src/cli/AnthropicCLI.ts:                    console.error(chalk.red('❌ Failed to get stats:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error displaying status:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error handling configuration:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error handling documentation command:'), errorMessage);
src/cli/CLIManager.ts:                    console.error(chalk.red('❌ Error:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error in interactive mode:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error showing configuration:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Error resetting configuration:'), (error as Error).message);
src/cli/CLIManager.ts:            console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : error);
src/cli/SessionProfileManager.ts:            console.error(chalk.red('❌ Failed to apply profile:'), error instanceof Error ? error.message : error);
src/cli/SessionProfileManager.ts:            throw new Error(`Profile '${profileId}' not found`);

### Known Issues (TODO/FIXME)

src/cli/SessionProfileManager.ts:                    DEBUG: '*',
src/cli/DocumentationCommands.ts:// import { claudeDocManager } from '../utils/ClaudeDocManager.js'; // TODO: Use in future for advanced operations
src/cli/DocumentationCommands.ts:            console.log(chalk.cyan('CLAUDE DOCUMENTATION SYSTEM - DEBUG INFO'));
src/config/EnvironmentConfig.ts:        debugEnabled: this.getEnvBoolean('CES_DEBUG_ENABLED', false),

### Validation Patterns

src/utils/ClaudeDocManager.ts:    checksum?: string;
src/utils/ClaudeDocManager.ts:    public async validateSetup(): Promise<ClaudeDocValidation> {
src/utils/PathResolver.ts:      if (this.validateCesRoot(process.env['CES_ROOT']!)) {
src/utils/PathResolver.ts:      if (moduleBasedRoot && this.validateCesRoot(moduleBasedRoot)) {
src/utils/PathResolver.ts:      if (markerBasedRoot && this.validateCesRoot(markerBasedRoot)) {
src/utils/PathResolver.ts:      if (packageBasedRoot && this.validateCesRoot(packageBasedRoot)) {
src/utils/PathResolver.ts:  private validateCesRoot(candidateRoot: string): boolean {
src/utils/ClaudeMergeSystem.ts:    checksum: string;
src/utils/ClaudeMergeSystem.ts:                checksum: this.calculateChecksum(content),
src/utils/ClaudeMergeSystem.ts:                checksum: this.calculateChecksum(content),
src/utils/ClaudeMergeSystem.ts:        // Simple checksum implementation
src/types/index.ts:    checkpoints: SessionCheckpoint[];
src/cli/AutoRecoveryManager.ts:        // Initial health check
src/cli/AutoRecoveryManager.ts:            // Schedule next check
src/cli/AutoRecoveryManager.ts:     * Perform comprehensive health checks
src/cli/AutoRecoveryManager.ts:        console.log(chalk.cyan('🔍 Performing full health check...'));
src/cli/AutoRecoveryManager.ts:            await this.checkServiceHealth(serviceName);
src/cli/AutoRecoveryManager.ts:        await this.checkClaudeCodeCLI();
src/cli/AutoRecoveryManager.ts:        await this.checkMCPServers();
src/cli/AutoRecoveryManager.ts:        await this.checkSessionSystem();
