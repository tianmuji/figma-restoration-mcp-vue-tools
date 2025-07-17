#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

const commands = {
  init: async () => {
    console.log('🚀 Initializing Figma Restoration MCP Vue Tools...');
    
    // Copy configuration files to current directory
    const configFiles = [
      'config/mcp-config.template.json',
      'config/cursor-rules.template.md',
      'config/vscode-settings.template.json'
    ];
    
    for (const file of configFiles) {
      const sourcePath = join(packageRoot, file);
      const targetPath = file.replace('.template', '').replace('config/', '');
      
      try {
        const content = await fs.readFile(sourcePath, 'utf8');
        await fs.writeFile(targetPath, content);
        console.log(`✅ Created ${targetPath}`);
      } catch (error) {
        console.log(`⚠️  Could not copy ${file}: ${error.message}`);
      }
    }
    
    console.log('\n📚 Next steps:');
    console.log('1. Configure your MCP settings in mcp-config.json');
    console.log('2. Start the MCP server: npx figma-restoration-mcp-vue-tools start');
    console.log('3. Check documentation: https://github.com/tianmuji/figma-restoration-mcp-vue-tools');
  },
  
  start: () => {
    console.log('🚀 Starting Figma Restoration MCP Server...');
    const serverPath = join(packageRoot, 'src/server.js');

    const child = spawn('node', [serverPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
    });
  },

  'install-puppeteer': () => {
    console.log('🔧 Installing Puppeteer safely...');
    const installScript = join(packageRoot, 'scripts/install-puppeteer.js');

    const child = spawn('node', [installScript], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('error', (error) => {
      console.error('❌ Failed to install Puppeteer:', error.message);
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Puppeteer installation failed with code ${code}`);
        process.exit(code);
      }
    });
  },
  
  help: () => {
    console.log(`
🛠️  Figma Restoration MCP Vue Tools

Usage:
  npx @figma-restoration/mcp-vue-tools <command>

Commands:
  init              Initialize configuration files in current directory
  start             Start the MCP server
  install-puppeteer Install Puppeteer safely (optional)
  help              Show this help message

Examples:
  npx @figma-restoration/mcp-vue-tools init
  npx figma-restoration-mcp-vue-tools install-puppeteer
  npx @figma-restoration/mcp-vue-tools start

Documentation:
  https://github.com/yujie-wu/figma-restoration-mcp-vue-tools

Issues:
  https://github.com/yujie-wu/figma-restoration-mcp-vue-tools/issues
`);
  }
};

const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
