# 🛠️ CLI Commands Reference - CES v2.6.0 Enterprise Edition

Comprehensive guide to all available CLI commands in the Claude Ecosystem Standard v2.6.0.

## 📋 Command Overview

```bash
# View all available commands
npm run dev -- --help

# Get help for specific command
npm run dev -- <command> --help
```

## 🏢 Enterprise Commands

### 1. Session Management

#### Start Session
```bash
npm run dev -- start-session [options]

Options:
  --interactive, -i     Interactive session setup
  --profile <name>      Use specific session profile
  --analytics           Enable analytics collection
  --recovery            Enable auto-recovery monitoring
  --verbose, -v         Verbose output

Examples:
npm run dev -- start-session
npm run dev -- start-session --interactive
npm run dev -- start-session --profile frontend-react
```

#### Checkpoint Session
```bash
npm run dev -- checkpoint-session [options]

Options:
  --name <name>         Checkpoint name
  --description <desc>  Checkpoint description
  --analytics           Include analytics data
  --verbose, -v         Verbose output

Examples:
npm run dev -- checkpoint-session
npm run dev -- checkpoint-session --name "feature-complete"
npm run dev -- checkpoint-session --description "Before refactoring"
```

#### Close Session
```bash
npm run dev -- close-session [options]

Options:
  --force, -f           Force close without confirmation
  --backup              Create backup before closing
  --analytics           Save analytics data
  --verbose, -v         Verbose output

Examples:
npm run dev -- close-session
npm run dev -- close-session --force --backup
```

### 2. Configuration Management

#### Configuration Commands
```bash
npm run dev -- config [options] [action]

Actions:
  show                  Display current configuration
  edit                  Interactive configuration editor
  validate              Validate configuration
  reset                 Reset to default configuration
  export                Export configuration
  import <file>         Import configuration

Options:
  --section <name>      Specific configuration section
  --format <format>     Output format (json/yaml/table)
  --verbose, -v         Verbose output

Examples:
npm run dev -- config show
npm run dev -- config show --section analytics
npm run dev -- config edit
npm run dev -- config validate --verbose
npm run dev -- config export --format json
```

### 3. Analytics & Monitoring

#### Analytics Commands
```bash
npm run dev -- analytics [options] [action]

Actions:
  dashboard             Show analytics dashboard
  export                Export analytics data
  real-time             Real-time analytics monitoring
  report                Generate analytics report
  clear                 Clear analytics data

Options:
  --period <period>     Time period (hour/day/week/month)
  --format <format>     Export format (json/csv/html)
  --include-events      Include raw events data
  --verbose, -v         Verbose output

Examples:
npm run dev -- analytics dashboard
npm run dev -- analytics export --format csv
npm run dev -- analytics real-time
npm run dev -- analytics report --period week
```

#### Dashboard Commands
```bash
npm run dev -- dashboard [options] [action]

Actions:
  live                  Live monitoring dashboard
  snapshot              Static dashboard snapshot
  compact               Compact monitoring view
  export                Export dashboard data

Options:
  --refresh <ms>        Refresh interval in milliseconds
  --theme <theme>       Dashboard theme (dark/light)
  --format <format>     Export format for data
  --verbose, -v         Verbose output

Examples:
npm run dev -- dashboard live
npm run dev -- dashboard live --refresh 1000
npm run dev -- dashboard snapshot
npm run dev -- dashboard export --format json
```

### 4. Auto-Recovery System

#### Recovery Commands
```bash
npm run dev -- recovery [options] [action]

Actions:
  start                 Start auto-recovery monitoring
  stop                  Stop auto-recovery monitoring
  status                Show recovery system status
  trigger <service>     Manual recovery trigger
  export                Export recovery data

Options:
  --service <name>      Target service name
  --action <action>     Recovery action (restart/cleanup/repair)
  --format <format>     Export format (json/csv/html)
  --verbose, -v         Verbose output

Examples:
npm run dev -- recovery start
npm run dev -- recovery status
npm run dev -- recovery trigger claude-code-cli
npm run dev -- recovery trigger mcp-servers --action cleanup
npm run dev -- recovery export --format html
```

### 5. Session Profiles

