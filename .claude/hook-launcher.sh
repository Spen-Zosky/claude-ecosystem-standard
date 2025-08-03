#!/bin/bash

# Claude Code CLI Hook Launcher
# This script dynamically finds projects with Claude ecosystem and runs the appropriate hook

# Function to find the nearest .claude directory going up the directory tree
find_claude_project() {
    local current_dir="$PWD"
    
    while [ "$current_dir" != "/" ]; do
        if [ -f "$current_dir/.claude/startup-hook.cjs" ] && [ -f "$current_dir/.claude/claude_desktop_config.json" ]; then
            echo "$current_dir"
            return 0
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    return 1
}

# Main execution
PROJECT_DIR=$(find_claude_project)

if [ $? -eq 0 ] && [ -n "$PROJECT_DIR" ]; then
    # Change to project directory and run the hook
    cd "$PROJECT_DIR" && node .claude/startup-hook.cjs
else
    # No Claude ecosystem found - silent exit
    exit 0
fi