// GitHub Pages build only: install button, version line, service worker.
(function () {
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var card = document.querySelector('#welcome .card'), status = document.getElementById('engineStatus');
  var btn = document.createElement('button'); btn.className = 'btn big'; btn.id = 'btnInstall'; btn.hidden = true;
  btn.textContent = 'Install as an app on this phone';
  var note = document.createElement('p'); note.style.fontSize = '12px'; note.hidden = true;
  card.insertBefore(btn, status); card.insertBefore(note, status);
  var ver = document.createElement('p'); ver.style.cssText = 'font-size:11px;opacity:.7';
  ver.textContent = 'Version __VERSION__' + (standalone ? ' · running as installed app' : '');
  card.appendChild(ver);
  var deferred = null;
  function done() { btn.hidden = true; note.textContent = 'Installed. Open “Tesseract CAD” from your home screen or app drawer.'; note.hidden = false; }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (!standalone) btn.hidden = false; });
  window.addEventListener('appinstalled', done);
  btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function (r) { deferred = null; if (r && r.outcome === 'accepted') done(); else btn.hidden = true; });
  });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