#### Profile Commands
```bash
npm run dev -- profiles [options] [action]

Actions:
  list                  List all available profiles
  create <name>         Create new profile
  apply <name>          Apply profile configuration
  delete <name>         Delete profile
  stats                 Profile usage statistics
  export <name>         Export profile configuration

Options:
  --description <desc>  Profile description
  --template <name>     Base template for new profile
  --force, -f           Force operation without confirmation
  --verbose, -v         Verbose output

Examples:
npm run dev -- profiles list
npm run dev -- profiles create "frontend-vue"
npm run dev -- profiles apply frontend-react
npm run dev -- profiles delete old-profile --force
npm run dev -- profiles stats
```

### 6. Quick Commands

#### Quick Command Management
```bash
npm run dev -- quick [options] [action] [alias] [args...]

Actions:
  list                  List all quick commands
  add <alias> <command> Add new quick command
  remove <alias>        Remove quick command
  run <alias>           Execute quick command
  edit <alias>          Edit quick command
  export                Export quick commands

Options:
  --description <desc>  Command description
  --global, -g          Global quick command
  --verbose, -v         Verbose output

Examples:
npm run dev -- quick list
npm run dev -- quick add build "npm run build"
npm run dev -- quick add test "npm test && npm run lint"
npm run dev -- quick run build
npm run dev -- quick remove old-command
```

### 7. AI Session Optimization

#### AI Session Commands
```bash
npm run dev -- ai-session [options] [action]

Actions:
  start                 Start AI session monitoring
  stop                  Stop AI session monitoring
  recommend             Get AI recommendations
  analyze               Analyze session patterns
  optimize              Optimize session configuration
  export                Export AI session data

Options:
  --mode <mode>         Learning mode (passive/active/aggressive)
  --accuracy <number>   Prediction accuracy threshold
  --format <format>     Export format (json/csv/html)
  --verbose, -v         Verbose output

Examples:
npm run dev -- ai-session start
npm run dev -- ai-session recommend
npm run dev -- ai-session analyze --mode active
npm run dev -- ai-session optimize
npm run dev -- ai-session export --format json
```

### 8. Cloud Integration

#### Cloud Commands
```bash
npm run dev -- cloud [options] [action]

Actions:
  connect               Connect to cloud provider
  sync                  Sync session data
  backup                Create cloud backup
  restore               Restore from cloud backup
  status                Show cloud integration status

Options:
  --provider <name>     Cloud provider (github/aws/azure)
  --encryption          Enable encryption
  --verbose, -v         Verbose output

Examples:
npm run dev -- cloud connect --provider github
npm run dev -- cloud sync --encryption
npm run dev -- cloud backup
npm run dev -- cloud status
```

## 🔧 System Commands

### 9. System Cleanup

#### Clean Reset Commands
```bash
npm run dev -- clean-reset [options]
npm run dev -- reset [options]                    # Alias

Options:
  --dry-run             Preview cleanup without changes
  --preserve-sessions   Keep Claude session data
  --preserve-logs       Keep log files
  --no-docker           Skip Docker container reset
  --no-node             Skip Node.js process cleanup
  --no-cache            Skip cache clearing
  --gentle              Use SIGTERM instead of SIGKILL
  --force, -f           Force cleanup without confirmation
  --verbose, -v         Verbose output

Examples:
npm run dev -- clean-reset --dry-run
npm run dev -- reset --preserve-sessions --preserve-logs
npm run dev -- clean-reset --gentle
```

### 10. Monitoring

#### Monitor Commands
```bash
npm run dev -- monitor [options] [action]

Actions:
  start                 Start session monitoring
  stop                  Stop session monitoring
  status                Show monitoring status
  trigger-checkpoint    Trigger checkpoint
  trigger-close         Trigger session close
  trigger-clean-reset   Trigger clean reset

Options:
  --interval <ms>       Monitoring interval
  --dry-run             Dry run mode for triggers
  --verbose, -v         Verbose output

Examples:
npm run dev -- monitor start
npm run dev -- monitor status
npm run dev -- monitor trigger-checkpoint
npm run dev -- monitor trigger-clean-reset --dry-run
```

### 11. System Status

#### Status Commands
```bash
npm run dev -- status [options]

Options:
  --detailed, -d        Detailed status information
  --format <format>     Output format (table/json/yaml)
  --services            Include service status
  --resources           Include resource usage
  --verbose, -v         Verbose output

Examples:
npm run dev -- status
npm run dev -- status --detailed
npm run dev -- status --format json
npm run dev -- status --services --resources
```

