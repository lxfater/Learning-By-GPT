import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
//@ts-ignore
import manifest from './manifest.json' // Node 14 & 16
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), crx({ manifest }),],
  resolve: {
    alias: {
      buffer: 'buffer/',
    }
  },
})
