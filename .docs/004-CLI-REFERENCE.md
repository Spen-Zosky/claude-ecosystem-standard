# 004 - CLI REFERENCE COMPLETO

## 🛠️ Riferimento Comandi CLI CES v2.7.0 Enterprise

**Leggi dopo il setup e installazione** - Guida completa a tutti i comandi disponibili nel sistema.

### 📋 Panoramica Comandi

Il sistema CES v2.7.0 fornisce oltre **40 comandi CLI enterprise** organizzati in categorie funzionali:

```bash
# Aiuto generale
npm run dev -- --help

# Aiuto comando specifico
npm run dev -- <comando> --help

# Lista tutti i comandi
npm run dev -- --list-commands
```

### 🏢 Comandi Enterprise Principali

#### 1. 🎯 Session Management

**Start Session Enterprise**
```bash
npm run dev -- start-session [opzioni]

Opzioni:
  --interactive, -i     Setup sessione interattivo
  --profile <nome>      Usa profilo sessione specifico
  --analytics           Abilita raccolta analytics
  --recovery            Abilita monitoraggio auto-recovery
  --verbose, -v         Output dettagliato

Esempi:
npm run dev -- start-session --profile frontend-react
npm run dev -- start-session --interactive --analytics
```

**Checkpoint Session**
```bash
npm run dev -- checkpoint-session [opzioni]

Opzioni:
  --name <nome>         Nome checkpoint
  --description <desc>  Descrizione checkpoint
  --analytics           Includi dati analytics
  --backup             Crea backup completo

Esempi:
npm run dev -- checkpoint-session --name "feature-complete"
npm run dev -- checkpoint-session --description "Before refactoring"
```

**Close Session**
```bash
npm run dev -- close-session [opzioni]

Opzioni:
  --force, -f           Chiusura forzata senza conferma
  --backup              Crea backup prima della chiusura
  --analytics           Salva dati analytics
  --cleanup             Cleanup automatico risorse

Esempi:
npm run dev -- close-session --backup --analytics
npm run dev -- close-session --force --cleanup
```

#### 2. ⚙️ Configuration Management

**Gestione Configurazione**
```bash
npm run dev -- config [azione] [opzioni]

Azioni:
  show                  Mostra configurazione corrente
  edit                  Editor configurazione interattivo
  validate              Valida configurazione
  reset                 Reset configurazione di default
  export                Esporta configurazione
  import <file>         Importa configurazione
  generate              Genera nuova configurazione

Opzioni:
  --section <nome>      Sezione configurazione specifica
  --format <formato>    Formato output (json/yaml/table)
  --enterprise          Configurazione enterprise
  --backup              Backup prima delle modifiche

Esempi:
npm run dev -- config show --section analytics
npm run dev -- config edit --enterprise
npm run dev -- config validate --verbose
npm run dev -- config export --format json
npm run dev -- config generate --enterprise
```

#### 3. 📊 Analytics & Monitoring

**Sistema Analytics**
```bash
npm run dev -- analytics [azione] [opzioni]

Azioni:
  dashboard             Dashboard analytics completo
  report                Genera report analytics
  realtime              Monitoraggio tempo reale
  export                Esporta dati analytics
  start                 Avvia raccolta dati
  stop                  Ferma raccolta dati
  clear                 Pulisci dati analytics

Opzioni:
  --period <periodo>    Periodo tempo (hour/day/week/month)
  --format <formato>    Formato export (json/csv/html)
  --include-events      Includi eventi raw
  --live                Aggiornamento live
  --summary             Solo riepilogo

Esempi:
npm run dev -- analytics dashboard --live
npm run dev -- analytics report --period week
npm run dev -- analytics export --format csv
npm run dev -- analytics realtime --summary
```

