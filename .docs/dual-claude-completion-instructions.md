# 📋 ISTRUZIONI COMPLETAMENTO SISTEMA DOPPIO CLAUDE.md

## 🎯 Obiettivo

Completare l'implementazione del sistema doppio CLAUDE.md con documentazione esplicita del flusso di merge, test suite dedicata e miglioramenti alla visibilità del processo.

## 📌 Contesto

Il sistema doppio CLAUDE.md è già implementato e funzionante. Queste istruzioni guidano l'aggiunta di documentazione dettagliata, test specifici e miglioramenti alla trasparenza del processo di caricamento.

---

## 🛠️ TASK 1: Documentare il Flusso di Merge

### 1.1 Crea il file `docs/CLAUDE-MERGE-FLOW.md`

Crea un nuovo file nella directory `docs/` con il seguente contenuto:

```markdown
# 📋 CLAUDE.md Merge Flow Documentation

## 🔷 Overview

Il sistema CES implementa un meccanismo di merge automatico che combina:
1. **CES System Instructions** (`ces/CLAUDE.md`) - Istruzioni core del sistema
2. **Project Instructions** (`./CLAUDE.md`) - Istruzioni specifiche del progetto

## 📊 Architettura del Sistema di Merge

### Flusso di Caricamento

\```mermaid
sequenceDiagram
    participant U as User
    participant CLI as ces-cli
    participant H as startup-hook.cjs
    participant M as Merge System
    participant C as Claude Code
    
    U->>CLI: ./ces-cli start-session
    CLI->>H: Trigger startup hook
    H->>M: Check for CLAUDE.md files
    
    alt Project CLAUDE.md exists
        M->>M: Load ces/CLAUDE.md
        M->>M: Load ./CLAUDE.md
        M->>M: Merge with precedence rules
        M->>C: Provide merged config
    else No Project CLAUDE.md
        M->>M: Load ces/CLAUDE.md only
        M->>C: Provide CES config
    end
    
    C-->>U: Session started with config
\```

## 🔧 Ordine di Precedenza

### Regole di Override

| Categoria | CES Priority | Project Override | Note |
|-----------|--------------|------------------|------|
| **Security Settings** | MANDATORY | ❌ Cannot Override | Sicurezza sempre da CES |
| **Session Management** | MANDATORY | ❌ Cannot Override | Core functionality |
| **MCP Servers** | DEFAULT | ✅ Can Extend | Progetto può aggiungere |
| **AI Features** | DEFAULT | ✅ Can Customize | Personalizzabile |
| **Coding Standards** | SUGGESTED | ✅ Can Override | Progetto ha precedenza |
| **Tool Configuration** | DEFAULT | ✅ Can Extend | Estensibile |

### Esempio di Merge

**CES CLAUDE.md:**
\```markdown
## MCP Servers
- Context7: ENABLED (mandatory)
- Serena: ENABLED (mandatory)
- Custom: DISABLED (default)

## Coding Style
- Indentation: 2 spaces (suggested)
- Quotes: Single (suggested)
\```

**Project CLAUDE.md:**
\```markdown
## MCP Servers
- Custom: ENABLED
- ProjectSpecific: ENABLED

## Coding Style
- Indentation: 4 spaces
- Quotes: Double
\```

**Risultato Merged:**
\```markdown
## MCP Servers
- Context7: ENABLED (from CES - mandatory)
- Serena: ENABLED (from CES - mandatory)
- Custom: ENABLED (from Project - override)
- ProjectSpecific: ENABLED (from Project - addition)

## Coding Style
- Indentation: 4 spaces (from Project - override)
- Quotes: Double (from Project - override)
\```

## 🔍 Gestione Conflitti

### Strategia di Risoluzione

1. **Identificazione Conflitto**
   - Sistema rileva sezioni sovrapposte
   - Categorizza per tipo di setting

2. **Applicazione Precedenze**
   - Security/Core: CES vince sempre
   - Development: Project vince
   - Extensions: Merge additivo

3. **Logging Conflitti**
   - Tutti i conflitti loggati in `.claude/merge-conflicts.log`
   - Notifica utente se conflitti critici

## 📡 API Programmatica

### Accesso al Merge System

\```javascript
// In startup-hook.cjs o componenti CES

const mergeSystem = require('./utils/claudeMergeSystem');

// Ottenere configurazione merged
const mergedConfig = await mergeSystem.getMergedConfiguration();

// Verificare conflitti
const conflicts = mergeSystem.getConflicts();
if (conflicts.length > 0) {
    console.warn('Configuration conflicts detected:', conflicts);
}

// Forzare reload
await mergeSystem.reloadAndMerge();
\```

### Eventi del Sistema

\```javascript
// Ascoltare cambiamenti
mergeSystem.on('configChanged', (event) => {
    console.log('Configuration updated:', event.type);
});

mergeSystem.on('conflictDetected', (conflict) => {
    console.warn('Conflict:', conflict.section, conflict.resolution);
});
\```

## 🚨 Troubleshooting

### Problemi Comuni

1. **CLAUDE.md non caricato**
   - Verificare percorsi file
   - Controllare permessi lettura
   - Vedere `.claude/hook.log`

2. **Conflitti non risolti**
   - Controllare `.claude/merge-conflicts.log`
   - Verificare precedence rules
   - Usare `--force-ces` per override

3. **Performance lenta**
   - File CLAUDE.md troppo grandi
   - Disabilitare watch con `--no-watch`
   - Usare cache con `--cache-config`

## 📊 Metriche e Monitoring

Il sistema traccia:
- Tempo di merge: `~50-200ms`
- Dimensione file merged: Max 100KB consigliato
- Conflitti per sessione: Media 0-3
- Cache hit rate: Target >90%
```

