import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 83,
    host: true,
    middlewareMode: false,
    configureServer(server) {
      // 添加中间件来提供results目录的访问
      server.middlewares.use('/results', (req, res, next) => {
        // 解析URL，提取组件名称
        const urlParts = req.url.split('/').filter(part => part);
        let filePath = null;

        // 如果URL包含组件名称，尝试从组件目录获取文件
        if (urlParts.length >= 2) {
          const componentName = urlParts[0];
          const fileName = urlParts.slice(1).join('/');
          
          // 尝试从组件目录获取文件
          filePath = path.join(__dirname, '..', 'src', 'components', componentName, fileName);
          
          if (!fs.existsSync(filePath)) {
            // 如果组件目录中没有，尝试从当前项目的组件目录
            filePath = path.join(__dirname, 'src', 'components', componentName, fileName);
          }
        }

        // 如果组件目录中没有找到，尝试旧的路径
        if (!filePath || !fs.existsSync(filePath)) {
          // 首先尝试public/results目录
          filePath = path.join(__dirname, 'public/results', req.url);

          // 如果public/results不存在，尝试figma-restoration-mcp-vue-tools/results（保持向后兼容）
          if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'figma-restoration-mcp-vue-tools/results', req.url);
          }
        }

        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);

          if (stat.isFile()) {
            // 设置正确的Content-Type
            if (filePath.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json');
            } else if (filePath.endsWith('.png')) {
              res.setHeader('Content-Type', 'image/png');
            } else if (filePath.endsWith('.md')) {
              res.setHeader('Content-Type', 'text/markdown');
            }

            // 读取并返回文件
            const fileContent = fs.readFileSync(filePath);
            res.end(fileContent);
            return;
          }
        }

        // 如果文件不存在，返回404
        res.statusCode = 404;
        res.end('File not found');
      });

      // 添加中间件来提供figma-restoration-mcp-vue-tools目录的访问
      server.middlewares.use('/figma-restoration-mcp-vue-tools', (req, res, next) => {
        const filePath = path.join(__dirname, 'figma-restoration-mcp-vue-tools', req.url)

        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath)

          if (stat.isFile()) {
            // 设置正确的Content-Type
            if (filePath.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json')
            } else if (filePath.endsWith('.png')) {
              res.setHeader('Content-Type', 'image/png')
            } else if (filePath.endsWith('.md')) {
              res.setHeader('Content-Type', 'text/markdown')
            }

            // 读取并返回文件
            const fileContent = fs.readFileSync(filePath)
            res.end(fileContent)
            return
          }
        }

        // 如果文件不存在，返回404
        res.statusCode = 404
        res.end('File not found')
      })
    }
  },
  build: {
    outDir: 'dist'
  }
})
