# Claude Code CLI Configuration

This directory contains project-specific Claude Code CLI configuration.

## Structure
- `claude_desktop_config.json` - MCP servers configuration (14 servers)
- `templates/` - Language-specific startup hook templates
- `agents/` - Reserved for custom project agents (12 native agents available via Task tool)

## MCP Servers Configured
- **context7** - Library documentation
- **serena** - Code analysis (project: current directory)
- **arxiv** - Scientific research
- **mongodb** - Database operations (uses environment variables)
- **postgresql** - Advanced database (uses environment variables)
- **git** - Repository management (current directory)
- **filesystem** - File operations and project management
- **sqlite** - Local development database
- **kubernetes** - Container orchestration and deployment
- **puppeteer** - Web automation
- **brave** - Web search (requires BRAVE_API_KEY)
- **youtube** - Video content
- **google-drive** - Cloud storage
- **bigquery** - Data analysis

## Multi-Language Support

This Claude ecosystem supports multiple programming languages with adaptive startup hooks:

### Available Templates
- `templates/startup-hook-typescript.cjs` - TypeScript projects
- `templates/startup-hook-javascript.cjs` - JavaScript/Node.js projects  
- `templates/startup-hook-python.cjs` - Python projects
- `templates/startup-hook-java.cjs` - Java projects
- `templates/startup-hook-rust.cjs` - Rust projects
- `templates/startup-hook-go.cjs` - Go projects
- `templates/startup-hook-csharp.cjs` - C#/.NET projects
- `templates/startup-hook-universal.cjs` - Detects any language automatically

### Language-Specific Features

#### 🟦 TypeScript
- TSConfig analysis and validation
- Framework detection (React, Vue, Next.js, Angular)
- Build tool recognition (Webpack, Vite, Rollup)
- Testing framework detection (Jest, Vitest, Cypress)

#### 🟨 JavaScript/Node.js
- Package.json analysis
- Framework detection (Express, Fastify, NestJS)
- Package manager detection (npm, yarn, pnpm, bun)
- Module system detection (ES modules, CommonJS)

#### 🐍 Python
- Virtual environment detection
- Package manager support (pip, poetry, pipenv, conda)
- Framework detection (Django, Flask, FastAPI)
- Data science libraries recognition

#### ☕ Java
- Build tool support (Maven, Gradle)
- Framework detection (Spring Boot, Jakarta EE)
- Project structure validation
- Dependency analysis

#### 🦀 Rust
- Cargo project analysis
- Workspace detection
- Dependency and feature analysis
- Toolchain validation

#### 🐹 Go
- Module system support (go.mod, go.work)
- Framework detection (Gin, Echo, Fiber)
- Workspace analysis
- Build configuration

#### 🔵 C#/.NET
- Project file analysis (.csproj, .sln)
- Framework detection (ASP.NET Core, Blazor, WPF)
- NuGet package analysis
- Multi-targeting support

### Usage Options

#### Option 1: Automatic Detection (Recommended)
The current `startup-hook.cjs` uses universal detection and works with any language:
```bash
# Already configured - detects your project automatically
```

#### Option 2: Language-Specific Hook
Copy a specific template for optimized language support:
```bash
# For TypeScript projects
cp .claude/templates/startup-hook-typescript.cjs .claude/startup-hook.cjs

# For Python projects  
cp .claude/templates/startup-hook-python.cjs .claude/startup-hook.cjs

# For Java projects
cp .claude/templates/startup-hook-java.cjs .claude/startup-hook.cjs
```

#### Option 3: Custom Hybrid
Combine multiple templates for polyglot projects by merging detection logic from different templates.

## Portability Features
- **Dynamic paths** - All configurations use relative paths or environment variables
- **Auto-detection** - Hook system automatically finds Claude ecosystem in any project
- **Environment variables** - Database connections and API keys configurable via .env
- **Language agnostic** - Adapts to any programming language

## Native Claude Code CLI Agents

