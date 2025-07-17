---
type: "always_apply"
description: "Package development guidelines for figma-restoration-mcp-vue-tools"
---

# Package Development Guidelines

## npm Package Context
This is the `figma-restoration-mcp-vue-tools` package - a professional toolkit for Figma component restoration with MCP integration.

## Development Standards

### Code Quality
- Write TypeScript-compatible JavaScript with JSDoc comments
- Follow ESLint and Prettier configurations
- Maintain 100% test coverage for critical functions
- Use semantic versioning for releases

### Documentation Requirements
- All public APIs must have comprehensive documentation
- Include usage examples for all major features
- Maintain up-to-date README.md with installation instructions
- Provide troubleshooting guides for common issues

### MCP Tool Development
- Follow MCP protocol specifications strictly
- Implement proper error handling and validation
- Provide clear tool descriptions and parameter schemas
- Test tools with various Figma design scenarios

### Vue Component Standards
- Use Vue 3 Composition API exclusively
- Implement proper TypeScript support
- Follow Vue style guide conventions
- Ensure components are reusable and well-documented

### CLI Development
- Provide helpful error messages and usage instructions
- Support common command-line patterns and flags
- Include progress indicators for long-running operations
- Implement proper exit codes and error handling

## File Structure Guidelines

### Source Code Organization
```
src/
├── tools/           # MCP tools (snapdom-screenshot, figma-compare)
├── components/      # Vue components for examples
├── utils/           # Shared utilities
├── views/           # Vue views for development server
└── server.js        # Main MCP server entry point
```

### Configuration Templates
```
config/
├── mcp-config.template.json      # MCP configuration template
├── cursor-rules.template.md      # Cursor IDE rules template
├── vscode-settings.template.json # VS Code settings template
└── project-integration.template.md # Integration guide
```

### Documentation Structure
```
docs/
├── installation.md              # Installation guide
├── mcp-tools-overview.md       # MCP tools documentation
├── workflow.md                 # Usage workflow
└── troubleshooting.md          # Common issues and solutions
```

## Testing Requirements

### Unit Tests
- Test all MCP tools with mock Figma data
- Validate CLI commands and error handling
- Test utility functions with edge cases
- Ensure proper error messages and validation

### Integration Tests
- Test complete Figma restoration workflows
- Validate MCP server startup and tool registration
- Test CLI installation and initialization
- Verify Vue component rendering and functionality

### Performance Tests
- Benchmark screenshot generation times
- Test memory usage with large Figma files
- Validate concurrent tool execution
- Monitor resource cleanup and garbage collection

## Release Process

### Pre-release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version number incremented
- [ ] CHANGELOG.md updated
- [ ] Examples tested and working

### Release Steps
1. Run full test suite
2. Update version in package.json
3. Generate release notes
4. Create git tag
5. Publish to npm
6. Update GitHub repository
7. Announce release

## User Experience Guidelines

### Installation Experience
- Provide clear, step-by-step installation instructions
- Include troubleshooting for common installation issues
- Support multiple installation methods (npm, yarn, pnpm)
- Verify installation with test commands

### First-Time User Experience
- Provide `init` command for project setup
- Include example configurations and templates
- Offer guided setup for MCP integration
- Provide sample Figma files for testing

### Developer Experience
- Clear error messages with actionable solutions
- Comprehensive API documentation with examples
- Active community support and issue resolution
- Regular updates and feature improvements

## Maintenance Guidelines

### Issue Management
- Respond to issues within 24 hours
- Provide clear reproduction steps for bugs
- Label issues appropriately (bug, feature, documentation)
- Maintain issue templates for consistent reporting

### Community Engagement
- Welcome contributions from the community
- Provide clear contribution guidelines
- Review pull requests promptly
- Maintain code of conduct and respectful communication

### Long-term Maintenance
- Keep dependencies updated and secure
- Monitor for breaking changes in MCP protocol
- Maintain compatibility with latest Vue versions
- Plan feature roadmap based on user feedback
