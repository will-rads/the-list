import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = (path) => fileURLToPath(new URL(path, import.meta.url));
const routes = { '/venue': '/venue.html', '/e': '/e.html', '/admin': '/admin.html' };
const legacyRoutes = { '/v1': '/', '/v2': '/', '/v3': '/', '/v2/index': '/', '/v3/index': '/', '/v2/venue': '/venue', '/v3/venue': '/venue', '/v3/e': '/e' };
const cleanUrls = (server) => {
  server.middlewares.use((req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    const legacy = legacyRoutes[url.pathname.replace(/\.html$/, '').replace(/\/$/, '')];
    if (legacy) { res.writeHead(308, { Location: legacy + url.search }); res.end(); return; }
    if (routes[url.pathname]) req.url = routes[url.pathname] + url.search;
    next();
  });
};

export default defineConfig({
  base: './',
  appType: 'mpa',
  publicDir: false,
  server: { watch: { ignored: ['**/ios/**', '**/dist/**'] } },
  plugins: [{
    name: 'app-routes-and-media',
    configureServer: cleanUrls,
    configurePreviewServer: cleanUrls,
    // ponytail: existing runtime media URLs stay intact; no asset import rewrite.
    closeBundle() {
      cpSync(file('assets'), file('dist/assets'), { recursive: true });
      cpSync(file('manifest.webmanifest'), file('dist/manifest.webmanifest'));
    },
  }],
  build: {
    target: 'safari17',
    cssTarget: ['safari17', 'chrome100'],
    rolldownOptions: {
      input: ['index.html', 'venue.html', 'e.html', 'admin.html'].map(file),
    },
  },
});
