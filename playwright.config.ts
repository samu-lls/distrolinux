// Testes no navegador de verdade (npm run test:e2e): o site gerado aberto em celulares simulados.
// WebKit é o motor do Safari (todo navegador de iPhone usa ele); Chromium é o do Chrome no Android; Firefox no computador.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4398;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 45_000,
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: `npm run build && node tests/e2e/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'iphone-15', use: { ...devices['iPhone 15'] } },
    { name: 'iphone-se', use: { ...devices['iPhone SE'] } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    // o navegador do dono do site
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
  ],
});
