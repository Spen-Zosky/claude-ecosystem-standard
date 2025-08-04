# 004 - COMPLETE CLI REFERENCE

## 🛠️ CES v2.7.0 Enterprise CLI Commands Reference

**Read after setup and installation** - Complete guide to all available commands in the system.

### 📋 Commands Overview

The CES v2.7.0 system provides over **40 enterprise CLI commands** organized in functional categories:

```bash
# General help
npm run dev -- --help

# Specific command help
npm run dev -- <command> --help

# List all commands
npm run dev -- --list-commands
```

### 🏢 Main Enterprise Commands

#### 1. 🎯 Session Management

**Enterprise Session Start**
```bash
npm run dev -- start-session [options]

Options:
  --interactive, -i     Interactive session setup
  --profile <name>      Use specific session profile
  --analytics           Enable analytics collection
  --recovery            Enable auto-recovery monitoring
  --verbose, -v         Detailed output

Examples:
npm run dev -- start-session --profile frontend-react
npm run dev -- start-session --interactive --analytics
```

**Session Checkpoint**
```bash
npm run dev -- checkpoint-session [options]

Options:
  --name <name>         Checkpoint name
  --description <desc>  Checkpoint description
  --analytics           Include analytics data
  --backup             Create complete backup

Examples:
npm run dev -- checkpoint-session --name "feature-complete"
npm run dev -- checkpoint-session --description "Before refactoring"
```

**Close Session**
```bash
npm run dev -- close-session [options]

Options:
  --force, -f           Force close without confirmation
  --backup              Create backup before closing
  --analytics           Save analytics data
  --cleanup             Automatic resource cleanup

Examples:
npm run dev -- close-session --backup --analytics
npm run dev -- close-session --force --cleanup
```

#### 2. ⚙️ Configuration Management

**Configuration Management**
```bash
npm run dev -- config [action] [options]

Actions:
  show                  Show current configuration
  edit                  Interactive configuration editor
  validate              Validate configuration
  reset                 Reset to default configuration
  export                Export configuration
  import <file>         Import configuration
  generate              Generate new configuration

Options:
  --section <name>      Specific configuration section
  --format <format>     Output format (json/yaml/table)
  --enterprise          Enterprise configuration
  --backup              Backup before changes

Examples:
npm run dev -- config show --section analytics
npm run dev -- config edit --enterprise
npm run dev -- config validate --verbose
npm run dev -- config export --format json
npm run dev -- config generate --enterprise
```

#### 3. 📊 Analytics & Monitoring

**Complete Analytics System**
```bash
npm run dev -- analytics [action] [options]

Actions:
  dashboard             Complete analytics dashboard
  report                Generate analytics report
  realtime              Real-time monitoring
  export                Export analytics data
  start                 Start data collection
  stop                  Stop data collection
  clear                 Clear analytics data

Options:
  --period <period>     Time period (hour/day/week/month)
  --format <format>     Export format (json/csv/html)
  --include-events      Include raw events
  --live                Live updates
  --summary             Summary only

Examples:
npm run dev -- analytics dashboard --live
npm run dev -- analytics report --period week
npm run dev -- analytics export --format csv
npm run dev -- analytics realtime --summary
```

**Dashboard Monitoring**
```bash
npm run dev -- dashboard [action] [options]

Actions:
  live                  Live dashboard monitoring
  snapshot              Static dashboard snapshot
  compact               Compact monitoring view
  export                Export dashboard data
  configure             Configure dashboard

Options:
  --refresh <ms>        Refresh interval milliseconds
  --theme <theme>       Dashboard theme (dark/light)
  --port <port>         Dashboard server port
  --auto-open           Open browser automatically

Examples:
npm run dev -- dashboard live --refresh 1000
npm run dev -- dashboard configure --theme dark --port 3000
npm run dev -- dashboard snapshot --export json
```

#### 4. 🔄 Auto-Recovery System

**Auto-Recovery System**
```bash
npm run dev -- recovery [action] [options]

Actions:
  start                 Start auto-recovery monitoring
  stop                  Stop auto-recovery monitoring
  status                Recovery system status
  trigger <service>     Manual recovery trigger
  configure             Configure recovery system
  export                Export recovery data

Options:
  --service <name>      Target service name
  --action <action>     Recovery action (restart/cleanup/repair)
  --threshold <value>   Recovery trigger threshold
  --interval <ms>       Monitoring interval

Examples:
npm run dev -- recovery start --interval 10000
npm run dev -- recovery trigger claude-code-cli --action restart
npm run dev -- recovery configure --threshold 80
npm run dev -- recovery status --detailed
```

#### 5. 👤 Session Profiles