**Dashboard Monitoring**
```bash
npm run dev -- dashboard [azione] [opzioni]

Azioni:
  live                  Dashboard monitoring live
  snapshot              Snapshot dashboard statico
  compact               Vista compatta monitoring
  export                Esporta dati dashboard
  configure             Configura dashboard

Opzioni:
  --refresh <ms>        Intervallo refresh millisecondi
  --theme <tema>        Tema dashboard (dark/light)
  --port <porta>        Porta server dashboard
  --auto-open           Apri browser automaticamente

Esempi:
npm run dev -- dashboard live --refresh 1000
npm run dev -- dashboard configure --theme dark --port 3000
npm run dev -- dashboard snapshot --export json
```

#### 4. 🔄 Auto-Recovery System

**Sistema Auto-Recovery**
```bash
npm run dev -- recovery [azione] [opzioni]

Azioni:
  start                 Avvia monitoraggio auto-recovery
  stop                  Ferma monitoraggio auto-recovery
  status                Stato sistema recovery
  trigger <servizio>    Trigger recovery manuale
  configure             Configura sistema recovery
  export                Esporta dati recovery

Opzioni:
  --service <nome>      Nome servizio target
  --action <azione>     Azione recovery (restart/cleanup/repair)
  --threshold <valore>  Soglia trigger recovery
  --interval <ms>       Intervallo monitoraggio

Esempi:
npm run dev -- recovery start --interval 10000
npm run dev -- recovery trigger claude-code-cli --action restart
npm run dev -- recovery configure --threshold 80
npm run dev -- recovery status --detailed
```

#### 5. 👤 Session Profiles

**Gestione Profili**
```bash
npm run dev -- profiles [azione] [opzioni]

Azioni:
  list                  Lista profili disponibili
  create <nome>         Crea nuovo profilo
  apply <nome>          Applica configurazione profilo
  delete <nome>         Elimina profilo
  edit <nome>           Modifica profilo esistente
  export <nome>         Esporta configurazione profilo
  import <file>         Importa profilo da file
  stats                 Statistiche utilizzo profili

Opzioni:
  --description <desc>  Descrizione profilo
  --template <nome>     Template base nuovo profilo
  --force, -f           Forza operazione senza conferma
  --enterprise          Profilo enterprise

Esempi:
npm run dev -- profiles create "frontend-vue" --template react
npm run dev -- profiles apply frontend-react --analytics
npm run dev -- profiles export "my-profile" --format yaml
npm run dev -- profiles stats --detailed
```

#### 6. ⚡ Quick Commands

**Comandi Rapidi**
```bash
npm run dev -- quick [azione] [alias] [args...]

Azioni:
  list                  Lista comandi rapidi
  add <alias> <comando> Aggiungi comando rapido
  remove <alias>        Rimuovi comando rapido
  edit <alias>          Modifica comando rapido
  run <alias>           Esegui comando rapido
  stats                 Statistiche utilizzo
  cheat                 Cheat sheet completo
  export                Esporta comandi rapidi

Quick Commands Predefiniti:
  start                 Avvio sessione rapido
  dash                  Dashboard monitoring
  clean                 Cleanup preview
  status               Status check completo
  build                Build progetto
  test                 Test suite completa
  react                Setup React environment
  vue                  Setup Vue environment
  api                  Setup API development

Esempi:
npm run dev -- quick list --category development
npm run dev -- quick add mybuild "npm run build && npm test"
npm run dev -- quick start --profile frontend
npm run dev -- quick stats --period week
```

#### 7. 🤖 AI Session Optimization

**Ottimizzazione AI**
```bash
npm run dev -- ai-session [azione] [opzioni]

Azioni:
  start                 Avvia monitoraggio AI
  stop                  Ferma monitoraggio AI
  insights              Analisi insights sessione
  recommendations       Raccomandazioni ottimizzazione
  optimize              Ottimizzazione automatica
  configure             Configura comportamento AI
  analyze               Analisi pattern sessione
  export                Esporta dati AI

Opzioni:
  --learning-mode <mode>    Modalità learning (passive/active/aggressive)
  --accuracy <numero>       Soglia accuratezza predizione
  --adaptation-level <lvl>  Livello adattamento (minimal/standard/maximum)
  --enable-predictions      Abilita predizioni
  --context-awareness       Abilita context awareness

Esempi:
npm run dev -- ai-session insights --detailed
npm run dev -- ai-session recommendations --learning-mode active
npm run dev -- ai-session optimize --accuracy 85
npm run dev -- ai-session configure --adaptation-level maximum
```

