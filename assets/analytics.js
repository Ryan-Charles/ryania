/* ryania.fr — mesure d’audience facultative */
(function () {
  'use strict';

  var websiteId = document.currentScript.dataset.websiteId;
  var settings = document.getElementById('analytics-settings');
  var panel = document.getElementById('analytics-choice');
  var cookieName = 'ryania_analytics';
  var storedChoice = document.cookie.split('; ').find(function (cookie) {
    return cookie.startsWith(cookieName + '=');
  })?.slice(cookieName.length + 1);
  var accepted = storedChoice === 'accepted';
  var tracker;

  function loadTracker() {
    if (tracker) return;

    window.ryaniaAnalyticsBeforeSend = function (type, payload) {
      if (!accepted) return false;
      // Keep the referring site without its URL path or query parameters.
      if (payload.referrer) payload.referrer = new URL(payload.referrer).origin;
      return payload;
    };

    tracker = document.createElement('script');
    tracker.src = 'https://cloud.umami.is/script.js';
    tracker.dataset.websiteId = websiteId;
    tracker.dataset.domains = 'ryania.fr,www.ryania.fr';
    tracker.dataset.excludeSearch = 'true';
    tracker.dataset.excludeHash = 'true';
    tracker.dataset.doNotTrack = 'true';
    tracker.dataset.beforeSend = 'ryaniaAnalyticsBeforeSend';
    document.head.append(tracker);
  }

  settings.hidden = false;
  panel.hidden = storedChoice === 'accepted' || storedChoice === 'refused';
  if (accepted) loadTracker();

  settings.addEventListener('click', function () {
    panel.hidden = false;
    panel.querySelector('button').focus();
  });

  panel.querySelectorAll('[data-analytics-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      var choice = button.dataset.analyticsChoice;
      accepted = choice === 'accepted';
      document.cookie = cookieName + '=' + choice + '; Max-Age=15552000; Path=/; SameSite=Lax; Secure';
      panel.hidden = true;
      if (accepted) loadTracker();
    });
  });
})();