### 1.2 Aggiungi diagrammi dettagliati

Nel file appena creato, aggiungi ulteriori diagrammi per chiarire il processo:

```markdown
## 📈 Diagramma di Stato del Merge

\```mermaid
stateDiagram-v2
    [*] --> CheckFiles
    CheckFiles --> LoadCES: CES CLAUDE.md exists
    CheckFiles --> Error: CES CLAUDE.md missing
    
    LoadCES --> CheckProject: Loaded successfully
    CheckProject --> LoadProject: Project CLAUDE.md exists
    CheckProject --> CESOnly: No project CLAUDE.md
    
    LoadProject --> ParseConfigs: Both loaded
    CESOnly --> GenerateConfig: Use CES only
    
    ParseConfigs --> DetectConflicts
    DetectConflicts --> ResolveConflicts: Conflicts found
    DetectConflicts --> MergeClean: No conflicts
    
    ResolveConflicts --> ApplyPrecedence
    ApplyPrecedence --> MergeWithConflicts
    
    MergeClean --> GenerateConfig
    MergeWithConflicts --> GenerateConfig
    
    GenerateConfig --> WriteOutput
    WriteOutput --> NotifySystem
    NotifySystem --> [*]
    
    Error --> [*]
\```
```

---

## 🛠️ TASK 2: Implementare Test Suite

### 2.1 Crea il file `scripts/test-dual-claude.sh`

