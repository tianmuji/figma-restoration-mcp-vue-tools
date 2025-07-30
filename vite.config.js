import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/tools': path.resolve(__dirname, './src/tools')
    }
  },
  server: {
    port: 1932,
    host: true,
    middlewareMode: false
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['@zumer/snapdom'],
    force: true
  },
  define: {
    global: 'globalThis'
  },
  ssr: {
    noExternal: ['@zumer/snapdom']
  },
  // 配置开发服务器中间件
  configureServer(server) {
    // 自定义中间件来处理src/components下的静态文件访问
    server.middlewares.use((req, res, next) => {
      const url = req.url
      
      // 处理src/components路径的静态文件访问
      if (url.startsWith('/src/components/')) {
        const filePath = path.join(__dirname, url)
        
        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath)
          
          if (stat.isFile()) {
            // 设置合适的Content-Type
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes = {
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.md': 'text/markdown'
            }
            
            const contentType = mimeTypes[ext] || 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            res.setHeader('Access-Control-Allow-Origin', '*')
            
            // 读取并发送文件
            const fileContent = fs.readFileSync(filePath)
            res.end(fileContent)
            return
          }
        }
      }
      
      // 处理components路径的简化访问（不带src前缀）
      if (url.startsWith('/components/')) {
        const filePath = path.join(__dirname, 'src', url)
        
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath)
          
          if (stat.isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes = {
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.md': 'text/markdown'
            }
            
            const contentType = mimeTypes[ext] || 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            res.setHeader('Access-Control-Allow-Origin', '*')
            
            const fileContent = fs.readFileSync(filePath)
            res.end(fileContent)
            return
          }
        }
      }
      
      next()
    })
  }
})
