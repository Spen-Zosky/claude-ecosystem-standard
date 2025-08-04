# 🚀 CES Portable Installation Guide

**Claude Ecosystem Standard v2.7.0 - Portable Edition**

This guide covers how to install and use CES as a completely portable system that works as a drop-in subdirectory in any project.

## 📋 Overview

CES v2.7.0 introduces **complete portability**, allowing you to:
- Install CES as a subdirectory in any existing project
- Use CES without modifying your host project files
- Auto-detect installation context and configure paths dynamically
- Work seamlessly across Windows, Linux, and macOS

## 🎯 Installation Methods

### Method 1: Subdirectory Installation (NEW - Recommended)

Install CES as a subdirectory in your existing project:

```bash
# In your existing project directory
cd /path/to/your-project

# Clone CES as 'ces' subdirectory
git clone https://github.com/anthropics/claude-ecosystem-standard.git ces

# Initialize CES (auto-detects subdirectory installation)
cd ces
./init.sh

# CES is now ready to use!
npm run dev
```

**Benefits:**
- ✅ No modification of your project files
- ✅ All CES files isolated in `ces/` directory
- ✅ Automatic path detection and configuration
- ✅ Easy to remove (just delete `ces/` directory)

### Method 2: Standalone Installation (Traditional)

Install CES as a standalone project:

```bash
# Clone as standalone project
git clone https://github.com/anthropics/claude-ecosystem-standard.git ces-project

# Initialize CES (auto-detects standalone installation)
cd ces-project
./init.sh

# CES is ready for standalone use
npm run dev
```

## 🔧 Auto-Detection System

CES automatically detects its installation context:

### Subdirectory Detection
- **Trigger**: Directory name is `ces`
- **Behavior**: Sets PROJECT_ROOT to parent directory
- **Configuration**: Isolates all CES files within subdirectory

### Standalone Detection
- **Trigger**: Directory name is not `ces`
- **Behavior**: Sets PROJECT_ROOT to CES directory
- **Configuration**: Standard standalone operation

## 🌐 Cross-Platform Compatibility

### Windows
```powershell
# PowerShell/Command Prompt
cd C:\your-project
git clone <repo> ces
cd ces
./init.sh
```

### Linux/macOS
```bash
# Terminal
cd /home/user/your-project
git clone <repo> ces
cd ces
./init.sh
```

### WSL (Windows Subsystem for Linux)
```bash
# WSL Terminal
cd /mnt/c/your-project
git clone <repo> ces
cd ces
./init.sh
```

## 📁 Directory Structure

### Subdirectory Installation
```
your-project/                    # Your existing project
├── src/                        # Your project files (untouched)
├── package.json               # Your project files (untouched)
├── README.md                  # Your project files (untouched)
└── ces/                       # CES installation (isolated)
    ├── src/                   # CES TypeScript source
    ├── .claude/               # CES MCP configuration
    ├── .ces-data/            # CES data directory
    ├── .ces-logs/            # CES log files
    ├── package.json          # CES dependencies
    ├── init.sh               # CES portable initializer
    └── node_modules/         # CES dependencies
```

### Standalone Installation
```
ces-project/                    # CES standalone
├── src/                       # CES TypeScript source
├── .claude/                   # CES MCP configuration
├── .ces-data/                # CES data directory
├── .ces-logs/                # CES log files
├── package.json              # CES dependencies
├── init.sh                   # CES portable initializer
└── node_modules/             # CES dependencies
```

## ⚙️ Configuration

### Environment Variables

CES automatically sets these variables based on detection:

```bash
# Auto-detected by CES
export CES_ROOT="/path/to/ces"              # CES installation directory
export PROJECT_ROOT="/path/to/your-project" # Host project directory
export INSTALLATION_TYPE="subdirectory"     # or "standalone"
```

### Configuration Files

All configuration is automatically generated with portable paths:

- **`.env`**: Environment configuration with auto-detected paths
- **`.claude/claude_desktop_config.json`**: MCP servers with portable paths
- **`.ces-init-summary.txt`**: Installation summary and paths

## 🔄 Common Workflows

### Development Workflow (Subdirectory)
```bash
# Navigate to CES subdirectory
cd your-project/ces

# Start CES development mode
npm run dev

# Run specific CES commands
npm run dev -- start-session
npm run dev -- monitor
npm run dev -- validate
```

### Development Workflow (Standalone)
```bash
# In CES directory
npm run dev

# Standard CES operations
npm run dev -- start-session
npm run dev -- close-session
```

### Testing Portability
```bash
# Quick portability test
./test-portability-simple.sh

# Comprehensive portability test
./test-portability.sh
```

## 🧪 Validation

### Quick Validation
```bash
# Verify CES is properly configured
npm run dev -- validate

# Verbose validation with path details
npm run dev -- validate --verbose
```

### PathResolver Testing
```bash
# Run PathResolver unit tests
npm test -- --testPathPattern=PathResolver

# Run all tests
npm test
```