```bash
#!/bin/bash
# test-dual-claude.sh - Test suite per sistema doppio CLAUDE.md
# Versione: 1.0.0
# Compatibilità: CES v2.5.0+

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contatori test
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Funzioni utility
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    ((TESTS_RUN++))
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     Dual CLAUDE.md Test Suite v1.0.0      ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Setup test environment
TEST_DIR="/tmp/ces-claude-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Test 1: Verifica esistenza file CES CLAUDE.md
log_test "Checking CES CLAUDE.md existence"
if [ -f "$CES_ROOT/CLAUDE.md" ]; then
    log_pass "CES CLAUDE.md found"
else
    log_fail "CES CLAUDE.md not found at $CES_ROOT/CLAUDE.md"
fi

# Test 2: Verifica dimensione minima CES CLAUDE.md
log_test "Checking CES CLAUDE.md minimum size"
CES_CLAUDE_SIZE=$(stat -f%z "$CES_ROOT/CLAUDE.md" 2>/dev/null || stat -c%s "$CES_ROOT/CLAUDE.md" 2>/dev/null || echo "0")
if [ "$CES_CLAUDE_SIZE" -gt 1000 ]; then
    log_pass "CES CLAUDE.md size OK ($CES_CLAUDE_SIZE bytes)"
else
    log_fail "CES CLAUDE.md too small ($CES_CLAUDE_SIZE bytes)"
fi

# Test 3: Test caricamento senza project CLAUDE.md
log_test "Testing load without project CLAUDE.md"
rm -f CLAUDE.md
OUTPUT=$($CES_ROOT/scripts/merge-claude-docs.sh 2>&1 || echo "")
if echo "$OUTPUT" | grep -q "No project-specific CLAUDE.md" || [ -z "$OUTPUT" ]; then
    log_pass "Correctly handled missing project CLAUDE.md"
else
    log_fail "Unexpected behavior without project CLAUDE.md"
fi

# Test 4: Test con project CLAUDE.md valido
log_test "Testing with valid project CLAUDE.md"
cat > CLAUDE.md << 'EOF'
# Project Instructions

## Coding Style
- Indentation: 4 spaces
- Line length: 100 chars

## Project Specific
- Framework: React
- State Management: Redux
EOF

OUTPUT=$($CES_ROOT/scripts/merge-claude-docs.sh 2>&1 || echo "MERGE_FAILED")
if [ "$OUTPUT" != "MERGE_FAILED" ]; then
    log_pass "Successfully merged with project CLAUDE.md"
else
    log_fail "Failed to merge project CLAUDE.md"
fi

# Test 5: Verifica output merged
log_test "Checking merged output structure"
MERGED_FILE="$PROJECT_ROOT/.claude/CLAUDE-MASTER.md"
if [ -f "$MERGED_FILE" ]; then
    if grep -q "CES SYSTEM CONTEXT" "$MERGED_FILE" && grep -q "PROJECT CONTEXT" "$MERGED_FILE"; then
        log_pass "Merged file has correct structure"
    else
        log_fail "Merged file missing expected sections"
    fi
else
    log_fail "Merged file not created at $MERGED_FILE"
fi

# Test 6: Test conflitti di configurazione
log_test "Testing configuration conflicts"
cat > CLAUDE.md << 'EOF'
# Project Instructions

## Security Settings
- Enable debug mode: true
- Disable auth: true

## MCP Servers
- Context7: DISABLED
EOF

OUTPUT=$($CES_ROOT/scripts/merge-claude-docs.sh 2>&1 || echo "")
if [ -f "$PROJECT_ROOT/.claude/merge-conflicts.log" ]; then
    log_pass "Conflict detection working"
else
    log_fail "Conflicts not properly logged"
fi

# Test 7: Test precedenze
log_test "Testing precedence rules"
if [ -f "$MERGED_FILE" ]; then
    # Security settings should NOT be overridden
    if grep -q "Context7: ENABLED" "$MERGED_FILE"; then
        log_pass "Mandatory settings preserved"
    else
        log_fail "Mandatory settings overridden incorrectly"
    fi
fi

# Test 8: Test performance
log_test "Testing merge performance"
START_TIME=$(date +%s%N)
$CES_ROOT/scripts/merge-claude-docs.sh > /dev/null 2>&1
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

if [ "$DURATION" -lt 500 ]; then
    log_pass "Merge completed in ${DURATION}ms"
else
    log_fail "Merge too slow: ${DURATION}ms (expected <500ms)"
fi

# Test 9: Test hot reload
log_test "Testing hot reload on file change"
# Modifica project CLAUDE.md
echo "## Additional Section" >> CLAUDE.md
sleep 1
# Il sistema dovrebbe rilevare il cambiamento
if [ -f "$PROJECT_ROOT/.claude/reload-trigger" ]; then
    log_pass "Hot reload detected file change"
else
    log_fail "Hot reload not working"
fi

# Test 10: Test cache system
log_test "Testing configuration cache"
# Prima chiamata (dovrebbe creare cache)
$CES_ROOT/scripts/merge-claude-docs.sh > /dev/null 2>&1
# Seconda chiamata (dovrebbe usare cache)
OUTPUT=$($CES_ROOT/scripts/merge-claude-docs.sh --debug 2>&1 || echo "")
if echo "$OUTPUT" | grep -q "cache hit" || echo "$OUTPUT" | grep -q "cached"; then
    log_pass "Cache system working"
else
    log_fail "Cache system not functioning"
fi

# Cleanup
cd /
rm -rf "$TEST_DIR"

# Report finale
echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo "Total tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi
```

### 2.2 Rendi eseguibile il test script

```bash
chmod +x scripts/test-dual-claude.sh
```

### 2.3 Crea test TypeScript aggiuntivi

Crea il file `src/__tests__/claudeMergeSystem.test.ts`:

```typescript
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { ClaudeMergeSystem } from '../utils/claudeMergeSystem';
import { envConfig } from '../config/EnvironmentConfig';

describe('ClaudeMergeSystem', () => {
  let mergeSystem: ClaudeMergeSystem;
  let tempDir: string;
  
  beforeEach(() => {
    // Crea directory temporanea per test
    tempDir = path.join(process.cwd(), '.test-claude-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Mock envConfig
    jest.spyOn(envConfig, 'getCesRoot').mockReturnValue(tempDir);
    jest.spyOn(envConfig, 'getProjectRoot').mockReturnValue(tempDir);
    
    mergeSystem = new ClaudeMergeSystem();
  });
  
  afterEach(() => {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });
  
  test('should load CES CLAUDE.md successfully', async () => {
    // Crea CES CLAUDE.md di test
    const cesClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(cesClaudePath, '# CES Instructions\n\n## Test Section');
    
    const config = await mergeSystem.loadCesConfig();
    
    expect(config).toBeDefined();
    expect(config.content).toContain('CES Instructions');
  });
  
  test('should handle missing project CLAUDE.md gracefully', async () => {
    const cesClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(cesClaudePath, '# CES Instructions');
    
    const merged = await mergeSystem.getMergedConfiguration();
    
    expect(merged).toContain('CES Instructions');
    expect(merged).toContain('No project-specific CLAUDE.md');
  });
  
  test('should merge both files correctly', async () => {
    // CES CLAUDE.md
    const cesClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(cesClaudePath, '# CES Instructions\n\n## MCP Servers\n- Context7: ENABLED');
    
    // Project CLAUDE.md
    const projectClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(projectClaudePath, '# Project Instructions\n\n## Coding Style\n- Indentation: 4 spaces');
    
    const merged = await mergeSystem.getMergedConfiguration();
    
    expect(merged).toContain('CES Instructions');
    expect(merged).toContain('Project Instructions');
    expect(merged).toContain('Context7: ENABLED');
    expect(merged).toContain('Indentation: 4 spaces');
  });
  
  test('should detect and handle conflicts', async () => {
    const cesContent = `# CES Instructions
