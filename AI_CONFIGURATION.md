# AI Assistant Configuration

This package includes pre-configured AI assistant settings to help you work more effectively with Figma component restoration and MCP tools.

## 📁 Configuration Directories

### `.augment/` - Augment AI Configuration
Contains rules and guidelines optimized for Augment AI assistant:
- `rules/general.md` - General project guidelines
- `rules/figma-restore-process.md` - Figma restoration workflow
- `rules/figma-assets-management.md` - Asset management guidelines
- `rules/figma-self-reflective.md` - Self-reflective analysis rules
- `rules/package-development.md` - Package development standards

### `.cursor/` - Cursor IDE Configuration  
Contains the same rules optimized for Cursor IDE users:
- Enhanced with Cursor-specific AI integration guidelines
- Includes workspace configuration recommendations
- Provides AI-assisted development patterns

## 🚀 Quick Setup

### For Augment AI Users
The `.augment/` directory is automatically recognized by Augment AI. No additional setup required.

### For Cursor IDE Users
1. The `.cursor/` directory provides AI assistant context
2. Install recommended extensions:
   ```bash
   # Vue Language Features
   code --install-extension Vue.volar
   
   # TypeScript Vue Plugin  
   code --install-extension Vue.vscode-typescript-vue-plugin
   ```

### For Other AI Assistants
You can adapt the configuration files in either directory for your preferred AI assistant.

## 📋 Configuration Features

### Figma Restoration Guidelines
- **Three-pass analysis method** for thorough Figma JSON processing
- **Asset management rules** for proper image and SVG handling
- **Component structure guidelines** for Vue 3 implementation
- **Quality assurance standards** for 98%+ restoration accuracy

### MCP Tool Development
- **Protocol compliance** guidelines for MCP tool creation
- **Error handling patterns** for robust tool implementation
- **Testing strategies** for MCP tool validation
- **Documentation standards** for tool descriptions

### Vue Component Standards
- **Vue 3 Composition API** best practices
- **TypeScript integration** guidelines
- **Component architecture** patterns
- **Styling and layout** recommendations

## 🛠️ Customization

### Modifying Rules
You can customize the AI assistant rules by editing files in either directory:

```bash
# Edit general guidelines
nano .augment/rules/general.md

# Edit Figma restoration process
nano .augment/rules/figma-restore-process.md

# Edit package development rules
nano .augment/rules/package-development.md
```

### Adding New Rules
Create new `.md` files in the `rules/` directory with the following format:

```markdown
---
type: "always_apply"
description: "Your rule description"
---

# Your Rule Title

Your rule content here...
```

## 🎯 Usage Examples

### Starting a New Figma Restoration
1. AI assistant will automatically apply restoration guidelines
2. Follow the three-pass analysis method for Figma JSON
3. Use asset management rules for proper file organization
4. Apply quality standards for high-accuracy restoration

### Developing MCP Tools
1. AI assistant provides MCP protocol guidance
2. Implements proper error handling patterns
3. Suggests testing strategies and validation
4. Ensures documentation completeness

### Vue Component Development
1. AI assistant enforces Vue 3 Composition API usage
2. Provides TypeScript integration suggestions
3. Recommends component architecture patterns
4. Guides styling and layout implementation

## 🔧 Troubleshooting

### Configuration Not Loading
- Ensure the configuration directory is in your project root
- Check that your AI assistant supports the configuration format
- Verify file permissions allow reading the configuration files

### Rules Not Applying
- Restart your AI assistant or IDE
- Check for syntax errors in configuration files
- Ensure the `type: "always_apply"` header is present

### Customization Issues
- Follow the existing file format when creating new rules
- Test configuration changes with simple examples
- Refer to existing rules for formatting guidance

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Vue 3 Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Package Documentation](./README.md)

## 🤝 Contributing

If you have improvements to the AI configuration:

1. Fork the repository
2. Modify the configuration files
3. Test with your AI assistant
4. Submit a pull request with your improvements

## 📄 License

The AI configuration files are included under the same MIT license as the main package.
