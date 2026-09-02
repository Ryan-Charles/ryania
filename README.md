# ryania.fr

Site portfolio statique — agents IA & automatisations n8n.
Aucune dépendance, aucun build : ce sont des fichiers à servir tels quels.

```
index.html          la page
assets/             style.css, app.js, fonts/ (auto-hébergées)
videos/             4 démonstrations MP4 (H.264, 1280×720, sans son)
posters/            vignettes des vidéos
CNAME               domaine personnalisé (GitHub Pages)
```

## Déploiement — GitHub Pages (gratuit, HTTPS inclus)

1. Créer un dépôt **public** nommé `ryania` sur le compte GitHub.
2. Y pousser le contenu de ce dossier sur la branche `main`.
3. Repo → *Settings* → *Pages* → Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
4. Dans *Custom domain*, saisir `ryania.fr`, puis cocher *Enforce HTTPS* (disponible une fois le DNS propagé).

## DNS chez le registrar de ryania.fr

| Type  | Nom   | Valeur                |
|-------|-------|-----------------------|
| A     | @     | 185.199.108.153       |
| A     | @     | 185.199.109.153       |
| A     | @     | 185.199.110.153       |
| A     | @     | 185.199.111.153       |
| CNAME | www   | <compte>.github.io.   |

Propagation : de quelques minutes à quelques heures. Le certificat HTTPS est émis automatiquement ensuite.

## Autres hébergeurs gratuits

Le dossier fonctionne tel quel sur Cloudflare Pages, Netlify ou Vercel :
glisser-déposer le dossier, aucune commande de build, dossier de publication = racine.

## Modifier les vidéos

Le moteur de rendu est dans `build/` :

```bash
npm install
node build/specs.js                                   # regénère les scénarios
node build/render.js build/spec-agent-sav.json videos/agent-sav.mp4
```

Les textes de chaque vidéo se modifient dans `build/specs.js`.