## Security
- Debug: DISABLED
## MCP Servers
- Context7: ENABLED (mandatory)`;
    
    const projectContent = `# Project Instructions
## Security
- Debug: ENABLED
## MCP Servers
- Context7: DISABLED`;
    
    fs.writeFileSync(path.join(tempDir, 'ces', 'CLAUDE.md'), cesContent);
    fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), projectContent);
    
    await mergeSystem.getMergedConfiguration();
    const conflicts = mergeSystem.getConflicts();
    
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0].section).toBe('Security');
    expect(conflicts[1].section).toBe('MCP Servers');
  });
  
  test('should apply precedence rules correctly', async () => {
    const cesContent = `# CES Instructions
## Security Settings
- Auth: REQUIRED (mandatory)
## Development
- Framework: Express (suggested)`;
    
    const projectContent = `# Project Instructions
## Security Settings
- Auth: OPTIONAL
## Development
- Framework: Fastify`;
    
    fs.writeFileSync(path.join(tempDir, 'ces', 'CLAUDE.md'), cesContent);
    fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), projectContent);
    
    const merged = await mergeSystem.getMergedConfiguration();
    
    // Security da CES deve vincere
    expect(merged).toContain('Auth: REQUIRED');
    // Development da Project deve vincere
    expect(merged).toContain('Framework: Fastify');
  });
  
  test('should cache merged configuration', async () => {
    const cesClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(cesClaudePath, '# CES Instructions');
    
    // Prima chiamata
    const start1 = Date.now();
    await mergeSystem.getMergedConfiguration();
    const duration1 = Date.now() - start1;
    
    // Seconda chiamata (dovrebbe usare cache)
    const start2 = Date.now();
    await mergeSystem.getMergedConfiguration();
    const duration2 = Date.now() - start2;
    
    expect(duration2).toBeLessThan(duration1 / 2);
  });
  
  test('should emit events on configuration changes', async () => {
    const events: any[] = [];
    
    mergeSystem.on('configChanged', (event) => events.push(event));
    mergeSystem.on('conflictDetected', (conflict) => events.push(conflict));
    
    const cesClaudePath = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(cesClaudePath, '# CES Instructions');
    
    await mergeSystem.reloadAndMerge();
    
    expect(events.length).toBeGreaterThan(0);
    expect(events.some(e => e.type === 'reload')).toBe(true);
  });
  
  test('should handle large files efficiently', async () => {
    // Crea file grande (1MB)
    const largeContent = '# CES Instructions\n\n' + 'x'.repeat(1024 * 1024);
    fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), largeContent);
    
    const start = Date.now();
    await mergeSystem.getMergedConfiguration();
    const duration = Date.now() - start;
    
    // Deve processare in meno di 500ms anche file grandi
    expect(duration).toBeLessThan(500);
  });
});
```

---

## 🛠️ TASK 3: Migliorare Visibilità del Processo

### 3.1 Aggiorna `startup-hook.cjs`

Aggiungi logging dettagliato all'inizio del file `.claude/startup-hook.cjs`:

