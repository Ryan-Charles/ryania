/* ryania.fr — public language preference */
(function () {
  'use strict';

  var current = new URL(window.location.href);
  var pageLanguage = document.documentElement.lang;
  var preferenceKey = 'ryania_language';
  var explicit = current.searchParams.get('lang');
  var stored;

  if (explicit === pageLanguage) {
    try { localStorage.setItem(preferenceKey, explicit); } catch (error) { /* Storage can be blocked. */ }
    current.searchParams.delete('lang');
    history.replaceState(history.state, '', current.href);
  } else if (current.pathname === '/' && !current.hash) {
    try { stored = localStorage.getItem(preferenceKey); } catch (error) { /* Use browser preferences. */ }

    var preferred = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    var supported = preferred.map(function (code) {
      return (code || '').toLowerCase().split('-')[0];
    }).find(function (code) { return code === 'en' || code === 'fr'; });

    if (stored === 'en' || (stored !== 'fr' && supported === 'en')) {
      current.pathname = '/en/';
      window.location.replace(current.href);
      return;
    }
  }

  function updateLinks() {
    document.querySelectorAll('[data-language]').forEach(function (link) {
      var target = new URL(link.href);
      target.hash = window.location.hash;
      link.href = target.href;
    });
  }

  document.addEventListener('DOMContentLoaded', updateLinks);
  window.addEventListener('hashchange', updateLinks);
})();
