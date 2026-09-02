const fs = require('fs');

function timeline(nSteps) {
  const PER = 3.0;
  const t = { title: [0, 3.4], prob: [3.4, 8.2], flow: [8.2, 8.2 + nSteps * PER] };
  t.end = [t.flow[1], t.flow[1] + 7.6];
  return { t, duration: +(t.end[1]).toFixed(2) };
}

const specs = {};

/* ─────────────────────────────  01 — SAV Acose  ───────────────────────────── */
specs['agent-sav'] = {
  num: '01',
  bar: 'Acose — agent service client',
  name: "L’agent qui répond<br>au service client",
  sub: "Il lit l’e-mail, retrouve la commande dans Shopify, interroge le transporteur, écrit la réponse et l’envoie. Sans relecture humaine.",
  chips: ['Acose · e-commerce', '30 nœuds', 'En production'],
  problem: {
    eyebrow: 'Avant',
    text: "Chaque « où est mon colis ? » obligeait à ouvrir trois outils, retrouver la commande, puis réécrire à la main la même réponse.",
    metrics: [
      { v: '3', k: 'outils à croiser par e-mail' },
      { v: '7 j/7', k: 'week-ends compris' },
      { v: '0', k: 'réponse la nuit' }
    ]
  },
  steps: [
    { kind: 'Déclencheur', node: 'Gmail Trigger', title: "Un e-mail arrive dans la boîte support",
      sub: "L’agent se réveille sur chaque nouveau message, jour et nuit.",
      data: 'de : <b>c.mercier@…</b> · objet : « Toujours rien reçu ? »' },
    { kind: 'Mémoire', node: 'Historique client', title: "Il relit d’abord ce qu’on a déjà répondu",
      sub: "Six derniers échanges sur 30 jours, dans les deux sens, corbeille comprise.",
      data: '4 messages retrouvés · dernière réponse Acose : <b>il y a 2 jours</b>' },
    { kind: 'Garde-fou', node: 'Contrôle doublon', title: "Si sa réponse serait la même que la dernière, il n’envoie rien",
      sub: "Le message reste non lu, pour un humain. Cette règle prime sur toutes les autres.",
      data: 'réponse rédigée ≠ dernier envoi → <b>on continue</b>' },
    { kind: 'Lecture', node: 'Shopify — commande', title: "Il retrouve la commande dans Shopify",
      sub: "Un routeur en lecture seule regroupe quatre recherches derrière un seul outil. Aucun mouvement d’argent possible ici.",
      data: '#10428 · payée le 14 août · <b>expédiée</b> · suivi disponible' },
    { kind: 'Suivi', node: '17track', title: "Il interroge le transporteur en direct",
      sub: "Enregistrement du numéro, attente, puis lecture du statut réel du colis.",
      data: 'DOFR9010142051814HD · <b>en cours d’acheminement</b> · 18 JUIN 2026' },
    { kind: 'Décision', node: 'Classement du cas', title: "Il identifie le scénario exact",
      sub: "Suivi, annulation, remboursement, changement d’adresse, quantité, colis perdu… ou hors périmètre.",
      data: 'cas retenu : <b>suivi de colis · retard transporteur</b>' },
    { kind: 'Rédaction', node: 'Modèles Acose', title: "Il écrit avec les mots de la marque",
      sub: "Modèles maison, mise en forme imposée, signature fixe. Aucune improvisation de ton.",
      data: '« Bonjour Camille, votre colis est bien parti… » — <b>Loïc, service client</b>' },
    { kind: 'Action', node: 'Gmail — répondre', title: "La réponse part",
      sub: "Pas de file d’attente, pas de validation. Le client a sa réponse avant d’avoir relancé.",
      data: 'envoyé · <b>13 s</b> après réception' },
    { kind: 'Classement', node: 'Gmail — corbeille', title: "Le fil est archivé, la boîte reste vide",
      sub: "Uniquement quand la conversation est réellement terminée. Sinon le message reste visible.",
      data: 'fil archivé · boîte support : <b>0 en attente</b>' }
  ],
  result: {
    text: "Le service client tourne seul. Ryan n’ouvre la boîte que pour les cas qu’on lui a laissés exprès.",
    metrics: [
      { v: '58', k: 'exécutions en 7 jours' },
      { v: '0', k: 'échec sur la période' },
      { v: '13 s', k: 'délai de réponse type' }
    ],
    line: "Litige, menace, chargeback, ou simple doute sur la marche à suivre : l’agent ne touche à rien et laisse le message non lu. Ce sont les seuls que Ryan traite."
  }
};

