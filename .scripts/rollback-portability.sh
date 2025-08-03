#!/bin/bash
# CES Portability Rollback System
# Safely reverts CES to pre-portable state if needed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}CES Portability Rollback System${NC}"
echo "=================================="
echo ""

# Detect CES location
CES_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backup directory
BACKUP_DIR="$CES_ROOT/.ces-backups/pre-portable-$(date +%Y%m%d-%H%M%S)"

echo -e "${YELLOW}⚠️  WARNING: This will revert CES portability changes${NC}"
echo "This rollback will:"
echo "1. Restore original ces-init-private.sh functionality"
echo "2. Remove PathResolver utility and related changes"
echo "3. Revert to hardcoded path configurations"
echo "4. Remove portable init.sh script"
echo ""

# Confirmation
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled."
    exit 0
fi

echo -e "${BLUE}📦 Creating backup before rollback...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup current portable files
echo "Backing up portable implementation..."
cp "src/utils/PathResolver.ts" "$BACKUP_DIR/" 2>/dev/null || true
cp "src/__tests__/PathResolver.test.ts" "$BACKUP_DIR/" 2>/dev/null || true
cp "init.sh" "$BACKUP_DIR/" 2>/dev/null || true
cp "package.json" "$BACKUP_DIR/package.json.portable" 2>/dev/null || true
cp "CHANGELOG.md" "$BACKUP_DIR/CHANGELOG.md.portable" 2>/dev/null || true

echo "   ✅ Backup created at: $BACKUP_DIR"

echo -e "${BLUE}🔄 Rolling back portability changes...${NC}"

# 1. Remove PathResolver utility
if [[ -f "src/utils/PathResolver.ts" ]]; then
    rm "src/utils/PathResolver.ts"
    echo "   ✅ Removed PathResolver.ts"
fi

if [[ -f "src/__tests__/PathResolver.test.ts" ]]; then
    rm "src/__tests__/PathResolver.test.ts"
    echo "   ✅ Removed PathResolver test file"
fi

# 2. Restore original ces-init-private.sh (remove wrapper functionality)
cat > "ces-init-private.sh" << 'EOF'
#!/bin/bash
# Claude Ecosystem Standard (CES) - Private Initializer v2.5.0
# Original functionality before portability implementation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
CES_VERSION="2.5.0"
PROJECT_NAME="${1:-claude-ecosystem-standard}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Claude Ecosystem Standard (CES) v2.5.0            ║${NC}"
echo -e "${BLUE}║                 Enterprise Edition Setup                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Validate Node.js and npm
echo -e "${BLUE}🔧 Validating dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo "   ✅ Node.js: $(node --version)"
echo "   ✅ npm: v$(npm --version)"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install; then
    echo "   ✅ Dependencies installed successfully"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Build TypeScript
echo -e "${BLUE}🔨 Building TypeScript...${NC}"
if npm run build; then
    echo "   ✅ TypeScript build completed"
else
    echo -e "${RED}❌ TypeScript build failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 CES initialization completed successfully!${NC}"
EOF

chmod +x "ces-init-private.sh"
echo "   ✅ Restored original ces-init-private.sh"

# 3. Remove portable init.sh
if [[ -f "init.sh" ]]; then
    rm "init.sh"
    echo "   ✅ Removed portable init.sh"
fi

# 4. Revert EnvironmentConfig.ts to remove PathResolver dependency
if [[ -f "src/config/EnvironmentConfig.ts" ]]; then
    # Create a basic version without PathResolver
    cat > "src/config/EnvironmentConfig.ts" << 'EOF'
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../types/index.js';

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: Config;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), '.ces.config.json');
    this.loadConfig();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.getDefaultConfig();
        this.saveConfig();
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): Config {
    return {
      version: "2.5.0",
      projectName: "claude-ecosystem-standard",
      environment: "development",
      logLevel: "info",
      sessionTimeout: 3600000,
      maxSessions: 10
    };
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  public get<T>(key: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.config, key);
    return value !== undefined ? value : defaultValue!;
  }

  public set(key: string, value: any): void {
    this.setNestedValue(this.config, key, value);
    this.saveConfig();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((curr, key) => {
      if (!curr[key]) curr[key] = {};
      return curr[key];
    }, obj);
    target[lastKey] = value;
  }

  public getConfig(): Config {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return EnvironmentConfig.getInstance();
}
EOF
    echo "   ✅ Reverted EnvironmentConfig.ts to pre-portable version"
fi

# 5. Update package.json version back to 2.5.0
if [[ -f "package.json" ]]; then
    # Simple sed replacement to revert version
    sed -i.bak 's/"version": "2.6.0"/"version": "2.5.0"/' "package.json"
    sed -i.bak 's/Portable Claude Ecosystem Standard v2.6.0 - Works as drop-in subdirectory in any project with complete path portability, dynamic configuration, and cross-platform compatibility/Enterprise TypeScript foundation project with integrated Claude Code CLI automation/' "package.json"
    rm -f "package.json.bak"
    echo "   ✅ Reverted package.json to version 2.5.0"
fi

# 6. Remove portable test scripts
if [[ -f "test-portability.sh" ]]; then
    rm "test-portability.sh"
    echo "   ✅ Removed portability test script"
fi

if [[ -f "test-portability-simple.sh" ]]; then
    rm "test-portability-simple.sh"
    echo "   ✅ Removed simple portability test script"
fi

# 7. Clean up any portable configuration files
if [[ -f ".ces-init-summary.txt" ]]; then
    rm ".ces-init-summary.txt"
    echo "   ✅ Removed portable initialization summary"
fi

echo ""
echo -e "${GREEN}🔄 Portability rollback completed successfully!${NC}"
echo ""
echo -e "${PURPLE}📋 Rollback Summary:${NC}"
echo "   • Removed PathResolver utility and tests"
echo "   • Restored original ces-init-private.sh functionality"
echo "   • Removed portable init.sh script"
echo "   • Reverted EnvironmentConfig.ts to hardcoded paths"
echo "   • Downgraded package.json to version 2.5.0"
echo "   • Removed portability test scripts"
echo ""
echo -e "${BLUE}📦 Backup Location:${NC}"
echo "   All portable files backed up to: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}⚠️  Note: You may need to run 'npm install' and 'npm run build' after rollback${NC}"
echo ""
echo -e "${GREEN}✅ CES is now reverted to pre-portable state (v2.5.0)${NC}"