The following 12 agents are **native to Claude Code CLI** and activated via the Task tool:

### Core Development Agents (6)
1. **solution-architect** - High-level system design and strategic decisions
2. **fullstack-developer** - Complete full-stack development assistance  
3. **backend-developer-specialist** - Server-side development and API design
4. **frontend-developer-specialist** - Modern UI development and frameworks
5. **data-architect-specialist** - Data architecture and database design
6. **devops-engineer** - CI/CD, infrastructure automation, and deployment

### Specialized Support Agents (6)  
7. **general-purpose** - General research and multi-step tasks
8. **compliance-manager** - Privacy regulations and data governance
9. **data-mining-specialist** - Data extraction and multi-source research
10. **ux-ix-designer** - UX/IX design guidance and interface optimization
11. **debugger-tester** - Comprehensive testing and quality assurance
12. **technical-writer** - Documentation and knowledge management

### Agent Usage
Agents are activated automatically via the Task tool:
```bash
# Example: Use solution architect for system design
"Use the solution-architect agent to design a microservices architecture"

# Example: Use fullstack developer for complete feature
"Have the fullstack-developer create an authentication system"
```

**Note:** Agents are not physical files - they are native Claude Code CLI functionality.

## Agent Selection Guide

To avoid overlaps and maximize efficiency, use this guide to choose the right agent for each task:

### 🏗️ **Architecture & System Design**

#### **System Architecture & High-Level Design**
- **Primary**: `solution-architect` - Overall system design, technology selection, scalability planning
- **When**: Designing new systems, major refactoring, technology stack decisions

#### **Infrastructure & Deployment**
- **Primary**: `devops-engineer` - CI/CD, containerization, cloud infrastructure
- **When**: Deployment automation, monitoring setup, infrastructure scaling

### 🗄️ **Database & Data**

#### **Database Schema Design**
- **Primary**: `data-architect-specialist` - Database modeling, optimization, data lakes
- **Secondary**: `backend-developer-specialist` - API integration with database
- **When**: Designing new databases, optimizing queries, data migration

#### **Data Analysis & Mining**
- **Primary**: `data-mining-specialist` - Data extraction, web scraping, research
- **Secondary**: `data-architect-specialist` - Data processing pipelines
- **When**: Competitive analysis, research data collection, ETL processes

### 💻 **Development Tasks**

#### **Full-Stack Features**
- **Primary**: `fullstack-developer` - Complete features spanning frontend + backend
- **When**: User authentication, complete CRUD flows, feature integration

#### **Backend-Only Development**
- **Primary**: `backend-developer-specialist` - APIs, business logic, microservices
- **When**: REST/GraphQL APIs, database integration, server-side logic

#### **Frontend-Only Development**
- **Primary**: `frontend-developer-specialist` - React/Vue components, state management
- **When**: UI components, responsive design, frontend optimization

### 🎨 **Design & User Experience**

#### **UX/UI Design**
- **Primary**: `ux-ix-designer` - User experience, interface design, usability
- **When**: User journey design, interface optimization, accessibility improvements

### 🧪 **Testing & Quality Assurance**

#### **Test Strategy & Framework**
- **Primary**: `debugger-tester` - Test planning, framework setup, quality assurance
- **When**: Setting up testing infrastructure, defining test strategy

#### **Implementation Testing**
- **Domain Specialist**: Use the relevant specialist (backend, frontend, fullstack)
- **When**: Writing tests for specific features you're implementing

#### **Bug Investigation**
- **Primary**: `debugger-tester` - Root cause analysis, performance optimization
- **Secondary**: Domain specialist for context
- **When**: Production bugs, performance issues, mysterious failures

### 📚 **Documentation & Communication**

#### **Technical Documentation**
- **Primary**: `technical-writer` - API docs, user manuals, technical content
- **When**: Creating documentation, API references, user guides

### 🛡️ **Compliance & Security**

#### **Privacy & Regulatory Compliance**
- **Primary**: `compliance-manager` - GDPR, privacy audits, regulatory requirements
- **When**: Privacy compliance, data governance, security audits