### 12. Validation

#### Validation Commands
```bash
npm run dev -- validate [options]

Options:
  --verbose, -v         Verbose validation output
  --quick, -q           Quick validation check
  --fix                 Attempt to fix issues automatically
  --report              Generate validation report

Examples:
npm run dev -- validate
npm run dev -- validate --verbose
npm run dev -- validate --quick
npm run dev -- validate --fix --report
```

## 🤖 Anthropic AI Integration Commands (NEW v2.6.0)

### 13. AI Commands

#### Ask Claude
```bash
npm run dev -- ai ask <prompt...> [options]

Options:
  --model, -m <model>       Claude model to use
  --temperature, -t <temp>  Response creativity (0.0-1.0)
  --stream, -s              Stream the response in real-time
  --max-tokens <number>     Maximum tokens in response
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai ask "Explain TypeScript interfaces"
npm run dev -- ai ask --stream "Write a React component"
npm run dev -- ai ask --model claude-3-opus-20240229 "Complex analysis"
npm run dev -- ai ask --temperature 0.9 "Creative coding ideas"
```

#### Code Analysis
```bash
npm run dev -- ai analyze <files...> [options]

Options:
  --type, -t <type>         Analysis type (security/performance/quality/bugs/all)
  --output, -o <format>     Output format (table/json/markdown)
  --save <file>             Save analysis to file
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai analyze src/index.ts
npm run dev -- ai analyze src/auth.ts --type security
npm run dev -- ai analyze src/config.ts src/utils.ts --type performance
npm run dev -- ai analyze src/ --type all --output json
npm run dev -- ai analyze *.ts --save analysis-report.md
```

#### Code Generation
```bash
npm run dev -- ai generate [options]

Options:
  --language, -l <lang>     Programming language
  --framework, -f <framework> Framework to use
  --style, -s <style>       Code style (functional/oop/procedural)
  --with-tests              Include unit tests
  --with-review             Review and improve generated code
  --output, -o <file>       Save generated code to file
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai generate --language typescript
npm run dev -- ai generate --framework react --style functional
npm run dev -- ai generate --language python --with-tests
npm run dev -- ai generate --with-review --output generated.ts
```

#### Interactive Chat
```bash
npm run dev -- ai chat [options]

Options:
  --model, -m <model>       Claude model to use
  --temperature, -t <temp>  Response creativity (0.0-1.0)
  --system <prompt>         System prompt for context
  --clear-history           Clear conversation history
  --save-conversation <file> Save conversation to file
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai chat
npm run dev -- ai chat --model claude-3-haiku-20240307
npm run dev -- ai chat --temperature 0.8
npm run dev -- ai chat --system "You are a TypeScript expert"
npm run dev -- ai chat --clear-history
```

#### Usage Statistics
```bash
npm run dev -- ai stats [options]

Options:
  --format, -f <format>     Output format (table/json/csv)
  --period <period>         Time period (hour/day/week/month)
  --export <file>           Export statistics to file
  --reset                   Reset usage statistics
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai stats
npm run dev -- ai stats --format json
npm run dev -- ai stats --period day --export stats.csv
npm run dev -- ai stats --reset
```

#### AI Configuration
```bash
npm run dev -- ai config [options] [action]

Actions:
  show                      Show AI configuration
  test                      Test API connectivity
  models                    List available models
  usage                     Show usage limits and costs

Options:
  --api-key <key>           Set API key
  --model <model>           Set default model
  --max-tokens <number>     Set default max tokens
  --temperature <number>    Set default temperature
  --verbose, -v             Verbose output

Examples:
npm run dev -- ai config show
npm run dev -- ai config test
npm run dev -- ai config models
npm run dev -- ai config --model claude-3-sonnet-20240229
```

### Advanced AI Workflows

#### Batch Analysis
```bash
# Analyze multiple files by type
npm run dev -- ai analyze src/**/*.ts --type security
npm run dev -- ai analyze src/**/*.js --type performance

# Analyze entire project
find src -name "*.ts" -exec npm run dev -- ai analyze {} --type quality \;
```

#### Code Review Workflow
```bash
# 1. Analyze code
npm run dev -- ai analyze src/new-feature.ts --type all

# 2. Generate improvements
npm run dev -- ai ask "How can I improve this code based on the analysis?"

# 3. Interactive discussion
npm run dev -- ai chat --system "You are reviewing TypeScript code"
```