#### 8. ☁️ Cloud Integration

**Integrazione Cloud**
```bash
npm run dev -- cloud [azione] [opzioni]

Azioni:
  status                Stato integrazione cloud
  configure             Configura provider cloud
  connect               Connetti a provider cloud
  sync                  Sincronizza dati sessione
  backup                Crea backup cloud
  restore               Ripristina da backup cloud
  list-backups          Lista backup disponibili
  start-sync            Avvia sincronizzazione automatica
  stop-sync             Ferma sincronizzazione automatica

Opzioni:
  --provider <nome>     Provider cloud (github/aws/azure/gcp)
  --encryption          Abilita crittografia
  --compression         Abilita compressione
  --retention <days>    Giorni retention backup

Esempi:
npm run dev -- cloud configure --provider github --encryption
npm run dev -- cloud backup --compression --retention 30
npm run dev -- cloud sync --incremental
npm run dev -- cloud restore --backup-id "2024-01-15-backup"
```

### 🔧 Comandi Sistema

#### 9. 🧹 System Cleanup

**Clean Reset Sistema**
```bash
npm run dev -- clean-reset [opzioni]
npm run dev -- reset [opzioni]                    # Alias

Opzioni:
  --dry-run             Preview cleanup senza modifiche
  --preserve-sessions   Mantieni dati sessione Claude
  --preserve-logs       Mantieni file log
  --preserve-analytics  Mantieni dati analytics
  --no-docker           Salta reset container Docker
  --no-node             Salta cleanup processi Node.js
  --no-cache            Salta pulizia cache
  --gentle              Usa SIGTERM invece di SIGKILL
  --force, -f           Cleanup forzato senza conferma
  --deep                Cleanup profondo sistema

Esempi:
npm run dev -- clean-reset --dry-run --preserve-logs
npm run dev -- reset --preserve-sessions --gentle
npm run dev -- clean-reset --deep --force
```

#### 10. 📊 Monitoring

**Monitoraggio Sistema**
```bash
npm run dev -- monitor [azione] [opzioni]

Azioni:
  start                 Avvia monitoraggio sessione
  stop                  Ferma monitoraggio sessione
  status                Stato monitoraggio
  trigger-checkpoint    Trigger checkpoint manuale
  trigger-close         Trigger chiusura sessione
  trigger-clean-reset   Trigger clean reset
  configure             Configura monitoraggio

Opzioni:
  --interval <ms>       Intervallo monitoraggio
  --auto-checkpoint     Checkpoint automatico
  --auto-recovery       Recovery automatico
  --notifications       Notifiche eventi

Esempi:
npm run dev -- monitor start --interval 30000 --auto-checkpoint
npm run dev -- monitor configure --auto-recovery --notifications
npm run dev -- monitor trigger-checkpoint --name "milestone"
```

#### 11. ✅ System Status

**Status Sistema**
```bash
npm run dev -- status [opzioni]

Opzioni:
  --detailed, -d        Informazioni status dettagliate
  --format <formato>    Formato output (table/json/yaml)
  --services            Includi status servizi
  --resources           Includi utilizzo risorse
  --health              Health check completo
  --performance         Metriche performance

Esempi:
npm run dev -- status --detailed --health
npm run dev -- status --services --resources --format json
npm run dev -- status --performance --detailed
```

#### 12. 🔍 Validation

**Validazione Sistema**
```bash
npm run dev -- validate [opzioni]

Opzioni:
  --verbose, -v         Output validazione dettagliato
  --quick, -q           Validazione rapida
  --comprehensive       Validazione completa enterprise
  --fix                 Tentativo riparazione automatica
  --report              Genera report validazione
  --score               Mostra punteggio validazione

Esempi:
npm run dev -- validate --comprehensive --fix
npm run dev -- validate --report --score
npm run dev -- validate --quick --verbose
```

