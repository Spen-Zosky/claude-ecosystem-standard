# 🔧 Git Credentials Setup Instructions

## 📋 Current Status

Le credenziali Git sono state resettate e configurate per richiedere l'input al momento del push.

## 🚀 Opzioni per Configurare le Credenziali

### Opzione 1: Script Automatico (Raccomandato)
```bash
./setup-git-credentials.sh
```

### Opzione 2: Configurazione Manuale
```bash
# Configura username e email
git config --global user.name "Il Tuo Username GitHub"
git config --global user.email "tua-email@esempio.com"

# Test della configurazione
git config --list | grep user
```

### Opzione 3: Solo per questo Repository
```bash
# Configura solo per questo progetto
git config user.name "Il Tuo Username GitHub"
git config user.email "tua-email@esempio.com"
```

## 🔐 Token di Accesso GitHub (Raccomandato)

Per maggiore sicurezza, usa un Personal Access Token invece della password:

1. **Crea Token**: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Permissions**: Seleziona `repo`, `workflow`, `write:packages`
3. **Usa Token**: Quando richiesta la password, inserisci il token

## 🧪 Test della Configurazione

```bash
# Verifica configurazione
git config --list | grep -E "(user\.|credential\.)"

# Test push (richiederà credenziali)
git push origin main
```

## 📊 Status Attuale Repository

```bash
# Commits pronti per il push
git log --oneline origin/main..HEAD

# File da pushare
git status
```

## ⚠️ Note Importanti

- **Username**: Il tuo username GitHub (non email)
- **Password**: Usa Personal Access Token per sicurezza
- **Cache**: Le credenziali sono cached per 1 ora
- **Scope**: Configurazione globale (tutti i repository)

## 🚀 Dopo la Configurazione

Una volta configurate le credenziali, potrai:

```bash
# Push dei commit CI/CD
git push origin main

# Push futuri senza richiesta credenziali (per 1 ora)
git push origin main
```

## 🛡️ Sicurezza

✅ **Best Practices**:
- Usa Personal Access Token
- Non condividere mai le credenziali
- Rinnova i token periodicamente
- Usa cache credential per convenienza

❌ **Evita**:
- Password in chiaro nei script
- Token in file di configurazione
- Condivisione di credenziali

---

**🤖 Generated with Claude Code CLI** - Setup sicuro e professionale per l'ambiente enterprise.