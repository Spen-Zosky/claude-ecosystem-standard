# 🚀 NODE.JS INSTALLATION GUIDE for CES v2.7.0

## 📋 **SYSTEM REQUIREMENTS**

CES v2.7.0 requires:
- **Node.js**: version >= 18.0.0 
- **npm**: version >= 8.0.0
- **System**: Ubuntu/Linux compatible

## 🔍 **CURRENT ISSUES DIAGNOSIS**

### **1. Check if Node.js is installed**
```bash
# Check if Node.js is installed
which node
node --version

# Check if npm is installed  
which npm
npm --version

# Check PATH
echo $PATH
```

### **2. Verify permissions and environment**
```bash
# Check current user
whoami

# Check working directory
pwd

# Check permissions
ls -la /usr/bin/node*
ls -la /usr/bin/npm*
```

## 🛠️ **INSTALLATION SOLUTIONS**

### **Option 1: Installation via NodeSource (Recommended)**
```bash
# 1. Update system
sudo apt update

# 2. Install curl if not present
sudo apt install -y curl

# 3. Add NodeSource repository for Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 4. Install Node.js
sudo apt install -y nodejs

# 5. Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x or higher
```

### **Option 2: Installation via snap**
```bash
# Install Node.js via snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

### **Option 3: Manual installation**
```bash
# 1. Download Node.js 18 LTS
cd /tmp
wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz

# 2. Extract
tar -xf node-v18.19.0-linux-x64.tar.xz

# 3. Move to system
sudo mv node-v18.19.0-linux-x64 /opt/nodejs

# 4. Create symlinks
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /opt/nodejs/bin/npx /usr/local/bin/npx

# 5. Update PATH
echo 'export PATH=/opt/nodejs/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 6. Verify
node --version
npm --version
```

### **Option 4: Installation via nvm (Node Version Manager)**
```bash
# 1. Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Reload shell
source ~/.bashrc

# 3. Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# 4. Verify
node --version
npm --version
```

## 🔧 **SPECIFIC PROBLEM RESOLUTION**

### **Problem: "command not found"**
```bash
# Check if Node.js is in PATH
export PATH=$PATH:/usr/bin:/usr/local/bin

# Reload shell configuration
source ~/.bashrc
source ~/.profile

# Check again
which node
which npm
```

### **Problem: Permissions**
```bash
# Configure npm to not require sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Verify configuration
npm config get prefix
```

### **Problem: Outdated version**
```bash
# Update npm
npm install -g npm@latest

# Verify version
npm --version
```

## ✅ **COMPLETE INSTALLATION VERIFICATION**

### **Basic Test:**
```bash
# 1. Verify versions
node --version    # >= v18.0.0
npm --version     # >= 8.0.0

# 2. Test JavaScript execution
node -e "console.log('Node.js works!')"

# 3. Test npm
npm --help

# 4. Test npx
npx --version
```

### **Advanced Test:**
```bash
# Create test project
mkdir test-node
cd test-node
npm init -y

# Install test package
npm install chalk

# Test ES modules import
echo 'import chalk from "chalk"; console.log(chalk.green("ES Modules work!"));' > test.mjs
node test.mjs

# Cleanup
cd ..
rm -rf test-node
```

## 🚀 **AFTER INSTALLATION: CES SETUP**

### **1. Return to CES project**
```bash
cd ~/claude-ecosystem-standard
```

### **2. Install CES dependencies**
```bash
# Clean previous installations
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Verify tsx
npx tsx --version
```

### **3. Test CES v2.7.0**
```bash
# Test compilation
npm run build

# Test execution
npm run dev -- --help

# Test new features
npm run dev -- analytics --dashboard
npm run dev -- ai-session --insights
npm run dev -- cloud --status
npm run dev -- quick --list
```

## 🎯 **COMMON ERROR RESOLUTION**

### **Error: "tsx: not found"**
```bash
# Install tsx locally
npm install tsx --save-dev

# Or globally
npm install -g tsx

# Use npx as alternative
npx tsx .src/index.ts --help
```

### **Error: "Permission denied"**
```bash
# Configure npm without sudo
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Reinstall global packages
npm install -g tsx typescript
```

### **Error: "Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm cache clean --force
npm install

# Verify package.json
cat package.json
```

## 📋 **FINAL CHECKLIST**

### **✅ Pre-Test Verification:**
- [ ] `node --version` shows >= 18.0.0
- [ ] `npm --version` shows >= 8.0.0  
- [ ] `npx tsx --version` works
- [ ] `npm install` completes without errors
- [ ] `npm run build` compiles without errors
- [ ] `npm run dev -- --help` shows available commands

### **✅ Post-Installation Verification:**
- [ ] All dependencies installed correctly
- [ ] TypeScript compiles without errors
- [ ] tsx/ts-node work for development
- [ ] CES v2.7.0 commands are accessible
- [ ] Basic test of new features passes

---

**🎉 Once Node.js installation is complete, CES v2.7.0 with all 4 new features (AI, Analytics, Cloud, Quick Commands) will be fully operational!**