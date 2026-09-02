const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const times = process.argv.slice(3).map(Number);
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await p.addInitScript(`window.SPEC = ${JSON.stringify(spec)};`);
  await p.goto('file://' + path.resolve(__dirname, 'video.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  for (const t of times) {
    await p.evaluate(x => window.renderAt(x), t);
    await p.screenshot({ path: `/tmp/prev-${t}.png` });
  }
  await b.close(); console.log('ok');
})();