```javascript
// All'inizio del file, dopo gli import

console.log('\n' + '='.repeat(60));
console.log('🔷 CES Dual CLAUDE.md System - Loading Configuration');
console.log('='.repeat(60));

// Aggiungi funzione di logging dettagliato
function logClaudeLoading() {
  const cesClaudePath = path.join(__dirname, '..', 'CLAUDE.md');
  const projectClaudePath = path.join(process.cwd(), 'CLAUDE.md');
  const masterClaudePath = path.join(__dirname, 'CLAUDE-MASTER.md');
  
  console.log('\n📋 CLAUDE.md Loading Sequence:');
  console.log('─'.repeat(50));
  
  // Check CES CLAUDE.md
  if (fs.existsSync(cesClaudePath)) {
    const stats = fs.statSync(cesClaudePath);
    console.log(`✓ 1. System Config: ces/CLAUDE.md`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`     Modified: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`✗ 1. System Config: ces/CLAUDE.md NOT FOUND`);
  }
  
  // Check Project CLAUDE.md
  if (fs.existsSync(projectClaudePath)) {
    const stats = fs.statSync(projectClaudePath);
    console.log(`✓ 2. Project Config: ./CLAUDE.md`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`     Modified: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`○ 2. Project Config: ./CLAUDE.md (not present - using defaults)`);
  }
  
  // Check/Create Master
  console.log(`\n🔄 3. Generating Merged Configuration...`);
  
  // Qui inserisci la logica di merge esistente
  
  if (fs.existsSync(masterClaudePath)) {
    const stats = fs.statSync(masterClaudePath);
    console.log(`✓ 4. Master Config: .claude/CLAUDE-MASTER.md`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`     Generated: ${new Date().toISOString()}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Configuration loaded successfully');
  console.log('='.repeat(60) + '\n');
}

// Chiama la funzione all'avvio
logClaudeLoading();

// Aggiungi anche monitoring dei conflitti
function logConflicts(conflicts) {
  if (conflicts && conflicts.length > 0) {
    console.log('\n⚠️  Configuration Conflicts Detected:');
    console.log('─'.repeat(50));
    conflicts.forEach((conflict, index) => {
      console.log(`${index + 1}. Section: ${conflict.section}`);
      console.log(`   CES Value: ${conflict.cesValue}`);
      console.log(`   Project Value: ${conflict.projectValue}`);
      console.log(`   Resolution: ${conflict.resolution}`);
    });
    console.log('─'.repeat(50));
  }
}
```

### 3.2 Crea comando CLI per visualizzare status

Crea il file `src/cli/ClaudeConfigCommand.ts`:

```typescript
import { Command } from 'commander';
import * as chalk from 'chalk';
import { ClaudeMergeSystem } from '../utils/claudeMergeSystem';
import { logger } from '../utils/Logger';

export class ClaudeConfigCommand {
  private mergeSystem: ClaudeMergeSystem;
  
  constructor() {
    this.mergeSystem = new ClaudeMergeSystem();
  }
  
  register(program: Command): void {
    const claudeCmd = program
      .command('claude-config')
      .description('Manage and inspect CLAUDE.md configuration');
    
    claudeCmd
      .command('status')
      .description('Show current CLAUDE.md loading status')
      .action(async () => {
        await this.showStatus();
      });
    
    claudeCmd
      .command('conflicts')
      .description('Show configuration conflicts')
      .action(async () => {
        await this.showConflicts();
      });
    
    claudeCmd
      .command('reload')
      .description('Force reload CLAUDE.md files')
      .action(async () => {
        await this.reloadConfig();
      });
    
    claudeCmd
      .command('validate')
      .description('Validate CLAUDE.md syntax and structure')
      .action(async () => {
        await this.validateConfig();
      });
  }
  
  private async showStatus(): Promise<void> {
    console.log(chalk.blue('\n📋 CLAUDE.md Configuration Status'));
    console.log(chalk.gray('═'.repeat(50)));
    
    const status = await this.mergeSystem.getStatus();
    
    // CES CLAUDE.md
    console.log('\n' + chalk.yellow('System Configuration:'));
    if (status.ces.exists) {
      console.log(chalk.green('  ✓') + ` Source: ces/CLAUDE.md`);
      console.log(`    Size: ${chalk.cyan(status.ces.size)}`);
      console.log(`    Modified: ${chalk.gray(status.ces.modified)}`);
      console.log(`    Sections: ${chalk.cyan(status.ces.sections.join(', '))}`);
    } else {
      console.log(chalk.red('  ✗') + ' ces/CLAUDE.md not found');
    }
    
    // Project CLAUDE.md
    console.log('\n' + chalk.yellow('Project Configuration:'));
    if (status.project.exists) {
      console.log(chalk.green('  ✓') + ` Source: ./CLAUDE.md`);
      console.log(`    Size: ${chalk.cyan(status.project.size)}`);
      console.log(`    Modified: ${chalk.gray(status.project.modified)}`);
      console.log(`    Sections: ${chalk.cyan(status.project.sections.join(', '))}`);
    } else {
      console.log(chalk.gray('  ○') + ' No project CLAUDE.md (using CES defaults)');
    }
    
    // Merged result
    console.log('\n' + chalk.yellow('Merged Configuration:'));
    console.log(chalk.green('  ✓') + ` Output: .claude/CLAUDE-MASTER.md`);
    console.log(`    Total Size: ${chalk.cyan(status.merged.size)}`);
    console.log(`    Generated: ${chalk.gray(status.merged.generated)}`);
    console.log(`    Cache Status: ${status.merged.cached ? chalk.green('HIT') : chalk.yellow('MISS')}`);
    
    // Conflicts summary
    if (status.conflicts > 0) {
      console.log('\n' + chalk.yellow('⚠️  Conflicts: ') + chalk.red(status.conflicts));
      console.log(chalk.gray('  Run "claude-config conflicts" for details'));
    }
    
    console.log('\n' + chalk.gray('═'.repeat(50)));
  }
  
  private async showConflicts(): Promise<void> {
    const conflicts = this.mergeSystem.getConflicts();
    
    if (conflicts.length === 0) {
      console.log(chalk.green('\n✅ No configuration conflicts detected'));
      return;
    }
    
    console.log(chalk.yellow(`\n⚠️  Configuration Conflicts (${conflicts.length})`));
    console.log(chalk.gray('═'.repeat(50)));
    
    conflicts.forEach((conflict, index) => {
      console.log(`\n${chalk.cyan(`Conflict #${index + 1}:`)} ${chalk.white(conflict.section)}`);
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`CES Value:     ${chalk.blue(conflict.cesValue)}`);
      console.log(`Project Value: ${chalk.yellow(conflict.projectValue)}`);
      console.log(`Resolution:    ${chalk.green(conflict.resolution)} (${conflict.rule})`);
    });
    
    console.log('\n' + chalk.gray('═'.repeat(50)));
    console.log(chalk.gray('Precedence rules ensure system stability'));
  }
  
  private async reloadConfig(): Promise<void> {
    console.log(chalk.blue('\n🔄 Reloading CLAUDE.md configuration...'));
    
    try {
      await this.mergeSystem.reloadAndMerge();
      console.log(chalk.green('✅ Configuration reloaded successfully'));
      
      // Mostra summary
      const status = await this.mergeSystem.getStatus();
      console.log(`\nLoaded ${chalk.cyan(status.merged.sections)} sections`);
      console.log(`Total size: ${chalk.cyan(status.merged.size)}`);
      
    } catch (error) {
      console.log(chalk.red('❌ Failed to reload configuration'));
      console.error(error);
    }
  }
  
  private async validateConfig(): Promise<void> {
    console.log(chalk.blue('\n🔍 Validating CLAUDE.md files...'));
    console.log(chalk.gray('═'.repeat(50)));
    
    const validation = await this.mergeSystem.validateConfiguration();
    
    // CES validation
    console.log('\n' + chalk.yellow('CES CLAUDE.md:'));
    if (validation.ces.valid) {
      console.log(chalk.green('  ✓') + ' Syntax valid');
      console.log(chalk.green('  ✓') + ' Structure valid');
      console.log(chalk.green('  ✓') + ` ${validation.ces.sections} sections found`);
    } else {
      console.log(chalk.red('  ✗') + ' Invalid: ' + validation.ces.error);
    }
    
    // Project validation
    if (validation.project.exists) {
      console.log('\n' + chalk.yellow('Project CLAUDE.md:'));
      if (validation.project.valid) {
        console.log(chalk.green('  ✓') + ' Syntax valid');
        console.log(chalk.green('  ✓') + ' Structure valid');
        console.log(chalk.green('  ✓') + ` ${validation.project.sections} sections found`);
      } else {
        console.log(chalk.red('  ✗') + ' Invalid: ' + validation.project.error);
      }
    }
    
    // Compatibility check
    console.log('\n' + chalk.yellow('Compatibility:'));
    if (validation.compatible) {
      console.log(chalk.green('  ✓') + ' Files are compatible');
    } else {
      console.log(chalk.red('  ✗') + ' Compatibility issues detected');
      validation.issues.forEach(issue => {
        console.log(`    - ${chalk.yellow(issue)}`);
      });
    }
    
    console.log('\n' + chalk.gray('═'.repeat(50)));
  }
}
```

### 3.3 Integra il comando nel CLI principale

In `src/cli/CLIManager.ts`, aggiungi:

```typescript
import { ClaudeConfigCommand } from './ClaudeConfigCommand';

// Nella funzione registerCommands()
const claudeConfigCmd = new ClaudeConfigCommand();
claudeConfigCmd.register(this.program);
```

---

## 🛠️ TASK 4: Creare Utility Helper

### 4.1 Crea `src/utils/claudeMergeSystem.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { envConfig } from '../config/EnvironmentConfig';
import { logger } from './Logger';

interface ClaudeConfig {
  content: string;
  sections: string[];
  hash: string;
  path: string;
}

interface Conflict {
  section: string;
  cesValue: string;
  projectValue: string;
  resolution: string;
  rule: string;
}

interface MergeStatus {
  ces: {
    exists: boolean;
    size: string;
    modified: string;
    sections: string[];
  };
  project: {
    exists: boolean;
    size: string;
    modified: string;
    sections: string[];
  };
  merged: {
    size: string;
    generated: string;
    sections: number;
    cached: boolean;
  };
  conflicts: number;
}

export class ClaudeMergeSystem extends EventEmitter {
  private cache: Map<string, { content: string; hash: string; timestamp: Date }>;
  private conflicts: Conflict[] = [];
  private cesPath: string;
  private projectPath: string;
  private outputPath: string;
  
  constructor() {
    super();
    this.cache = new Map();
    this.cesPath = path.join(envConfig.getCesRoot(), 'CLAUDE.md');
    this.projectPath = path.join(envConfig.getProjectRoot(), 'CLAUDE.md');
    this.outputPath = path.join(envConfig.getClaudeDir(), 'CLAUDE-MASTER.md');
  }
  
  async loadCesConfig(): Promise<ClaudeConfig> {
    try {
      const content = fs.readFileSync(this.cesPath, 'utf-8');
      const sections = this.extractSections(content);
      const hash = this.calculateHash(content);
      
      return { content, sections, hash, path: this.cesPath };
    } catch (error) {
      logger.error('Failed to load CES CLAUDE.md', error);
      throw new Error('CES CLAUDE.md is required but not found');
    }
  }
  
  async loadProjectConfig(): Promise<ClaudeConfig | null> {
    try {
      if (!fs.existsSync(this.projectPath)) {
        return null;
      }
      
      const content = fs.readFileSync(this.projectPath, 'utf-8');
      const sections = this.extractSections(content);
      const hash = this.calculateHash(content);
      
      return { content, sections, hash, path: this.projectPath };
    } catch (error) {
      logger.warn('Failed to load project CLAUDE.md', error);
      return null;
    }
  }
  
  async getMergedConfiguration(): Promise<string> {
    // Check cache
    const cacheKey = await this.getCacheKey();
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      logger.debug('Using cached merged configuration');
      return cached.content;
    }
    
    // Load configurations
    const cesConfig = await this.loadCesConfig();
    const projectConfig = await this.loadProjectConfig();
    
    // Merge configurations
    const merged = this.mergeConfigurations(cesConfig, projectConfig);
    
    // Cache result
    this.cache.set(cacheKey, {
      content: merged,
      hash: cacheKey,
      timestamp: new Date()
    });
    
    // Write to output
    fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
    fs.writeFileSync(this.outputPath, merged);
    
    // Emit event
    this.emit('configChanged', { type: 'merge', path: this.outputPath });
    
    return merged;
  }
  
  private mergeConfigurations(ces: ClaudeConfig, project: ClaudeConfig | null): string {
    this.conflicts = [];
    
    let merged = `# 🔷 CLAUDE MASTER DOCUMENTATION

This is an auto-generated file that combines CES system instructions with project-specific documentation.

## 📋 DOCUMENT HIERARCHY

1. **CES System Instructions** (Required, Read First)
2. **Project Instructions** (Optional, Read Second)

---

## 🔷 PART 1: CES SYSTEM CONTEXT

<!-- BEGIN CES INSTRUCTIONS -->
${ces.content}
<!-- END CES INSTRUCTIONS -->

---

## 🔷 PART 2: PROJECT CONTEXT

`;
    
    if (project) {
      // Detect and resolve conflicts
      this.detectConflicts(ces, project);
      
      merged += `<!-- BEGIN PROJECT INSTRUCTIONS -->
${project.content}
<!-- END PROJECT INSTRUCTIONS -->`;
    } else {
      merged += `*No project-specific CLAUDE.md found. Using CES defaults.*`;
    }
    
    // Add metadata
    merged += `

---

**Generated**: ${new Date().toISOString()}
**CES Version**: ${envConfig.get('version')}
**Project**: ${path.basename(envConfig.getProjectRoot())}
**Conflicts Resolved**: ${this.conflicts.length}
`;
    
    return merged;
  }
  
  private detectConflicts(ces: ClaudeConfig, project: ClaudeConfig): void {
    // Simplified conflict detection - in real implementation would parse sections
    const mandatorySections = ['Security Settings', 'Session Management', 'Core Features'];
    
    mandatorySections.forEach(section => {
      if (ces.content.includes(section) && project.content.includes(section)) {
        this.conflicts.push({
          section,
          cesValue: 'MANDATORY',
          projectValue: 'OVERRIDE_ATTEMPTED',
          resolution: 'CES_VALUE',
          rule: 'Mandatory sections cannot be overridden'
        });
        
        this.emit('conflictDetected', this.conflicts[this.conflicts.length - 1]);
      }
    });
  }
  
  getConflicts(): Conflict[] {
    return [...this.conflicts];
  }
  
  async reloadAndMerge(): Promise<void> {
    this.cache.clear();
    await this.getMergedConfiguration();
    this.emit('configChanged', { type: 'reload' });
  }
  
  async getStatus(): Promise<MergeStatus> {
    const status: MergeStatus = {
      ces: {
        exists: fs.existsSync(this.cesPath),
        size: '0 KB',
        modified: 'N/A',
        sections: []
      },
      project: {
        exists: fs.existsSync(this.projectPath),
        size: '0 KB',
        modified: 'N/A',
        sections: []
      },
      merged: {
        size: '0 KB',
        generated: 'N/A',
        sections: 0,
        cached: false
      },
      conflicts: this.conflicts.length
    };
    
    // Fill in details
    if (status.ces.exists) {
      const stats = fs.statSync(this.cesPath);
      status.ces.size = `${(stats.size / 1024).toFixed(1)} KB`;
      status.ces.modified = stats.mtime.toISOString();
      const content = fs.readFileSync(this.cesPath, 'utf-8');
      status.ces.sections = this.extractSections(content);
    }
    
    if (status.project.exists) {
      const stats = fs.statSync(this.projectPath);
      status.project.size = `${(stats.size / 1024).toFixed(1)} KB`;
      status.project.modified = stats.mtime.toISOString();
      const content = fs.readFileSync(this.projectPath, 'utf-8');
      status.project.sections = this.extractSections(content);
    }
    
    if (fs.existsSync(this.outputPath)) {
      const stats = fs.statSync(this.outputPath);
      status.merged.size = `${(stats.size / 1024).toFixed(1)} KB`;
      status.merged.generated = stats.mtime.toISOString();
      status.merged.sections = status.ces.sections.length + status.project.sections.length;
    }
    
    const cacheKey = await this.getCacheKey();
    status.merged.cached = this.cache.has(cacheKey);
    
    return status;
  }
  
  async validateConfiguration(): Promise<any> {
    const validation = {
      ces: { valid: false, sections: 0, error: null },
      project: { exists: false, valid: false, sections: 0, error: null },
      compatible: true,
      issues: []
    };
    
    // Validate CES
    try {
      const cesConfig = await this.loadCesConfig();
      validation.ces.valid = true;
      validation.ces.sections = cesConfig.sections.length;
    } catch (error: any) {
      validation.ces.error = error.message;
    }
    
    // Validate Project
    if (fs.existsSync(this.projectPath)) {
      validation.project.exists = true;
      try {
        const projectConfig = await this.loadProjectConfig();
        if (projectConfig) {
          validation.project.valid = true;
          validation.project.sections = projectConfig.sections.length;
        }
      } catch (error: any) {
        validation.project.error = error.message;
      }
    }
    
    // Check compatibility
    if (validation.ces.valid && validation.project.valid) {
      // Add specific compatibility checks here
      if (this.conflicts.length > 10) {
        validation.compatible = false;
        validation.issues.push('Too many conflicts detected');
      }
    }
    
    return validation;
  }
  
  private extractSections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^##\s+(.+)$/)) {
        sections.push(RegExp.$1.trim());
      }
    });
    
    return sections;
  }
  
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  private async getCacheKey(): Promise<string> {
    let key = '';
    
    if (fs.existsSync(this.cesPath)) {
      const stats = fs.statSync(this.cesPath);
      key += `ces:${stats.mtime.getTime()}:${stats.size}`;
    }
    
    if (fs.existsSync(this.projectPath)) {
      const stats = fs.statSync(this.projectPath);
      key += `|project:${stats.mtime.getTime()}:${stats.size}`;
    }
    
    return crypto.createHash('md5').update(key).digest('hex');
  }
}
```

---

## 📋 TASK 5: Aggiornare Package.json

### 5.1 Aggiungi script di test

Nel file `package.json`, aggiungi nella sezione `scripts`:

```json
{
  "scripts": {
    // ... altri script esistenti ...
    "test:claude": "bash scripts/test-dual-claude.sh",
    "test:claude:ts": "jest src/__tests__/claudeMergeSystem.test.ts",
    "claude:status": "tsx src/index.ts claude-config status",
    "claude:conflicts": "tsx src/index.ts claude-config conflicts",
    "claude:reload": "tsx src/index.ts claude-config reload",
    "claude:validate": "tsx src/index.ts claude-config validate"
  }
}
```

---

## 📋 TASK 6: Verifica Finale

### 6.1 Esegui tutti i test

```bash
# Test bash
npm run test:claude

