import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
let nextN = 1;
for (const f of existing) {
  const m = f.match(/^screenshot-(\d+)/);
  if (m) { const n = parseInt(m[1]); if (n >= nextN) nextN = n + 1; }
}

const filename = label ? `screenshot-${nextN}-${label}.png` : `screenshot-${nextN}.png`;
const out = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));

await page.screenshot({ path: out, fullPage: false });
await browser.close();

console.log(`Saved: ${out}`);
