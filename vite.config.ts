import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bird Poo',
        short_name: 'Bird Poo',
        description: 'Poop on the humans!',
        start_url: '/',
        display: 'fullscreen',
        orientation: 'portrait',
        background_color: '#1a1a1a',
        theme_color: '#1a1a1a',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
