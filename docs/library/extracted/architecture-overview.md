# CES v2.7.0 Architecture Overview

*Auto-extracted from codebase*

## Project Structure

```
.
├── CLAUDE.md
├── LICENSE
├── README.md
├── docs
│   ├── CLAUDE-MERGE-FLOW.md
│   ├── MCP-GITHUB-SETUP.md
│   └── library
│       ├── 000-overview
│       ├── 100-introduction
│       ├── 1000-reference
│       ├── 1100-tutorials
│       ├── 1200-special
│       ├── 200-installation
│       ├── 300-configuration
│       ├── 400-operations
│       ├── 500-monitoring
│       ├── 600-integrations
│       ├── 700-deployment
│       ├── 800-testing
│       ├── 900-maintenance
│       └── extracted
├── examples
│   └── anthropic-usage.ts
├── jest.config.js
├── package-lock.json
├── package.json
├── scripts
│   ├── create-doc-placeholders.sh
│   ├── extract-documentation-from-code.sh
│   ├── generate-doc-index.sh
│   ├── integrate.sh
│   ├── merge-claude-docs.sh
│   ├── remap-documentation.sh
│   ├── setup-git-credentials.sh
│   ├── smart-content-extractor.sh
│   ├── test-dual-claude.sh
│   ├── test-integration.sh
│   └── validate-documentation.sh
├── src
│   ├── __tests__
│   │   ├── ConfigManager.test.ts
│   │   ├── DualClaudeSystem.test.ts.skip
│   │   ├── PathResolver.test.ts
│   │   └── example.test.ts
│   ├── cli
│   │   ├── AISessionManager.ts
│   │   ├── AnalyticsManager.ts
│   │   ├── AnthropicCLI.ts
│   │   ├── AutoRecoveryManager.ts
│   │   ├── AutoTaskManager.ts
│   │   ├── CLIManager.ts
│   │   ├── CloudIntegrationManager.ts
│   │   ├── DashboardManager.ts
│   │   ├── DocumentationCommands.ts
│   │   ├── QuickCommandManager.ts
│   │   ├── SessionMonitor.ts
│   │   ├── SessionProfileManager.ts
│   │   └── SystemCleanupManager.ts
│   ├── config
│   │   ├── ConfigManager.ts
│   │   └── EnvironmentConfig.ts
│   ├── index.ts
│   ├── integrations
│   │   └── anthropic
│   ├── session
│   │   └── SessionManager.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       ├── ClaudeDocManager.ts
│       ├── ClaudeMergeSystem.ts
│       ├── Logger.ts
│       └── PathResolver.ts
├── templates
│   └── PROJECT-CLAUDE.md.template
└── tsconfig.json

29 directories, 48 files
```

## Core Types and Interfaces

src/utils/ClaudeDocManager.ts:export interface ClaudeDocMetadata {
src/utils/ClaudeDocManager.ts:export interface ClaudeDocSearchResult {
src/utils/ClaudeDocManager.ts:export interface ClaudeDocWatchEvent {
src/utils/ClaudeDocManager.ts:export interface ClaudeDocBackupInfo {
src/utils/ClaudeDocManager.ts:export interface ClaudeDocValidation {
src/utils/PathResolver.ts:export interface PathDetectionInfo {
src/utils/PathResolver.ts:export interface CESPaths {
src/utils/ClaudeMergeSystem.ts:export interface MergeSystemConfig {
src/utils/ClaudeMergeSystem.ts:export interface MergeOperation {
src/utils/ClaudeMergeSystem.ts:export interface MergeSource {
src/utils/ClaudeMergeSystem.ts:export interface ConflictInfo {
src/utils/ClaudeMergeSystem.ts:export interface SystemMetrics {
src/utils/ClaudeMergeSystem.ts:export interface PluginInterface {
src/types/index.ts:export interface SessionConfig {
src/types/index.ts:export type SessionStatus = 'active' | 'suspended' | 'closed' | 'error';
src/types/index.ts:export interface MCPServerConfig {
src/types/index.ts:export interface AgentConfig {
src/types/index.ts:export interface EnvironmentConfig {
src/types/index.ts:export interface DetectedLanguage {
src/types/index.ts:export interface SessionCheckpoint {
src/types/index.ts:export interface SystemState {
src/types/index.ts:export interface ProcessInfo {
src/types/index.ts:export interface GitStatus {
src/types/index.ts:export interface CLICommand {
src/types/index.ts:export interface CLIOption {
src/types/index.ts:export interface ProjectHealth {
src/types/index.ts:export interface HealthCheck {
src/types/index.ts:export interface HealthIssue {
src/types/index.ts:export interface StartupHookResult {
src/types/index.ts:export type DeepPartial<T> = {

## Dependencies

```json
  "dependencies": {
    "@anthropic-ai/sdk": "^0.57.0",
    "@types/chokidar": "^1.7.5",
    "chalk": "^5.3.0",
    "chokidar": "^4.0.3",
    "commander": "^11.1.0",
    "dotenv": "^17.2.1",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.12",
    "lodash": "^4.17.21",
    "nanospinner": "^1.2.2",
    "uuid": "^9.0.1",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/inquirer": "^9.0.8",
    "@types/jest": "^29.5.8",
    "@types/lodash": "^4.14.202",
    "@types/node": "^20.19.9",
    "@types/uuid": "^9.0.8",
```
