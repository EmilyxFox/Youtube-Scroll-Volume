import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import { resolve } from 'node:path';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json'],
      browser: process.env.TARGET ?? 'chrome',
      additionalInputs: ['src/inject.ts'],
    }),
  ],
  resolve: {
    alias: {
      $lib: resolve('./src/lib/'),
      '$lib/*': resolve('./src/lib/*'),
    },
  },
});
