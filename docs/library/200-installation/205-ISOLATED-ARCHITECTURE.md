# Isolated Architecture Setup

> **Status**: ✅ COMPLETED  
> **Priority**: High  
> **Created**: 2025-08-04  
> **Version**: CES v2.7.0  
> **Series**: 200-installation

## 📖 Overview

The CES Isolated Architecture allows you to install Claude Ecosystem Standard as a clean, self-contained subdirectory within your existing projects. This approach provides complete CES functionality while maintaining clear separation from your main project code.

## 🎯 What is Isolated Architecture?

Isolated Architecture is one of three installation modes supported by CES:

1. **🔗 Integrated Mode**: CES installed directly in project root (mixed with your code)
2. **📦 Isolated Mode**: CES installed in `ces/` subdirectory (recommended)
3. **🌐 Global Mode**: CES installed globally via npm

The isolated approach offers the best of both worlds: full CES capabilities with zero interference to your existing project structure.

---

## 🏗️ Installation Modes Overview

### Mode Detection Priority

CES automatically detects installations with the following priority:

| Priority | Mode | Location | Detection Markers |
|----------|------|----------|------------------|
| 1 | **Integrated** | Project root | `package.json` with `"claude-ecosystem-standard"` + `src/cli/CLIManager.ts` |
| 2 | **Isolated** | `ces/` subdirectory | `ces/package.json` + `ces/src/cli/CLIManager.ts` |
| 3 | **Global** | npm global | `npm root -g/claude-ecosystem-standard` |

### Automatic Mode Detection

The startup hook (`startup-hook.cjs`) performs intelligent detection:

```javascript
// Detection logic from startup-hook.cjs
function detectCESInstallation(projectRoot) {
    const installations = [];
    
    // 1. Check for integrated installation
    const integratedMarkers = [
        path.join(projectRoot, 'package.json'),
        path.join(projectRoot, 'src', 'cli', 'CLIManager.ts'),
        path.join(projectRoot, 'CLAUDE.md')
    ];
    
    // 2. Check for isolated installation (ces/ subdirectory)
    const isolatedPath = path.join(projectRoot, 'ces');
    const isolatedMarkers = [
        path.join(isolatedPath, 'package.json'),
        path.join(isolatedPath, 'src', 'cli', 'CLIManager.ts'),
        path.join(isolatedPath, 'CLAUDE.md')
    ];
    
    // 3. Check for global installation
    // ... returns prioritized installation list
}
```

---

## 📦 Isolated Installation Steps

### Step 1: Create CES Subdirectory

```bash
# Navigate to your project root
cd /path/to/your-project

# Create ces subdirectory
mkdir ces
cd ces
```

### Step 2: Install CES

Choose one of these installation methods:

#### Option A: NPM Package Installation
```bash
# Install CES package
npm init -y
npm install claude-ecosystem-standard

# Build the project
npm run build
```

#### Option B: Repository Clone Installation
```bash
# Clone CES repository
git clone https://github.com/your-org/claude-ecosystem-standard.git .

# Install dependencies and build
npm install
npm run build
```

#### Option C: Global to Local Installation
```bash
# If you have CES globally installed
npm pack claude-ecosystem-standard
tar -xzf claude-ecosystem-standard-*.tgz
mv package/* .
rm -rf package claude-ecosystem-standard-*.tgz

npm install
npm run build
```

### Step 3: Environment Configuration

```bash
# Copy environment template to PROJECT ROOT (not ces/)
cp ces/.env.template .env

# Edit environment variables
nano .env
```

**Important**: The `.env` file should be in your project root, not in the `ces/` subdirectory!

### Step 4: Verify Installation

```bash
# From ces/ directory
npm run dev -- validate --verbose

# Expected output:
# ✅ CES Environment Configuration v2.7.0 loaded successfully
#    🏠 Project Root: /path/to/your-project
#    ⚙️  Operation Mode: isolated
#    🌍 Environment: development
#    🎯 Instance ID: abc12345...
```

---

## 🔗 Symlink Strategy

### Automatic .claude Directory Sharing

CES automatically creates symlinks to share the `.claude` configuration between your project and the isolated CES installation:

```typescript
// From PathResolver.ts - Symlink creation logic
export function createClaudeSymlink(): boolean {
    const cesRoot = getCesRoot();        // /your-project/ces
    const projectRoot = getProjectRoot(); // /your-project
    
    // Only create symlink if CES is in isolated mode
    if (cesRoot === projectRoot) {
        return true; // No symlink needed in integrated mode
    }
    
    const cesClaudeDir = path.join(cesRoot, '.claude');
    const projectClaudeDir = path.join(projectRoot, '.claude');
    
    // Create symlink from CES to project .claude directory
    if (fs.existsSync(projectClaudeDir)) {
        fs.symlinkSync(path.relative(cesRoot, projectClaudeDir), cesClaudeDir, 'dir');
        return true;
    }
    
    return false;
}
```

