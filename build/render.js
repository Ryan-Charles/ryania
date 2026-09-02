const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');

const FPS = 24, W = 1280, H = 720;

(async () => {
  const specFile = process.argv[2];
  const outMp4   = process.argv[3];
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const tmp = fs.mkdtempSync('/tmp/frames-');

  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROME || undefined,
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none',
           '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking',
           '--disable-gpu', '--hide-scrollbars', '--mute-audio']
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.route(/^https?:\/\//, r => r.abort());
  await page.addInitScript(`window.SPEC = ${JSON.stringify(spec)};`);
  await page.goto('file://' + path.resolve(__dirname, 'video.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const total = Math.round(spec.duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    await page.screenshot({ path: path.join(tmp, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 94 });
    if (f % 200 === 0) process.stdout.write(`  ${f}/${total}\n`);
  }
  await browser.close();

  // poster = frame at 35% of the flow section
  const posterFrame = Math.round((spec.t.flow[0] + (spec.t.flow[1] - spec.t.flow[0]) * 0.30) * FPS);
  const posterSrc = path.join(tmp, String(posterFrame).padStart(5, '0') + '.jpg');
  const posterOut = outMp4.replace('/videos/', '/posters/').replace('.mp4', '.jpg');
  execSync(`ffmpeg -y -loglevel error -i "${posterSrc}" -vf scale=1280:-1 -q:v 4 "${posterOut}"`);

  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${tmp}/%05d.jpg ` +
    `-vf "scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 23 ` +
    `-pix_fmt yuv420p -movflags +faststart -profile:v high -level 4.0 "${outMp4}"`);

  fs.rmSync(tmp, { recursive: true, force: true });
  const kb = Math.round(fs.statSync(outMp4).size / 1024);
  console.log(`✓ ${path.basename(outMp4)} — ${spec.duration}s, ${kb} Ko`);
})();
