/* ryania.fr — tableau de bord des statistiques partagées */
(() => {
  'use strict';

  const api = 'https://cloud.umami.is/analytics/eu/api';
  const shareSlug = 'v6Z5ypNT96SaS7nj';
  const period = document.getElementById('stats-period');
  const status = document.getElementById('stats-status');
  const results = document.getElementById('stats-results');
  const number = new Intl.NumberFormat('fr-FR');
  const region = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['fr'], { type: 'region' }) : null;
  const interactions = [
    ['video-lecture', 'Démos lancées'],
    ['video-fin', 'Démos terminées'],
    ['contact-ouverture', 'Ouvertures du formulaire'],
    ['contact-email', 'Clics « Envoyer un mail »'],
  ];
  let activeRequest;

  async function getJson(path, signal, headers) {
    const response = await fetch(api + path, { signal, headers, referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('Umami HTTP ' + response.status);
    return response.json();
  }

  function countryName(code) {
    if (!code) return 'Pays non déterminé';
    return region && /^[a-z]{2}$/i.test(code) ? region.of(code.toUpperCase()) : code;
  }

  function showRows(id, rows) {
    const list = document.getElementById(id);
    list.replaceChildren(...rows.map(([label, value]) => {
      const row = document.createElement('div');
      const name = document.createElement('dt');
      const count = document.createElement('dd');
      name.textContent = label;
      count.textContent = number.format(value);
      row.append(name, count);
      return row;
    }));
    const empty = document.getElementById(id + '-empty');
    if (empty) empty.hidden = rows.length > 0;
  }

  async function load() {
    activeRequest?.abort();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    activeRequest = controller;
    const { signal } = controller;
    const endAt = Date.now();
    const startAt = endAt - Number(period.value) * 86400000;
    const query = new URLSearchParams({ startAt, endAt });
    results.hidden = true;
    status.textContent = 'Chargement des statistiques…';

    try {
      const { websiteId, token } = await getJson('/share/' + shareSlug, signal);
      if (!websiteId || !token) throw new Error('Partage Umami indisponible');
      const path = '/websites/' + encodeURIComponent(websiteId);
      const headers = { 'x-umami-share-context': '1', 'x-umami-share-token': token };
      const metrics = type => getJson(path + '/metrics?' + query + '&type=' + type, signal, headers);
      const [totals, countries, sources, events] = await Promise.all([
        getJson(path + '/stats?' + query, signal, headers),
        metrics('country'), metrics('referrer'), metrics('event'),
      ]);
      if (activeRequest !== controller) return;

      const counts = new Map(events.map(({ x, y }) => [x, y]));
      for (const key of ['visitors', 'visits', 'pageviews']) {
        document.getElementById(key).textContent = number.format(totals[key]);
      }
      document.getElementById('video-starts').textContent = number.format(counts.get('video-lecture') ?? 0);
      showRows('countries', countries.map(({ x, y }) => [countryName(x), y]));
      showRows('sources', sources.map(({ x, y }) => [x || 'Accès direct', y]));
      showRows('interactions', interactions.map(([key, label]) => [label, counts.get(key) ?? 0]));
      results.hidden = false;
      status.textContent = '';
    } catch {
      if (activeRequest === controller) {
        status.textContent = 'Les statistiques sont temporairement indisponibles. Réessayez dans un instant.';
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  period.addEventListener('change', load);
  load();
})();
