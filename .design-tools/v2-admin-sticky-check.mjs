// One-off: confirm .admin-bar renders at the top of the viewport (sticky) at 390px.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = join(ROOT, p);
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(8139, '127.0.0.1', r));

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.route('**poet-donations.poetnpo.workers.dev/**', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '{"donations":[],"totalReceived":0,"receivedCount":0,"deals":[],"receivedAmount":0,"receivedCount":0}' }));
await page.addInitScript(() => {
  sessionStorage.setItem('poetAdminToken', 't');
  sessionStorage.setItem('poetAdminUser', 'admin');
});
await page.goto('http://127.0.0.1:8139/admin/');
await page.waitForTimeout(400);
const atTop = await page.evaluate(() => {
  const bar = document.querySelector('.admin-bar');
  const rect = bar.getBoundingClientRect();
  const shell = document.querySelector('.admin-shell').getBoundingClientRect();
  return { barTop: rect.top, barInFlowBeforeShell: rect.bottom <= shell.top + 1, scrollY: window.scrollY };
});
console.log(JSON.stringify(atTop));
// Scrolled state: bar should stick to viewport top.
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(100);
const stuck = await page.evaluate(() => document.querySelector('.admin-bar').getBoundingClientRect().top);
console.log('bar top after scroll:', stuck);
await page.screenshot({ path: 'output/v2-admin-qa/admin-narrow-viewport-top.png' });
await browser.close();
server.close();