#### AI-Powered Development
```bash
# Generate component with tests
npm run dev -- ai generate --framework react --with-tests

# Review and improve
npm run dev -- ai generate --with-review --language typescript

# Analyze generated code
npm run dev -- ai analyze generated-code.ts --type all
```

## 🤖 Automation Commands

### 14. Auto Task Dispatcher

#### Auto Task Commands
```bash
npm run dev -- auto-task <prompt>
npm run dev -- auto <prompt>                      # Alias

Options:
  --mode <mode>         Execution mode (parallel/sequential/hybrid)
  --agents <list>       Specific agents to use
  --priority <level>    Task priority (low/medium/high/critical)
  --verbose, -v         Verbose output

Examples:
npm run dev -- auto-task "Implement user authentication"
npm run dev -- auto "Optimize database performance" --mode parallel
npm run dev -- auto-task "Create REST API" --priority high
```

### 15. Interactive Mode

#### Interactive Commands
```bash
npm run dev -- interactive
npm run dev -- i                                  # Alias

Options:
  --profile <name>      Start with specific profile
  --analytics           Enable analytics in interactive mode
  --verbose, -v         Verbose output

Examples:
npm run dev -- interactive
npm run dev -- i --profile frontend-react
npm run dev -- interactive --analytics
```

## 🔄 Legacy Support Commands

### 16. Legacy Session Management

```bash
npm run dev -- clean-history [options]

Options:
  --backup-name <name>  Custom backup name
  --keep-recent <days>  Keep recent history (days)
  --compress            Compress backup files
  --verbose, -v         Verbose output

Examples:
npm run dev -- clean-history
npm run dev -- clean-history --backup-name "pre-refactor"
npm run dev -- clean-history --keep-recent 7 --compress
```

## 🚀 Advanced Usage

### Command Chaining

```bash
# Chain multiple commands
npm run dev -- start-session --profile frontend && \
npm run dev -- analytics dashboard && \
npm run dev -- recovery start
```

### Environment-Specific Commands

```bash
# Development environment
NODE_ENV=development npm run dev -- start-session --verbose

# Production environment  
NODE_ENV=production npm run dev -- validate --fix
```

### Configuration Override

```bash
# Override specific configuration
CES_DEBUG_ENABLED=true npm run dev -- status --detailed
CES_ANALYTICS_ENABLED=false npm run dev -- start-session

# Override AI configuration
ANTHROPIC_API_KEY=custom-key npm run dev -- ai ask "test"
CES_ANTHROPIC_MODEL=claude-3-opus-20240229 npm run dev -- ai analyze src/
CES_ANTHROPIC_MAX_TOKENS=2048 npm run dev -- ai generate --language typescript
```

## 📊 Output Formats

Most commands support multiple output formats:

- **table** - Human-readable table format (default)
- **json** - JSON format for programmatic use
- **yaml** - YAML format for configuration files
- **csv** - CSV format for data analysis
- **html** - HTML format for reports

## 🔐 Security Considerations

### Sensitive Commands

Commands that handle sensitive data require confirmation:

```bash
# These commands require confirmation
npm run dev -- config reset
npm run dev -- profiles delete <name>
npm run dev -- clean-reset
npm run dev -- recovery trigger <service> --action cleanup

# AI commands with data considerations
npm run dev -- ai analyze <sensitive-files>  # May expose code content
npm run dev -- ai config --api-key <key>     # Handles API credentials
npm run dev -- ai stats --reset              # Clears usage data
```

### Safe Mode

Use `--dry-run` option for safe preview:

```bash
npm run dev -- clean-reset --dry-run
npm run dev -- config reset --dry-run
npm run dev -- monitor trigger-clean-reset --dry-run
```

## 📚 Help and Documentation

### Getting Help

```bash
# General help
npm run dev -- --help

# Command-specific help
npm run dev -- <command> --help

# List all commands
npm run dev -- --list-commands

# Show command examples
npm run dev -- <command> --examples
```

### Verbose Output

Use `-v` or `--verbose` for detailed information:

```bash
npm run dev -- start-session --verbose
npm run dev -- analytics dashboard --verbose
npm run dev -- validate --verbose
```

The CLI system provides comprehensive enterprise-grade functionality with extensive configuration options and robust error handling.