### Directory Structure After Installation

```
your-project/
├── .claude/                    # ← Claude configuration (shared)
│   ├── claude_desktop_config.json
│   ├── startup-hook.cjs
│   ├── ecosystem.json
│   └── agents/
├── .env                        # ← Environment config (project-level)
├── ces/                        # ← CES isolated installation
│   ├── .claude -> ../.claude   # ← Symlink to project .claude
│   ├── .src/
│   │   ├── cli/
│   │   ├── config/
│   │   └── session/
│   ├── package.json
│   ├── CLAUDE.md
│   └── node_modules/
├── src/                        # ← Your project source code
├── package.json                # ← Your project's package.json
└── README.md                   # ← Your project's documentation
```

---

## 🔧 Configuration Management

### Environment Variable Handling

Environment variables are loaded with specific priority for isolated installations:

```typescript
// From EnvironmentConfig.ts - Environment loading
const envPaths = [
    path.join(PROJECT_ROOT, '.env.local'),  // Highest priority
    path.join(PROJECT_ROOT, '.env'),        // Standard config
    path.join(PROJECT_ROOT, '.env.template') // Fallback template
];

// Load .env files with priority (first found wins)
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        config({ path: envPath });
        console.log(`✅ Loaded environment from: ${envPath}`);
        break;
    }
}
```

### Operation Mode Detection

```typescript
// From EnvironmentConfig.ts - Mode detection
function detectOperationMode(): 'integrated' | 'isolated' | 'global' | 'unknown' {
    const projectRoot = getProjectRoot();
    
    // Check if we're in the project root (integrated mode)
    if (fs.existsSync(path.join(projectRoot, 'src', 'cli', 'CLIManager.ts'))) {
        return 'integrated';
    }
    
    // Check if we're in a ces/ subdirectory (isolated mode)
    const parentDir = path.dirname(projectRoot);
    if (path.basename(projectRoot) === 'ces' && 
        fs.existsSync(path.join(projectRoot, 'src', 'cli', 'CLIManager.ts'))) {
        return 'isolated';
    }
    
    // Check for global installation
    if (process.env.CES_OPERATION_MODE === 'global') {
        return 'global';
    }
    
    return 'unknown';
}
```

### Path Resolution in Isolated Mode

CES uses intelligent path resolution to handle isolated installations:

```typescript
// From PathResolver.ts - CES root detection
export function getCesRoot(): string {
    const projectRoot = getProjectRoot();
    
    // Check if we're in integrated mode
    if (isCESProject(projectRoot)) {
        return projectRoot;
    }
    
    // Check for isolated installation (ces/ subdirectory)
    const isolatedPath = path.join(projectRoot, 'ces');
    if (fs.existsSync(isolatedPath) && isCESProject(isolatedPath)) {
        return path.resolve(isolatedPath);
    }
    
    // Check parent directory (in case we're inside ces/)
    const parentDir = path.dirname(projectRoot);
    const parentCesPath = path.join(parentDir, 'ces');
    if (fs.existsSync(parentCesPath) && isCESProject(parentCesPath)) {
        return path.resolve(parentCesPath);
    }
    
    return projectRoot; // Fallback
}
```

---

## 🚀 Session Management

### Session Data in Isolated Mode

Sessions automatically track the operation mode and paths:

```typescript
interface SessionData {
    id: string;
    name: string;
    projectRoot: string;          // /your-project
    cesRoot: string;              // /your-project/ces
    operationMode: 'isolated';    // Detected automatically
    startTime: string;
    metadata: {
        pathInfo: {
            projectRoot: string;
            cesRoot: string;
            claudeDir: string;
            operationMode: 'isolated';
            isSymlinked: boolean;
        };
    };
}
```

### Starting Sessions in Isolated Mode

```bash
# From your project root or ces/ directory
cd ces
npm run dev -- start-session

# Output shows isolated mode detection:
# 🚀 Session started: CES-Session-20250804T120000 (abc12345)
#    📍 Project Root: /your-project
#    🏗️  CES Root: /your-project/ces
#    ⚙️  Operation Mode: isolated
#    🔗 Symlinked: Yes
```

---

## ✅ Best Practices

### 1. Directory Organization

```bash
# ✅ Recommended structure
your-project/
├── .claude/          # Shared Claude config
├── .env              # Project-level environment
├── ces/              # CES installation
├── src/              # Your code
└── package.json      # Your package.json

# ❌ Avoid this structure
your-project/
├── ces/
│   ├── .env          # ❌ Don't put .env here
│   └── .claude/      # ❌ Don't create separate .claude
```

### 2. Environment Configuration

```bash
# ✅ Correct environment setup
cp ces/.env.template .env    # Copy to project root
nano .env                    # Edit project-level config

# ❌ Incorrect environment setup
cp ces/.env.template ces/.env    # ❌ Don't put in ces/
```

