const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://yourhomepage.com', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
