# 🚀 GUIDA INSTALLAZIONE NODE.JS per CES v2.7.0

## 📋 **REQUISITI SISTEMA**

Il CES v2.7.0 richiede:
- **Node.js**: versione >= 18.0.0 
- **npm**: versione >= 8.0.0
- **Sistema**: Ubuntu/Linux compatibile

## 🔍 **DIAGNOSI PROBLEMI ATTUALI**

### **1. Verificare se Node.js è installato**
```bash
# Controllare se Node.js è installato
which node
node --version

# Controllare se npm è installato  
which npm
npm --version

# Controllare PATH
echo $PATH
```

### **2. Verificare permessi e ambiente**
```bash
# Controllare utente corrente
whoami

# Controllare directory di lavoro
pwd

# Controllare permessi
ls -la /usr/bin/node*
ls -la /usr/bin/npm*
```

## 🛠️ **SOLUZIONI INSTALLAZIONE**

### **Opzione 1: Installazione via NodeSource (Raccomandato)**
```bash
# 1. Aggiornare sistema
sudo apt update

# 2. Installare curl se non presente
sudo apt install -y curl

# 3. Aggiungere repository NodeSource per Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 4. Installare Node.js
sudo apt install -y nodejs

# 5. Verificare installazione
node --version  # Dovrebbe mostrare v18.x.x
npm --version   # Dovrebbe mostrare 8.x.x o superiore
```

### **Opzione 2: Installazione via snap**
```bash
# Installare Node.js via snap
sudo snap install node --classic

# Verificare installazione
node --version
npm --version
```

### **Opzione 3: Installazione manuale**
```bash
# 1. Scaricare Node.js 18 LTS
cd /tmp
wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz

# 2. Estrarre
tar -xf node-v18.19.0-linux-x64.tar.xz

# 3. Spostare in sistema
sudo mv node-v18.19.0-linux-x64 /opt/nodejs

# 4. Creare symlink
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /opt/nodejs/bin/npx /usr/local/bin/npx

# 5. Aggiornare PATH
echo 'export PATH=/opt/nodejs/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 6. Verificare
node --version
npm --version
```

### **Opzione 4: Installazione via nvm (Node Version Manager)**
```bash
# 1. Installare nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Ricaricare shell
source ~/.bashrc

# 3. Installare Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# 4. Verificare
node --version
npm --version
```

## 🔧 **RISOLUZIONE PROBLEMI SPECIFICI**

### **Problema: "command not found"**
```bash
# Verificare se Node.js è nel PATH
export PATH=$PATH:/usr/bin:/usr/local/bin

# Ricaricare configurazione shell
source ~/.bashrc
source ~/.profile

# Verificare di nuovo
which node
which npm
```

### **Problema: Permessi**
```bash
# Configurare npm per non richiedere sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Verificare configurazione
npm config get prefix
```

### **Problema: Versione obsoleta**
```bash
# Aggiornare npm
npm install -g npm@latest

# Verificare versione
npm --version
```

## ✅ **VERIFICA INSTALLAZIONE COMPLETA**

### **Test Base:**
```bash
# 1. Verificare versioni
node --version    # >= v18.0.0
npm --version     # >= 8.0.0

# 2. Test esecuzione JavaScript
node -e "console.log('Node.js funziona!')"

# 3. Test npm
npm --help

# 4. Test npx
npx --version
```

### **Test Avanzato:**
```bash
# Creare progetto test
mkdir test-node
cd test-node
npm init -y

# Installare pacchetto test
npm install chalk

# Test import ES modules
echo 'import chalk from "chalk"; console.log(chalk.green("ES Modules funzionano!"));' > test.mjs
node test.mjs

# Cleanup
cd ..
rm -rf test-node
```

## 🚀 **DOPO L'INSTALLAZIONE: SETUP CES**

### **1. Tornare al progetto CES**
```bash
cd ~/claude-ecosystem-standard
```

### **2. Installare dipendenze CES**
```bash
# Pulire installazioni precedenti
rm -rf node_modules package-lock.json

# Installare dipendenze
npm install

# Verificare tsx
npx tsx --version
```

### **3. Testare CES v2.7.0**
```bash
# Test compilazione
npm run build

# Test esecuzione
npm run dev -- --help

# Test nuove funzionalità
npm run dev -- analytics --dashboard
npm run dev -- ai-session --insights
npm run dev -- cloud --status
npm run dev -- quick --list
```

## 🎯 **RISOLUZIONE ERRORI COMUNI**

### **Errore: "tsx: not found"**
```bash
# Installare tsx localmente
npm install tsx --save-dev

# O globalmente
npm install -g tsx

# Usare npx come alternativa
npx tsx src/index.ts --help
```

### **Errore: "Permission denied"**
```bash
# Configurare npm senza sudo
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Reinstallare pacchetti globali
npm install -g tsx typescript
```

### **Errore: "Module not found"**
```bash
# Reinstallare dipendenze
rm -rf node_modules
npm cache clean --force
npm install

# Verificare package.json
cat package.json
```

## 📋 **CHECKLIST FINALE**

### **✅ Verifiche Pre-Test:**
- [ ] `node --version` mostra >= 18.0.0
- [ ] `npm --version` mostra >= 8.0.0  
- [ ] `npx tsx --version` funziona
- [ ] `npm install` completa senza errori
- [ ] `npm run build` compila senza errori
- [ ] `npm run dev -- --help` mostra comandi disponibili

### **✅ Verifiche Post-Installazione:**
- [ ] Tutte le dipendenze installate correttamente
- [ ] TypeScript compila senza errori
- [ ] tsx/ts-node funzionano per sviluppo
- [ ] Comandi CES v2.7.0 sono accessibili
- [ ] Test base delle nuove funzionalità passa

---

**🎉 Una volta completata l'installazione Node.js, il CES v2.7.0 con tutte le 4 nuove funzionalità (AI, Analytics, Cloud, Quick Commands) sarà completamente operativo!**