## 🔧 Troubleshooting

### Path Detection Issues

If CES doesn't detect paths correctly:

1. **Check environment variables:**
   ```bash
   echo $CES_ROOT
   echo $PROJECT_ROOT
   echo $INSTALLATION_TYPE
   ```

2. **Manual path override:**
   ```bash
   export CES_ROOT="/path/to/ces"
   export PROJECT_ROOT="/path/to/your-project"
   ```

3. **Validate detection:**
   ```bash
   npm run dev -- validate --verbose
   ```

### Installation Type Override

Force a specific installation type:

```bash
# Force subdirectory mode
export INSTALLATION_TYPE="subdirectory"
./init.sh

# Force standalone mode
export INSTALLATION_TYPE="standalone"
./init.sh
```

### Cross-Platform Path Issues

For Windows path issues:

```bash
# Use WSL for consistent Unix paths
wsl
cd /mnt/c/your-project/ces
./init.sh
```

### Permission Issues

On Unix systems:

```bash
# Make init script executable
chmod +x init.sh

# Fix all script permissions
chmod +x scripts/*.sh
```

## 🔄 Migration

### From v2.7.0 to v2.7.0 (Portable)

Existing installations automatically become portable:

```bash
# Existing installation - no changes needed
git pull origin main
./init.sh  # or ./ces-init-private.sh (backward compatible)
```

### Rollback to v2.7.0

If you need to revert portability features:

```bash
# Safe rollback with backup
./rollback-portability.sh
```

## 🚨 Rollback System

CES includes a comprehensive rollback system:

### Automatic Backup
- Creates timestamped backup before any rollback
- Preserves all portable implementation files
- Safe restoration of pre-portable state

### Rollback Process
```bash
# Interactive rollback with confirmation
./rollback-portability.sh

# Rollback creates backup at:
# .ces-backups/pre-portable-YYYYMMDD-HHMMSS/
```

### Post-Rollback
After rollback:
1. Reinstall dependencies: `npm install`
2. Rebuild TypeScript: `npm run build`
3. Verify functionality: `npm test`

## 📚 Advanced Usage

### Custom Installation Paths

Override detection for special cases:

```bash
# Custom CES location
export CES_ROOT="/custom/ces/path"
export PROJECT_ROOT="/custom/project/path"
./init.sh
```

### Multiple CES Instances

Run multiple CES instances in different projects:

```bash
# Project A
cd /path/to/project-a/ces
npm run dev -- start-session --session-id="project-a"

# Project B  
cd /path/to/project-b/ces
npm run dev -- start-session --session-id="project-b"
```

### CI/CD Integration

Use CES in automated pipelines:

```bash
# GitHub Actions example
- name: Setup CES
  run: |
    git clone <repo> ces
    cd ces
    ./init.sh
    npm run dev -- validate

- name: Run CES operations
  run: |
    cd ces
    npm run dev -- start-session
    # Your CI operations
    npm run dev -- close-session
```

## 🔒 Security

### Isolation Guarantees

Subdirectory installation provides:
- ✅ Complete file isolation in `ces/` directory
- ✅ No modification of host project files
- ✅ Separate dependency management
- ✅ Independent configuration

### Path Validation

CES validates all detected paths:
- Ensures CES directory contains required files
- Validates project directory structure
- Prevents path traversal issues
- Confirms proper permissions

## 📞 Support

### Community Support
- **Issues**: [GitHub Issues](https://github.com/anthropics/claude-ecosystem-standard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anthropics/claude-ecosystem-standard/discussions)

### Enterprise Support
- **Email**: enterprise@anthropic.com
- **Documentation**: `.docs/` directory
- **Professional Services**: Available for Fortune 500 implementations

### Troubleshooting Resources
- **Validation**: `npm run dev -- validate --verbose`
- **Test Suite**: `./test-portability-simple.sh`
- **Logs**: `.ces-logs/` directory
- **Configuration**: `.env` file inspection

## 🎉 Benefits Summary

### For Developers
- ✅ **Zero Host Project Impact**: No modification of existing files
- ✅ **Easy Integration**: Drop-in installation in any project
- ✅ **Cross-Platform**: Works on Windows, Linux, macOS
- ✅ **Auto-Configuration**: Intelligent path detection and setup

### For Teams  
- ✅ **Standardized Setup**: Consistent CES installation across team
- ✅ **Isolated Environment**: CES operations don't affect host project
- ✅ **Easy Onboarding**: New team members get instant CES access
- ✅ **Flexible Deployment**: Works in any project structure

### For Organizations
- ✅ **Enterprise Ready**: Fortune 500 grade portability and reliability
- ✅ **CI/CD Compatible**: Seamless integration with automated pipelines
- ✅ **Multi-Project Support**: Use CES across multiple projects simultaneously
- ✅ **Risk Mitigation**: Complete rollback system with safety guarantees

---

**🚀 CES v2.7.0 Portable Edition - Ready for Enterprise Drop-in Deployment!**