### 3. Session Management

```bash
# ✅ Start sessions from CES directory
cd ces
npm run dev -- start-session

# ✅ Or use absolute paths
/your-project/ces/npm run dev -- start-session

# ⚠️ Starting from project root requires explicit path
cd /your-project
ces/npm run dev -- start-session    # Works but less convenient
```

### 4. Development Workflow

```bash
# ✅ Recommended development workflow
cd your-project

# 1. Work on your project code
code src/

# 2. Switch to CES for Claude operations
cd ces
npm run dev -- start-session

# 3. Use CES commands
npm run dev -- ai ask "Help with my React component"
npm run dev -- analytics dashboard

# 4. Close CES session when done
npm run dev -- close-session
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "CES installation not detected"

**Symptoms:**
```
⚠️  No CES installations found - skipping session startup
```

**Causes & Solutions:**
```bash
# Check if CES is properly installed in ces/
ls -la ces/package.json ces/src/cli/CLIManager.ts

# Verify package.json content
cat ces/package.json | grep "claude-ecosystem-standard"

# Rebuild if necessary
cd ces && npm run build
```

#### Issue: "Symlink creation failed"

**Symptoms:**
```
Warning: Project .claude directory not found at /your-project/.claude
```

**Solutions:**
```bash
# Create .claude directory in project root
mkdir -p .claude

# Copy from CES installation
cp -r ces/.claude/* .claude/

# Verify symlink creation
ls -la ces/.claude    # Should show: .claude -> ../.claude
```

#### Issue: "Environment configuration not loaded"

**Symptoms:**
```
Warning: AI features enabled but ANTHROPIC_API_KEY not set
```

**Solutions:**
```bash
# Ensure .env is in project root, not ces/
ls -la .env           # Should exist in project root
ls -la ces/.env       # Should NOT exist

# Move .env to correct location if needed
mv ces/.env .env
```

#### Issue: "Path resolution errors"

**Symptoms:**
```
Error: Could not detect CES project root
```

**Solutions:**
```bash
# Use path validation utility
cd ces
npm run dev -- validate --verbose

# Check project markers exist
ls -la ../package.json ../tsconfig.json ../.git

# Clear path cache if needed
npm run dev -- system --clear-cache
```

### Diagnostic Commands

```bash
# Check installation status
cd ces
npm run dev -- status

# Validate paths and configuration
npm run dev -- validate --verbose

# Show detailed path information
npm run dev -- system --path-info

# Test symlink functionality
npm run dev -- system --test-symlinks
```

### Path Validation

```typescript
// Use built-in path validation
import { validatePaths } from './utils/PathResolver.js';

const validation = validatePaths();
if (!validation.isValid) {
    console.error('Path validation errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
}

// Get comprehensive path information  
import { getPathInfo } from './utils/PathResolver.js';
const pathInfo = getPathInfo();
console.log('Path Information:', pathInfo);
```

---

## 🔄 Migration Strategies

### From Integrated to Isolated

```bash
# 1. Create ces/ subdirectory
mkdir ces

# 2. Move CES files to ces/
mv src/cli src/config src/session src/utils ces/src/
mv .claude ces/
mv package.json ces/package.json.backup
mv CLAUDE.md ces/

# 3. Restore your original project files
git checkout HEAD -- package.json src/

# 4. Create symlink for .claude
ln -sf ../ces/.claude .claude

# 5. Move environment config to project root
mv ces/.env .env

# 6. Verify installation
cd ces && npm run dev -- validate
```

### From Global to Isolated

```bash
# 1. Create and setup ces/ directory
mkdir ces && cd ces

# 2. Copy global installation
npm pack claude-ecosystem-standard
tar -xzf claude-ecosystem-standard-*.tgz
mv package/* .
rm -rf package *.tgz

# 3. Install dependencies
npm install && npm run build

# 4. Setup project-level configuration
cp .env.template ../.env

# 5. Verify installation
npm run dev -- validate --verbose
```

---

## 🔗 Related Documentation

- [200-SYSTEM-REQUIREMENTS.md](200-SYSTEM-REQUIREMENTS.md) - System requirements for CES
- [201-NODEJS-SETUP.md](201-NODEJS-SETUP.md) - Node.js setup and configuration
- [102-KEY-CONCEPTS.md](../100-introduction/102-KEY-CONCEPTS.md) - Understanding CES concepts
- [300-CONFIGURATION-OVERVIEW.md](../300-configuration/300-CONFIGURATION-OVERVIEW.md) - Configuration management
- [400-CLI-REFERENCE-COMPLETE.md](../400-operations/400-CLI-REFERENCE-COMPLETE.md) - CLI commands reference

---

**✅ Document completed through systematic extraction from CES v2.7.0 source code, startup hooks, path resolution utilities, and configuration management systems.**