### 🔍 **Research & Analysis**

#### **Multi-Source Research**
- **Primary**: `data-mining-specialist` - Comprehensive data gathering across sources
- **When**: Market research, competitive analysis, academic research

#### **General Research Tasks**
- **Primary**: `general-purpose` - Broad research, multi-step analysis
- **When**: General investigation, multi-domain analysis, exploratory tasks

## Decision Matrix for Complex Tasks

### **Task: Implement User Authentication System**
1. **Start**: `solution-architect` - Design authentication architecture
2. **Backend**: `backend-developer-specialist` - JWT implementation, API endpoints
3. **Frontend**: `frontend-developer-specialist` - Login forms, state management
4. **Integration**: `fullstack-developer` - Connect frontend + backend
5. **Testing**: `debugger-tester` - Security testing, integration tests
6. **Documentation**: `technical-writer` - API documentation, user guides

### **Task: Performance Optimization**
1. **Analysis**: `debugger-tester` - Identify performance bottlenecks
2. **Database**: `data-architect-specialist` - Query optimization
3. **Backend**: `backend-developer-specialist` - API optimization
4. **Frontend**: `frontend-developer-specialist` - Bundle optimization
5. **Infrastructure**: `devops-engineer` - Scaling and monitoring

### **Task: New Feature Development**
1. **Planning**: `solution-architect` - Feature architecture
2. **Design**: `ux-ix-designer` - User experience design
3. **Implementation**: Choose based on scope:
   - **Full-stack**: `fullstack-developer`
   - **Backend-heavy**: `backend-developer-specialist`
   - **Frontend-heavy**: `frontend-developer-specialist`
4. **Testing**: `debugger-tester` - Test strategy + domain specialist for implementation
5. **Documentation**: `technical-writer` - Feature documentation

## Best Practices

### **🎯 Single Responsibility**
- Each agent should handle their core expertise
- Avoid asking backend specialists for frontend advice

### **🔄 Sequential Workflow**
- Architecture first, then implementation
- Design before development
- Testing throughout the process

### **🤝 Collaboration Points**
- Use `solution-architect` to coordinate complex multi-domain tasks
- Have `technical-writer` document decisions from all specialists
- Use `compliance-manager` to review any data-handling features

### **⚡ Quick Reference**

| Task Type | Primary Agent | Secondary Agent |
|-----------|---------------|-----------------|
| System Design | solution-architect | devops-engineer |
| API Development | backend-developer-specialist | fullstack-developer |
| UI Components | frontend-developer-specialist | ux-ix-designer |
| Database Design | data-architect-specialist | backend-developer-specialist |
| Testing Strategy | debugger-tester | domain-specialist |
| Documentation | technical-writer | domain-specialist |
| Performance Issues | debugger-tester | domain-specialist |
| Data Analysis | data-mining-specialist | data-architect-specialist |
| User Experience | ux-ix-designer | frontend-developer-specialist |
| Compliance | compliance-manager | solution-architect |
| Research | general-purpose | data-mining-specialist |
| DevOps/Infrastructure | devops-engineer | solution-architect |

## AutoTask Integration

The CES AutoTask system can automatically generate optimized prompts based on the guidelines above. Examples:

### **AutoTask Usage Examples:**
```bash
# Instead of manual agent selection:
npm run dev -- auto-task "Build user authentication"
# → Automatically generates: solution-architect + backend-developer-specialist + frontend-developer-specialist workflow

npm run dev -- auto "Fix slow database queries"  
# → Automatically generates: debugger-tester + data-architect-specialist parallel analysis

npm run dev -- auto-task "Create API documentation"
# → Automatically generates: technical-writer + backend-developer-specialist coordination
```

### **Integration with Agent Guide:**
- AutoTask uses this guide's rules for agent selection
- Manual override always available for complex cases
- Fallback to manual selection when automation confidence is low

This directory is essential for Claude Code CLI functionality.