**Profile Management**
```bash
npm run dev -- profiles [action] [options]

Actions:
  list                  List available profiles
  create <name>         Create new profile
  apply <name>          Apply profile configuration
  delete <name>         Delete profile
  edit <name>           Edit existing profile
  export <name>         Export profile configuration
  import <file>         Import profile from file
  stats                 Profile usage statistics

Options:
  --description <desc>  Profile description
  --template <name>     Base template for new profile
  --force, -f           Force operation without confirmation
  --enterprise          Enterprise profile

Examples:
npm run dev -- profiles create "frontend-vue" --template react
npm run dev -- profiles apply frontend-react --analytics
npm run dev -- profiles export "my-profile" --format yaml
npm run dev -- profiles stats --detailed
```

#### 6. ⚡ Quick Commands

**Quick Commands**
```bash
npm run dev -- quick [action] [alias] [args...]

Actions:
  list                  List quick commands
  add <alias> <command> Add quick command
  remove <alias>        Remove quick command
  edit <alias>          Edit quick command
  run <alias>           Execute quick command
  stats                 Usage statistics
  cheat                 Complete cheat sheet
  export                Export quick commands

Predefined Quick Commands:
  start                 Quick session startup
  dash                  Dashboard monitoring
  clean                 Cleanup preview
  status               Complete status check
  build                Build project
  test                 Complete test suite
  react                Setup React environment
  vue                  Setup Vue environment
  api                  Setup API development

Examples:
npm run dev -- quick list --category development
npm run dev -- quick add mybuild "npm run build && npm test"
npm run dev -- quick start --profile frontend
npm run dev -- quick stats --period week
```

#### 7. 🤖 AI Session Optimization

**AI Session Optimization**
```bash
npm run dev -- ai-session [action] [options]

Actions:
  start                 Start AI monitoring
  stop                  Stop AI monitoring
  insights              Session insights analysis
  recommendations       Optimization recommendations
  optimize              Automatic optimization
  configure             Configure AI behavior
  analyze               Session pattern analysis
  export                Export AI data

Options:
  --learning-mode <mode>    Learning mode (passive/active/aggressive)
  --accuracy <number>       Prediction accuracy threshold
  --adaptation-level <lvl>  Adaptation level (minimal/standard/maximum)
  --enable-predictions      Enable predictions
  --context-awareness       Enable context awareness

Examples:
npm run dev -- ai-session insights --detailed
npm run dev -- ai-session recommendations --learning-mode active
npm run dev -- ai-session optimize --accuracy 85
npm run dev -- ai-session configure --adaptation-level maximum
```

#### 8. ☁️ Cloud Integration

**Cloud Integration**
```bash
npm run dev -- cloud [action] [options]

Actions:
  status                Cloud integration status
  configure             Configure cloud provider
  connect               Connect to cloud provider
  sync                  Synchronize session data
  backup                Create cloud backup
  restore               Restore from cloud backup
  list-backups          List available backups
  start-sync            Start automatic synchronization
  stop-sync             Stop automatic synchronization

Options:
  --provider <name>     Cloud provider (github/aws/azure/gcp)
  --encryption          Enable encryption
  --compression         Enable compression
  --retention <days>    Backup retention days

Examples:
npm run dev -- cloud configure --provider github --encryption
npm run dev -- cloud backup --compression --retention 30
npm run dev -- cloud sync --incremental
npm run dev -- cloud restore --backup-id "2024-01-15-backup"
```

### 🔧 System Commands

#### 9. 🧹 System Cleanup

**System Clean Reset**
```bash
npm run dev -- clean-reset [options]
npm run dev -- reset [options]                    # Alias

Options:
  --dry-run             Preview cleanup without changes
  --preserve-sessions   Preserve Claude session data
  --preserve-logs       Preserve log files
  --preserve-analytics  Preserve analytics data
  --no-docker           Skip Docker container reset
  --no-node             Skip Node.js process cleanup
  --no-cache            Skip cache cleanup
  --gentle              Use SIGTERM instead of SIGKILL
  --force, -f           Force cleanup without confirmation
  --deep                Deep system cleanup

Examples:
npm run dev -- clean-reset --dry-run --preserve-logs
npm run dev -- reset --preserve-sessions --gentle
npm run dev -- clean-reset --deep --force
```

#### 10. 📊 Monitoring

**System Monitoring**
```bash
npm run dev -- monitor [action] [options]

Actions:
  start                 Start session monitoring
  stop                  Stop session monitoring
  status                Monitoring status
  trigger-checkpoint    Manual checkpoint trigger
  trigger-close         Session close trigger
  trigger-clean-reset   Clean reset trigger
  configure             Configure monitoring

Options:
  --interval <ms>       Monitoring interval
  --auto-checkpoint     Automatic checkpoint
  --auto-recovery       Automatic recovery
  --notifications       Event notifications

Examples:
npm run dev -- monitor start --interval 30000 --auto-checkpoint
npm run dev -- monitor configure --auto-recovery --notifications
npm run dev -- monitor trigger-checkpoint --name "milestone"
```

