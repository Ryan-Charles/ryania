/* Génère build/artifact.html : page autonome, tout inliné (fonts, css, js, posters, vidéos). */
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const b64 = f => fs.readFileSync(path.join(R, f)).toString('base64');

let css = fs.readFileSync(path.join(R, 'assets/style.css'), 'utf8');
let fonts = fs.readFileSync(path.join(R, 'assets/fonts.css'), 'utf8');
fonts = fonts.replace(/url\(fonts\/([^)]+)\)/g,
  (_, f) => `url(data:font/woff2;base64,${b64('assets/fonts/' + f)})`);
css = css.replace('@import url("fonts.css");', '');

let js = fs.readFileSync(path.join(R, 'assets/app.js'), 'utf8');
let html = fs.readFileSync(path.join(R, 'index.html'), 'utf8');

// corps de page uniquement
html = html.slice(html.indexOf('<div id="rail">'), html.indexOf('<script src="assets/app.js">'));

// médias en data URI (vidéos allégées pour l'aperçu)
html = html.replace(/src="posters\/([^"]+)"/g,
  (_, f) => `src="data:image/jpeg;base64,${b64('posters/' + f)}"`);
html = html.replace(/data-src="videos\/([^"]+)"/g,
  (_, f) => `data-src="data:video/mp4;base64,${b64('build/lo/' + f)}"`);

const out = `<title>ryania — agents IA en production</title>
<style>
:root{color-scheme:light}
${fonts}
${css}
</style>
${html}
<script>${js}<\/script>`;

fs.writeFileSync(path.join(R, 'build/artifact.html'), out);
console.log('artifact.html —', (out.length / 1048576).toFixed(2), 'Mo');
