const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://visualize.admin.ch/de/v/4lPHCdjPS8Se', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const filePath = path.join(dir, `screenshot-${timestamp}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await browser.close();
})();
