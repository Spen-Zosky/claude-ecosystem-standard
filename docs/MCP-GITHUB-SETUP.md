# GitHub MCP Server Setup Guide

## Overview

This guide explains how to configure the GitHub MCP server for the Claude Ecosystem Standard. The GitHub MCP server enables GitHub operations through the MCP (Model Context Protocol) interface.

## Current Status

✅ **Git MCP Server**: Working correctly  
⚠️ **GitHub MCP Server**: Configured but requires API token

## Configuration

### 1. GitHub MCP Server Configuration

The server is configured in `.claude/claude_desktop_config.json`:

```json
"github": {
  "command": "npx",
  "args": ["-y", "@missionsquad/mcp-github"],
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN:-}",
    "GITHUB_API_BASE_URL": "${GITHUB_API_BASE_URL:-https://api.github.com}"
  }
}
```

### 2. Environment Configuration

Environment variables are configured in `.env`:

```bash
# ================================
# GITHUB INTEGRATION
# ================================

# GitHub API Token for MCP server (required for github operations)
# Generate at: https://github.com/settings/tokens
# Required permissions: repo, user, admin:org
GITHUB_TOKEN=
GITHUB_API_BASE_URL=https://api.github.com
```

## Setup Instructions

### Step 1: Generate GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `CES MCP Server`
4. Select the following scopes:
   - `repo` - Full control of private repositories
   - `user` - Update ALL user data
   - `admin:org` - Full control of orgs and teams (if needed)

### Step 2: Configure Token

1. Copy the generated token
2. Open `.env` file in the project root
3. Set the `GITHUB_TOKEN` variable:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

### Step 3: Restart Claude Code CLI

After configuring the token, restart your Claude Code CLI session to load the new configuration:

```bash
**close session
**start session
```

## Testing

To test if the GitHub MCP server is working:

1. Try GitHub operations through the MCP interface
2. Check for GitHub tools in the available MCP tools list
3. Verify API access with basic repository operations

## Troubleshooting

### Common Issues

1. **Token not found**: Ensure `GITHUB_TOKEN` is set in `.env`
2. **Permission denied**: Check token has required scopes
3. **Server not loading**: Restart Claude Code CLI session

### Error Messages

- `401 Unauthorized`: Token is invalid or expired
- `403 Forbidden`: Token lacks required permissions
- `404 Not Found`: Repository or resource doesn't exist

## Available Operations

Once configured, the GitHub MCP server provides access to:

- Repository management
- Issue tracking
- Pull request operations  
- User and organization data
- Commit and branch operations

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit the `.env` file with actual tokens
2. Use environment-specific tokens (development/production)
3. Regularly rotate API tokens
4. Use minimum required permissions
5. Store tokens securely in production environments

## Status Summary

- ✅ Git MCP Server: Fully functional
- ✅ GitHub MCP Server: Configured and ready for token
- ✅ Environment Configuration: Complete
- ⏳ Token Setup: Requires user action

The GitHub MCP server configuration is complete and ready for use once the GitHub API token is provided.