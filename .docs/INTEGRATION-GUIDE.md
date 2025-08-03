# 📚 Guida Integrazione CES nei Progetti

## Installazione Rapida

```bash
# 1. Dal tuo progetto
cd my-awesome-project

# 2. Clona CES come subdirectory
git clone https://github.com/anthropics/claude-ecosystem-standard.git ces

# 3. Setup e integrazione
cd ces
npm install
npm run build
./scripts/integrate.sh

# 4. Inizia a usare CES
cd ..
./ces-cli start-session
```

## Struttura Post-Integrazione

```
your-project/
├── .claude/          → Link a ces/.claude (gestito da CES)
├── .gitignore        → Aggiornato per escludere CES
├── ces-cli           → Comando rapido per CES
├── src/              → Il tuo codice
└── ces/              → CES isolato (ignorato da git)
```

## Comandi Disponibili

Dal tuo progetto, usa `./ces-cli` seguito da qualsiasi comando CES:

- `./ces-cli start-session` - Avvia sessione Claude
- `./ces-cli status` - Verifica stato
- `./ces-cli --help` - Mostra tutti i comandi

## Disinstallazione

```bash
# Rimuovi integrazione
rm .claude ces-cli
rm -rf ces/
# Modifica .gitignore per rimuovere le righe CES
```

## FAQ

**D: Posso usare CES in più progetti?**
R: Sì! Ogni progetto avrà la sua copia isolata di CES.

**D: Come aggiorno CES?**
R: `cd ces && git pull && npm install && npm run build`

**D: Posso committare CES nel mio repo?**
R: No, è escluso automaticamente da .gitignore. CES va clonato separatamente.