/* ─────────────────────────────  02 — SEO Acose  ───────────────────────────── */
specs['agent-seo'] = {
  num: '02',
  bar: 'Acose — agent éditorial SEO',
  name: "L’agent qui écrit<br>et publie le blog",
  sub: "Deux articles par semaine sur la boutique : maillage interne, métadonnées, données structurées, illustration. Personne ne touche au clavier.",
  chips: ['Acose · e-commerce', '17 nœuds', 'Lundi + jeudi, 4 h'],
  problem: {
    eyebrow: 'Avant',
    text: "Un silo SEO ne se joue pas au premier article. Il se joue au cinquantième : doublons, cannibalisation, pages orphelines.",
    metrics: [
      { v: '2/sem', k: 'cadence à tenir' },
      { v: '~50', k: 'articles déjà en ligne' },
      { v: '0', k: 'doublon toléré' }
    ]
  },
  steps: [
    { kind: 'Déclencheur', node: 'Schedule', title: "Lundi et jeudi, 4 h du matin",
      sub: "Deux créneaux fixes. La cadence ne dépend plus de la motivation de personne.",
      data: 'cron 0 4 * * MON · 0 4 * * THU' },
    { kind: 'File', node: 'Google Sheets', title: "Il prend le prochain sujet de la file",
      sub: "Une ligne au statut « à publier », avec son mot-clé, son cluster et son intention de recherche.",
      data: 'sujet : « cafards dans les placards de cuisine » · intention <b>MOFU</b>' },
    { kind: 'Contexte', node: 'Shopify Articles', title: "Il charge tout ce qui est déjà publié",
      sub: "Titres, handles et tags de l’intégralité du blog, à chaque exécution.",
      data: '49 articles chargés' },
    { kind: 'Garde-fou', node: 'Anti-doublon', title: "Il compare le sujet à l’existant, par le sens",
      sub: "Similarité Jaccard + couverture du mot-clé, calibrée sur les articles réellement publiés : 8 doublons connus sur 8 détectés, aucun faux positif.",
      data: 'score 0,31 · seuil 0,62 → <b>sujet validé</b>' },
    { kind: 'Maillage', node: 'Sélection des liens', title: "Il choisit les articles à citer",
      sub: "Les plus proches sémantiquement, sans jamais reprendre le pilier ni un quasi-doublon.",
      data: '4 liens internes retenus · pilier : « se débarrasser des cafards »' },
    { kind: 'Rédaction', node: 'GPT · JSON strict', title: "Il rédige sous douze règles éditoriales",
      sub: "Longueur pilotée par l’intention, aucun chiffre hors fiche produit, aucune marque concurrente, sortie en schéma JSON strict.",
      data: '1 420 mots · FAQ 4 questions · seo_title 58 caractères' },
    { kind: 'Contrôle', node: 'Assemblage', title: "Il corrige ce que le modèle fait mal",
      sub: "H1 en trop supprimés, handle rendu unique, URL produit transformée en vrai lien, phrases d’assistant effacées. Puis JSON-LD Article, FAQPage et BreadcrumbList.",
      data: '1 H1 retiré · handle unique · <b>3 blocs de données structurées</b>' },
    { kind: 'Visuel', node: 'gpt-image-2', title: "Il produit l’illustration",
      sub: "Photographie réaliste, intérieur français, lumière naturelle. Aucun texte, aucun logo, aucune personne identifiable.",
      data: '1536 × 1024 · attachée à l’article' },
    { kind: 'Publication', node: 'Shopify', title: "L’article part en ligne",
      sub: "Puis les vraies balises SEO sont écrites dans les métafields, pas seulement dans le corps de page.",
      data: 'publié · <b>global.title_tag</b> + <b>global.description_tag</b>' },
    { kind: 'Indexation', node: 'Page pilier', title: "Il accroche l’article à la page la plus crawlée",
      sub: "Le lien est injecté dans le hub du pilier. C’est le principal levier de découverte par Google, et la ligne est ensuite consignée dans le journal.",
      data: 'pilier mis à jour · <b>+1 lien entrant</b> · journal complété' }
  ],
  result: {
    text: "Le silo grandit tout seul, sans doublon et sans page orpheline.",
    metrics: [
      { v: '~45 s', k: 'pour un article complet' },
      { v: '2/sem', k: 'sans interruption' },
      { v: '0', k: 'intervention humaine' }
    ],
    line: "Si le sujet ressemble trop à un article déjà en ligne, rien n’est publié : la ligne est marquée « doublon ignoré », avec le score et l’article en cause. Mieux vaut ne rien publier qu’ajouter une page qui cannibalise."
  }
};

