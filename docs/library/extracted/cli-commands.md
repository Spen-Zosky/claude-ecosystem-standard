# CES v2.7.0 CLI Commands Documentation

*Auto-extracted from codebase*

## Available Commands


## AISessionManager

export class AISessionManager {
    private configManager: ConfigManager;
    private profileManager: SessionProfileManager;
    
    private aiConfig: AISessionConfig;
    private currentContext: SessionContext;
    private learningData: any[] = [];
    private recommendations: AIRecommendation[] = [];
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;

### Methods:

129:    private async initializeAI(): Promise<void> {
140:    async startAIMonitoring(): Promise<void> {
171:    async startAIMonitoringExplicit(): Promise<void> {
178:    async stopAIMonitoring(): Promise<void> {
205:    async getSmartProfileRecommendations(): Promise<AIRecommendation[]> {
274:    async getSmartCommandSuggestions(partialCommand?: string): Promise<SmartSuggestion[]> {
337:    async optimizeCurrentSession(): Promise<SessionOptimization> {
410:    async learnFromUserBehavior(action: string, context: any, success: boolean): Promise<void> {
439:    async showAIInsights(): Promise<void> {
500:    async configureAI(config: Partial<AISessionConfig>): Promise<void> {

## AnalyticsManager

export class AnalyticsManager {
    private events: AnalyticsEvent[] = [];
    private analyticsConfig: AnalyticsConfig;
    private analyticsDir: string;
    private eventsFile: string;
    private isCollecting: boolean = false;
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;
    private sessionId: string;
    // private _startTime: Date; // Removed unused field

### Methods:

117:    private async initializeAnalytics(): Promise<void> {
128:    async startDataCollection(): Promise<void> {
162:    async stopDataCollection(): Promise<void> {
198:    async logEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
232:    async generateReport(
274:    async showAnalyticsDashboard(): Promise<void> {
356:    async exportAnalytics(
395:    async showRealTimeAnalytics(): Promise<void> {
432:    private async calculateUsageMetrics(events: AnalyticsEvent[]): Promise<UsageMetrics> {
483:    private async calculatePerformanceMetrics(events: AnalyticsEvent[]): Promise<PerformanceMetrics> {

## AutoRecoveryManager

export class AutoRecoveryManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private cleanupManager: SystemCleanupManager;
    private isMonitoring: boolean = false;
    private monitoringProcess: ChildProcess | null = null;
    private recoveryConfig: RecoveryConfig;
    private serviceHealth: Map<string, ServiceHealth> = new Map();
    private recoveryActions: RecoveryAction[] = [];
    private recoveryMode: boolean = false;
    

### Methods:

98:    async startAutoRecovery(): Promise<void> {
128:    async stopAutoRecovery(): Promise<void> {
151:    async getSystemHealth(): Promise<SystemHealth> {
167:    async triggerRecovery(serviceName: string, action: 'restart' | 'cleanup' | 'repair' = 'restart'): Promise<boolean> {
211:    async showRecoveryStatus(): Promise<void> {
274:    async setRecoveryMode(enabled: boolean): Promise<void> {
295:    async exportRecoveryData(format: 'json' | 'csv' | 'html' = 'json'): Promise<string> {
333:        const monitor = async () => {
354:    private async performFullHealthCheck(): Promise<void> {
380:    private async performHealthChecks(): Promise<void> {

## AutoTaskManager

export class AutoTaskManager {
    // private _configManager: ConfigManager; // Removed unused field
    private taskPatterns: Map<TaskType, TaskPattern>;

    constructor(_configManager: ConfigManager) {
        // this._configManager = configManager; // Removed unused field
        this.taskPatterns = this.initializeTaskPatterns();
    }

    /**
     * Main entry point for automatic task dispatch

### Methods:

85:    async executeAutoTask(prompt: string): Promise<void> {

## CLIManager

export class CLIManager {
    private documentationCommands: DocumentationCommands;

    constructor(
        private sessionManager: SessionManager,
        private configManager: ConfigManager
    ) {
        this.documentationCommands = new DocumentationCommands();
    }

    /**

### Methods:

29:    async showStatus(): Promise<void> {
65:    async handleConfig(options: any): Promise<void> {
82:    async handleDocs(args: string[]): Promise<number> {
95:    async startInteractive(): Promise<void> {
245:    private async displayMCPServers(): Promise<void> {
287:    private async displayAgents(): Promise<void> {
331:    private async showConfiguration(): Promise<void> {
347:    private async resetConfiguration(): Promise<void> {
371:    private async interactiveStartSession(): Promise<void> {
394:    private async interactiveCreateCheckpoint(): Promise<void> {

## CloudIntegrationManager

export class CloudIntegrationManager {
    private profileManager: SessionProfileManager;
    private quickCommandManager: QuickCommandManager;
    
    private cloudConfig: CloudConfig;
    private cloudDir: string;
    private syncInterval: NodeJS.Timeout | null = null;
    private deviceId: string;
    private userId: string;

    constructor(

### Methods:

135:    private async initializeCloud(): Promise<void> {
148:    async configureCloud(config: Partial<CloudConfig>): Promise<void> {
166:    async createBackup(tags: string[] = []): Promise<SessionBackup> {
224:    async restoreBackup(backupId: string, selective?: Partial<SessionBackup['sessionData']>): Promise<boolean> {
288:    async syncWithCloud(): Promise<SyncStatus> {
367:    async showCloudStatus(): Promise<void> {
426:    async startAutoSync(): Promise<void> {
433:        this.syncInterval = setInterval(async () => {
447:    async stopAutoSync(): Promise<void> {
458:    async exportCloudData(format: 'json' | 'tar' | 'zip' = 'json'): Promise<string> {

## DashboardManager

export class DashboardManager {
    private configManager: ConfigManager;
    // private _sessionManager: SessionManager; // Removed unused field
    private sessionMonitor: SessionMonitor;
    private isRunning: boolean = false;
    private refreshTimer: NodeJS.Timeout | null = null;
    private metricsHistory: DashboardMetrics[] = [];

    constructor(
        configManager: ConfigManager,
        _sessionManager: SessionManager,

### Methods:

123:    async showLiveDashboard(options: Partial<DashboardOptions> = {}): Promise<void> {
143:        this.refreshTimer = setInterval(async () => {
160:    async showSnapshot(options: Partial<DashboardOptions> = {}): Promise<void> {
179:    private async displayDashboard(options: DashboardOptions): Promise<void> {
432:    private async collectMetrics(): Promise<DashboardMetrics> {
448:    private async collectSystemMetrics(): Promise<SystemMetrics> {
509:    private async collectSessionMetrics(): Promise<SessionMetrics> {
524:    private async collectMCPServerMetrics(): Promise<MCPServerMetrics[]> {
550:    private async collectProcessMetrics(): Promise<ProcessMetrics> {
581:    private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {

## QuickCommandManager

export class QuickCommandManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private profileManager: SessionProfileManager;
    private autoTaskManager: AutoTaskManager;
    private cleanupManager: SystemCleanupManager;
    private dashboardManager: DashboardManager | null = null;
    private recoveryManager: AutoRecoveryManager | null = null;
    private sessionMonitor: SessionMonitor | null = null;
    private commands: Map<string, QuickCommand> = new Map();
    private commandsFile: string;

### Methods:

87:    private async initializeQuickCommands(): Promise<void> {
98:    private async createBuiltinCommands(): Promise<void> {
319:    async executeQuickCommand(alias: string, args: string[] = []): Promise<boolean> {
356:    async listQuickCommands(category?: string): Promise<QuickCommand[]> {
374:    async createQuickCommand(
407:    async updateQuickCommand(alias: string, updates: Partial<QuickCommand>): Promise<boolean> {
429:    async deleteQuickCommand(alias: string): Promise<boolean> {
564:    async interactiveSelector(): Promise<void> {
602:    async exportQuickCommands(format: 'json' | 'csv' = 'json'): Promise<string> {
625:    async importQuickCommands(filepath: string, overwrite: boolean = false): Promise<number> {

## SessionProfileManager

export class SessionProfileManager {
    private configManager: ConfigManager;
    private sessionManager: SessionManager;
    private profiles: Map<string, SessionProfile> = new Map();
    private activeProfile: SessionProfile | null = null;
    private profilesDir: string;

    constructor(configManager: ConfigManager, sessionManager: SessionManager) {
        this.configManager = configManager;
        this.sessionManager = sessionManager;
        this.profilesDir = path.join(configManager.getProjectRoot(), '.claude', 'profiles');

### Methods:

75:    private async initializeBuiltinProfiles(): Promise<void> {
90:    private async createBuiltinProfiles(): Promise<void> {
390:    async listProfiles(category?: string): Promise<SessionProfile[]> {
415:    async applyProfile(profileId: string): Promise<boolean> {
460:    async createCustomProfile(
531:    async updateProfile(profileId: string, updates: Partial<SessionProfile>): Promise<boolean> {
554:    async deleteProfile(profileId: string): Promise<boolean> {
578:    async showProfile(profileId: string): Promise<void> {
672:    async showProfileStats(): Promise<void> {
715:    async quickSwitch(): Promise<void> {

## SystemCleanupManager

export class SystemCleanupManager {
    // private _configManager: ConfigManager; // Removed unused field
    private projectRoot: string;
    
    // Enterprise configuration and logging
    private logger: ComponentLogger;
    private sessionId: string;

    constructor(_configManager: ConfigManager) {
        // this._configManager = configManager; // Removed unused field
        this.projectRoot = envConfig.getProjectRoot();

### Methods:

72:    async executeCleanReset(options: Partial<CleanupOptions> = {}): Promise<CleanupReport> {
168:    private async createPreCleanupBackup(report: CleanupReport, options: CleanupOptions): Promise<void> {
206:    private async killClaudeProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
227:    private async killDevelopmentProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
249:    private async freeCommonPorts(report: CleanupReport, options: CleanupOptions): Promise<void> {
272:    private async killAllNodeProcesses(report: CleanupReport, options: CleanupOptions): Promise<void> {
313:    private async resetDockerContainers(report: CleanupReport, options: CleanupOptions): Promise<void> {
351:    private async cleanTemporaryFiles(report: CleanupReport, options: CleanupOptions): Promise<void> {
393:    private async clearSystemCache(report: CleanupReport, options: CleanupOptions): Promise<void> {
430:    private async resetNetworkConnections(report: CleanupReport, options: CleanupOptions): Promise<void> {