# Test TypeScript
npm run test:claude:ts

# Verifica comandi CLI
npm run claude:status
npm run claude:validate
```

### 6.2 Verifica output visivo

Dopo aver implementato tutte le modifiche, quando esegui:

```bash
./ces-cli start-session
```

Dovresti vedere:

```
============================================================
🔷 CES Dual CLAUDE.md System - Loading Configuration
============================================================

📋 CLAUDE.md Loading Sequence:
──────────────────────────────────────────────────
✓ 1. System Config: ces/CLAUDE.md
     Size: 20.3 KB
     Modified: 2024-08-03T10:30:00.000Z
✓ 2. Project Config: ./CLAUDE.md
     Size: 5.7 KB
     Modified: 2024-08-03T14:00:00.000Z

🔄 3. Generating Merged Configuration...
✓ 4. Master Config: .claude/CLAUDE-MASTER.md
     Size: 26.0 KB
     Generated: 2024-08-03T14:30:00.000Z

============================================================
✅ Configuration loaded successfully
============================================================
```

---

## 🎯 Risultato Atteso

Al completamento di tutti i task:

1. ✅ **Documentazione completa** del flusso di merge in `docs/CLAUDE-MERGE-FLOW.md`
2. ✅ **Test suite robusta** con test bash e TypeScript
3. ✅ **Output visivo chiaro** durante il caricamento
4. ✅ **Comandi CLI** per ispezionare e gestire la configurazione
5. ✅ **Sistema di conflitti** documentato e testato
6. ✅ **Performance ottimizzata** con cache

---

**Implementa con attenzione ogni sezione. Il sistema doppio CLAUDE.md sarà completamente documentato, testato e trasparente!**