/* ────────────────────  03 — Facebook agent immobilier  ──────────────────── */
specs['agent-facebook'] = {
  num: '03',
  bar: 'Agent immobilier indépendant — Martinique',
  name: "L’agent qui alimente<br>la page Facebook",
  sub: "Deux publications par semaine : un contenu pédagogique le mercredi, un bien réel le dimanche. Rien à préparer, rien à programmer.",
  chips: ['Immobilier · Martinique', '35 nœuds', '2 créneaux / semaine'],
  problem: {
    eyebrow: 'Avant',
    text: "Un agent immobilier qui publie régulièrement prend l’avantage. Sauf qu’entre deux visites, personne n’ouvre Canva le dimanche matin.",
    metrics: [
      { v: '2/sem', k: 'cadence attendue' },
      { v: '0 h', k: 'disponible pour la produire' },
      { v: '1', k: 'page qui s’éteint dès qu’on arrête' }
    ]
  },
  steps: [
    { kind: 'Déclencheur', node: 'Deux Schedule', title: "Mercredi 5 h, dimanche 10 h",
      sub: "Deux créneaux, deux formats radicalement différents dans le même scénario.",
      data: 'mercredi → pédagogique · dimanche → annonce' },
    { kind: 'Ciblage', node: 'Semaine paire', title: "Une semaine sur deux, il change de public",
      sub: "Semaine paire : les acheteurs. Semaine impaire : les vendeurs. La page ne parle jamais à tout le monde en même temps.",
      data: 'semaine 36 → <b>ACHETEURS</b>' },
    { kind: 'Rédaction', node: 'GPT', title: "Il écrit un post d’actualité immobilière",
      sub: "Marché France et Martinique, données de l’année en cours uniquement, jamais de markdown — Facebook ne l’interprète pas.",
      data: '5 points structurés · 8 hashtags · téléphone du conseiller' },
    { kind: 'Visuel', node: 'gpt-image-2', title: "Il génère l’illustration à la charte",
      sub: "Flat design, fond blanc, accent orange de l’enseigne.",
      data: '1024 × 1024 · <b>zéro texte dans l’image</b>' },
    { kind: 'Source', node: 'Page conseiller', title: "Le dimanche, il va chercher les biens réels",
      sub: "Il lit la page publique du conseiller et en extrait les annonces actuellement en ligne.",
      data: '7 annonces actives détectées' },
    { kind: 'Mémoire', node: 'Table n8n', title: "Il écarte ce qui a déjà été publié",
      sub: "La liste vit dans une table n8n, pas dans la mémoire du scénario : elle survit à un ré-import du workflow.",
      data: '5 biens déjà passés → <b>1 bien retenu</b>' },
    { kind: 'Extraction', node: 'Parsing fiche', title: "Il lit la fiche du bien",
      sub: "Titre, prix, ville, description — et seulement les photos dont l’URL porte l’identifiant du bien.",
      data: '9 photos · les « biens qui pourraient vous plaire » sont écartées' },
    { kind: 'Rédaction', node: 'GPT', title: "Il écrit l’annonce",
      sub: "Phrases courtes, cinq emojis maximum, numéro de téléphone systématique, jamais de WhatsApp.",
      data: 'légende + hashtags prêts pour Facebook' },
    { kind: 'Publication', node: 'Graph API', title: "Le carrousel est publié",
      sub: "Chaque photo est envoyée sans être publiée, puis toutes sont rattachées au même post. Les échecs d’upload sont filtrés avant l’envoi.",
      data: '9 photos → <b>1 carrousel</b> · visite vidéo publiée si elle existe' },
    { kind: 'Journal', node: 'Table n8n', title: "Le bien est marqué comme posté",
      sub: "URL, identifiant du post Facebook, créneau et horodatage. Quand tous les biens sont passés, la rotation reprend au premier.",
      data: 'enregistré · <b>0 bien publié deux fois</b>' }
  ],
  result: {
    text: "La page publie sans lui, avec ses biens réels et son numéro. Il reprend la main quand il veut.",
    metrics: [
      { v: '2', k: 'posts par semaine' },
      { v: '0', k: 'bien publié deux fois' },
      { v: '35', k: 'nœuds orchestrés' }
    ],
    line: "La difficulté n’était pas de publier sur Facebook. C’était de garantir qu’on ne republie jamais le même bien, même après un ré-import complet du scénario."
  }
};

