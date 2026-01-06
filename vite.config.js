import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 加入這段 server 設定
  server: {
    allowedHosts: [
      'servantless-pecuniarily-lory.ngrok-free.dev'
    ]
  }
})