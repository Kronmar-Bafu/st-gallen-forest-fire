const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch').default;
const PNG = require('pngjs').PNG;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://visualize.admin.ch/de/v/4lPHCdjPS8Se', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const currentPath = path.join(dir, `screenshot-${timestamp}.png`);
  const diffPath = path.join(dir, `diff-${timestamp}.png`);

  await page.screenshot({ path: currentPath, fullPage: true });
  await browser.close();

  // Find the most recent previous screenshot (excluding the one just created)
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('screenshot-') && f.endsWith('.png') && !f.includes(timestamp))
    .sort(); // ISO timestamps sort chronologically

  const prevFile = files[files.length - 1];
  if (!prevFile) {
    console.log('📸 No previous screenshot to compare. Skipping diff.');
    return;
  }

  const prevPath = path.join(dir, prevFile);

  const img1 = PNG.sync.read(fs.readFileSync(prevPath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));
  const { width, height } = img1;

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1
  });

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  if (numDiffPixels > 0) {
    console.log(`🟥 ${numDiffPixels} pixels changed between ${prevFile} and ${path.basename(currentPath)}.`);
  } else {
    console.log(`✅ No visual changes detected.`);
  }
})();
