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
        const filePath = path.join(__dirname, 'results', req.url)

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