#### 11. ✅ System Status

**System Status**
```bash
npm run dev -- status [options]

Options:
  --detailed, -d        Detailed status information
  --format <format>     Output format (table/json/yaml)
  --services            Include service status
  --resources           Include resource usage
  --health              Complete health check
  --performance         Performance metrics

Examples:
npm run dev -- status --detailed --health
npm run dev -- status --services --resources --format json
npm run dev -- status --performance --detailed
```

#### 12. 🔍 Validation

**System Validation**
```bash
npm run dev -- validate [options]

Options:
  --verbose, -v         Detailed validation output
  --quick, -q           Quick validation
  --comprehensive       Comprehensive enterprise validation
  --fix                 Attempt automatic repair
  --report              Generate validation report
  --score               Show validation score

Examples:
npm run dev -- validate --comprehensive --fix
npm run dev -- validate --report --score
npm run dev -- validate --quick --verbose
```

### 🤖 Automation Commands

#### 13. 🔄 Auto Task Dispatcher

**Automatic Task Dispatcher**
```bash
npm run dev -- auto-task <prompt>
npm run dev -- auto <prompt>                      # Alias

Options:
  --mode <mode>         Execution mode (parallel/sequential/hybrid)
  --agents <list>       Specific agents to use
  --priority <level>    Task priority (low/medium/high/critical)
  --timeout <ms>        Task execution timeout
  --dry-run             Execution simulation

Examples:
npm run dev -- auto-task "Implement user authentication system"
npm run dev -- auto "Optimize database performance" --mode parallel
npm run dev -- auto-task "Create REST API endpoints" --priority high
```

#### 14. 💬 Interactive Mode

**Interactive Mode**
```bash
npm run dev -- interactive
npm run dev -- i                                  # Alias

Options:
  --profile <name>      Start with specific profile
  --analytics           Enable analytics in interactive mode
  --ai-assistance       Enable AI assistance
  --enterprise          Enterprise mode

Examples:
npm run dev -- interactive --profile frontend-react --analytics
npm run dev -- i --ai-assistance --enterprise
```

### 🎯 Advanced Commands

#### 15. 📈 Performance & Optimization

**Performance Optimization**
```bash
npm run dev -- optimize [target] [options]

Target:
  system                Complete system optimization
  memory                Memory optimization
  cpu                   CPU optimization
  network               Network optimization
  storage               Storage optimization

Options:
  --aggressive          Aggressive optimization
  --safe                Safe optimization
  --benchmark           Include performance benchmark

Examples:
npm run dev -- optimize system --benchmark
npm run dev -- optimize memory --aggressive
npm run dev -- optimize network --safe
```

### 🔗 Command Chaining

**Command Chaining**

```bash
# Complete development workflow
npm run dev -- start-session --profile react && \
npm run dev -- analytics start && \
npm run dev -- recovery start && \
npm run dev -- dashboard live

# Setup enterprise environment
npm run dev -- config generate --enterprise && \
npm run dev -- validate --comprehensive --fix && \
npm run dev -- profiles apply enterprise-default
```

### 🌍 Environment Variables

**Configuration Override**

```bash
# Development with debug
DEBUG=ces:* CES_VERBOSE_LOGGING=true npm run dev -- start-session

# Safe production
NODE_ENV=production CES_ANALYTICS_ENABLED=false npm run dev -- validate

# Testing with override
CES_TEST_MODE=true CES_MOCK_SERVICES=true npm run dev -- auto-task "test"
```

### 📊 Output Formats

**Supported Formats:**

- **table** - Readable table format (default)
- **json** - JSON format for automation
- **yaml** - YAML format for configuration
- **csv** - CSV format for data analysis
- **html** - HTML format for reports
- **markdown** - Markdown format for documentation

### 🔐 Safe Mode

**Safe Commands with Dry-Run:**

```bash
npm run dev -- clean-reset --dry-run
npm run dev -- config reset --dry-run
npm run dev -- profiles delete sensitive-profile --dry-run
npm run dev -- recovery trigger critical-service --dry-run
```

### 📚 Help System

**Getting Help:**

```bash
# General help
npm run dev -- --help

# Specific command help  
npm run dev -- analytics --help

# Command examples
npm run dev -- profiles --examples

# Interactive guide
npm run dev -- help --interactive
```

---

**📌 The CES v2.7.0 CLI system provides a complete enterprise interface with over 200 options and combinations to manage every aspect of the development workflow.**