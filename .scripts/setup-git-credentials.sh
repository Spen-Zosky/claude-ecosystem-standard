#!/bin/bash

# ===================================================================
# CLAUDE ECOSYSTEM STANDARD (CES) v2.6.0 - GIT CREDENTIALS SETUP
# ===================================================================

echo "🔧 Git Credentials Setup for Claude Ecosystem Standard"
echo "======================================================="

# Check if git is configured
if git config user.name >/dev/null 2>&1 && git config user.email >/dev/null 2>&1; then
    echo "✅ Git is already configured:"
    echo "   Name: $(git config user.name)"
    echo "   Email: $(git config user.email)"
    echo ""
    read -p "Do you want to reconfigure? (y/N): " reconfigure
    if [[ $reconfigure != "y" && $reconfigure != "Y" ]]; then
        echo "ℹ️ Keeping existing configuration"
        exit 0
    fi
fi

echo ""
echo "📝 Please provide your Git credentials:"

# Get username
read -p "GitHub Username: " username
while [[ -z "$username" ]]; do
    echo "❌ Username cannot be empty"
    read -p "GitHub Username: " username
done

# Get email
read -p "GitHub Email: " email
while [[ -z "$email" ]]; do
    echo "❌ Email cannot be empty"
    read -p "GitHub Email: " email
done

# Configure Git
echo ""
echo "🔧 Configuring Git..."
git config --global user.name "$username"
git config --global user.email "$email"

# Configure credential helper
git config --global credential.helper 'cache --timeout=3600'

echo ""
echo "✅ Git configuration completed:"
echo "   Name: $(git config user.name)"
echo "   Email: $(git config user.email)"
echo "   Credential Helper: $(git config credential.helper)"

echo ""
echo "🚀 You can now push to GitHub:"
echo "   git push origin main"
echo ""
echo "💡 Note: You'll be prompted for your GitHub password/token on first push"
echo "   The credentials will be cached for 1 hour"

# Test remote connection
echo ""
echo "🧪 Testing GitHub connection..."
if git ls-remote origin >/dev/null 2>&1; then
    echo "✅ GitHub connection successful"
else
    echo "⚠️ GitHub connection test failed (this may be normal if authentication is required)"
fi

echo ""
echo "🎉 Setup complete! Ready for git operations."