### 🤖 Comandi Automazione

#### 13. 🔄 Auto Task Dispatcher

**Dispatcher Task Automatico**
```bash
npm run dev -- auto-task <prompt>
npm run dev -- auto <prompt>                      # Alias

Opzioni:
  --mode <modo>         Modalità esecuzione (parallel/sequential/hybrid)
  --agents <lista>      Agenti specifici da utilizzare
  --priority <livello>  Priorità task (low/medium/high/critical)
  --timeout <ms>        Timeout esecuzione task
  --dry-run             Simulazione esecuzione

Esempi:
npm run dev -- auto-task "Implement user authentication system"
npm run dev -- auto "Optimize database performance" --mode parallel
npm run dev -- auto-task "Create REST API endpoints" --priority high
```

#### 14. 💬 Interactive Mode

**Modalità Interattiva**
```bash
npm run dev -- interactive
npm run dev -- i                                  # Alias

Opzioni:
  --profile <nome>      Avvia con profilo specifico
  --analytics           Abilita analytics in modalità interattiva
  --ai-assistance       Abilita assistenza AI
  --enterprise          Modalità enterprise

Esempi:
npm run dev -- interactive --profile frontend-react --analytics
npm run dev -- i --ai-assistance --enterprise
```

### 🎯 Comandi Avanzati

#### 15. 📈 Performance & Optimization

**Ottimizzazione Performance**
```bash
npm run dev -- optimize [target] [opzioni]

Target:
  system                Ottimizzazione sistema completo
  memory                Ottimizzazione memoria
  cpu                   Ottimizzazione CPU
  network               Ottimizzazione rete
  storage               Ottimizzazione storage

Opzioni:
  --aggressive          Ottimizzazione aggressiva
  --safe                Ottimizzazione sicura
  --benchmark           Include benchmark performance

Esempi:
npm run dev -- optimize system --benchmark
npm run dev -- optimize memory --aggressive
npm run dev -- optimize network --safe
```

### 🔗 Command Chaining

**Concatenazione Comandi**

```bash
# Workflow sviluppo completo
npm run dev -- start-session --profile react && \
npm run dev -- analytics start && \
npm run dev -- recovery start && \
npm run dev -- dashboard live

# Setup ambiente enterprise
npm run dev -- config generate --enterprise && \
npm run dev -- validate --comprehensive --fix && \
npm run dev -- profiles apply enterprise-default
```

### 🌍 Variabili Ambiente

**Override Configurazione**

```bash
# Development con debug
DEBUG=ces:* CES_VERBOSE_LOGGING=true npm run dev -- start-session

# Production sicuro
NODE_ENV=production CES_ANALYTICS_ENABLED=false npm run dev -- validate

# Testing con override
CES_TEST_MODE=true CES_MOCK_SERVICES=true npm run dev -- auto-task "test"
```

### 📊 Formati Output

**Formati Supportati:**

- **table** - Formato tabella leggibile (default)
- **json** - Formato JSON per automazione
- **yaml** - Formato YAML per configurazione
- **csv** - Formato CSV per analisi dati
- **html** - Formato HTML per report
- **markdown** - Formato Markdown per documentazione

### 🔐 Modalità Sicura

**Comandi Sicuri con Dry-Run:**

```bash
npm run dev -- clean-reset --dry-run
npm run dev -- config reset --dry-run
npm run dev -- profiles delete sensitive-profile --dry-run
npm run dev -- recovery trigger critical-service --dry-run
```

### 📚 Sistema Aiuto

**Ottenere Aiuto:**

```bash
# Aiuto generale
npm run dev -- --help

# Aiuto comando specifico  
npm run dev -- analytics --help

# Esempi comando
npm run dev -- profiles --examples

# Guida interattiva
npm run dev -- help --interactive
```

---

**📌 Il sistema CLI CES v2.7.0 fornisce un'interfaccia enterprise completa con oltre 200 opzioni e combinazioni per gestire ogni aspetto del workflow di sviluppo.**