/* ────────────────────────  04 — Instagram SOS Thierry  ──────────────────── */
specs['agent-instagram'] = {
  num: '04',
  bar: 'SOS Thierry — Guyane · Instagram',
  name: "L’agent qui prépare<br>les posts Instagram",
  sub: "Il regarde les photos de chantier, choisit, retouche si nécessaire, écrit la légende et dépose le brouillon dans Notion. Le client valide et publie.",
  chips: ['Travaux publics · Guyane', '27 nœuds', 'Lot hebdomadaire'],
  problem: {
    eyebrow: 'Avant',
    text: "Une entreprise de terrassement a des centaines de photos de chantier dans un téléphone, et aucune minute pour en faire du contenu.",
    metrics: [
      { v: '5', k: 'piliers éditoriaux à couvrir' },
      { v: '0', k: 'temps disponible' },
      { v: '1', k: 'compte qui ne bouge pas' }
    ]
  },
  steps: [
    { kind: 'Déclencheur', node: 'Schedule', title: "Lundi, minuit : la semaine se prépare",
      sub: "Un lot complet est produit d’un coup, pas un post à la fois.",
      data: 'lot hebdomadaire' },
    { kind: 'Source', node: 'Notion', title: "Il ouvre la banque de photos du client",
      sub: "Les vraies photos de chantier, déposées par l’entreprise au fil des interventions.",
      data: 'content bank Notion' },
    { kind: 'Vision', node: 'GPT vision', title: "Il regarde vraiment chaque photo",
      sub: "Le modèle décrit la scène, identifie le matériel et dit si l’image est exploitable telle quelle.",
      data: 'mini-pelle · tranchée · végétation dense · <b>à compléter : oui</b>' },
    { kind: 'Éditorial', node: 'Rotation piliers', title: "Il choisit le pilier de la semaine",
      sub: "Mini-pelle avec chauffeur, déboisement, tranchées et réseaux, préparation de terrain, clôture.",
      data: 'pilier retenu : <b>tranchées et réseaux</b>' },
    { kind: 'Rédaction', node: 'Agent', title: "Il écrit la légende",
      sub: "Le vocabulaire du métier, pas celui d’une agence. Une intervention concrète, un bénéfice clair, un appel à contacter.",
      data: 'légende prête à copier' },
    { kind: 'Visuel', node: 'Trois voies', title: "Photo brute, photo retouchée ou image générée",
      sub: "La photo du client passe en priorité. Retouche seulement si la vision l’a jugée incomplète. Génération en dernier recours.",
      data: 'voie retenue : <b>photo du client, retouchée une fois</b>' },
    { kind: 'Formatage', node: 'Cloudinary', title: "Il recadre au format du fil",
      sub: "Cadrage automatique sur le sujet, ratio Instagram, qualité optimisée.",
      data: 'ratio 4:5 · recadrage sur le sujet détecté' },
    { kind: 'Livraison', node: 'Notion', title: "Le brouillon atterrit chez le client",
      sub: "Statut « brouillon prêt », légende copiable, image finale. Rien n’est publié sans lui.",
      data: 'page créée · statut <b>Brouillon prêt</b>' },
    { kind: 'Journal', node: 'Table n8n', title: "Il consigne ce qui a été préparé",
      sub: "Thème, titre, légende, image et créneau prévu — pour ne jamais repasser deux fois sur le même angle.",
      data: 'lot enregistré' }
  ],
  result: {
    text: "Le client ouvre Notion le lundi et trouve sa semaine de contenu prête, faite avec ses vraies photos de chantier.",
    metrics: [
      { v: '1 lot', k: 'préparé chaque semaine' },
      { v: '0', k: 'publication sans validation' },
      { v: '5', k: 'piliers en rotation' }
    ],
    line: "C’est un agent volontairement bridé : il prépare, il ne publie pas. Sur le compte d’une entreprise de métier, la validation humaine vaut mieux qu’une cadence parfaite."
  }
};

for (const [k, s] of Object.entries(specs)) {
  Object.assign(s, timeline(s.steps.length));
  fs.writeFileSync(__dirname + '/spec-' + k + '.json', JSON.stringify(s, null, 1));
  console.log(k, s.steps.length + ' étapes', s.duration + 's');
}
