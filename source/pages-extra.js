// GitHub Pages build only: install button, version line, service worker.
(function () {
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var card = document.querySelector('#welcome .card'), status = document.getElementById('engineStatus');
  var btn = document.createElement('button'); btn.className = 'btn big'; btn.id = 'btnInstall'; btn.hidden = true;
  btn.textContent = 'Install as an app on this phone';
  var note = document.createElement('p'); note.style.fontSize = '12px'; note.hidden = true;
  card.insertBefore(btn, status); card.insertBefore(note, status);
  var apk = '__APK__';
  if (apk && /Android/i.test(navigator.userAgent)) { var a = document.createElement('a'); a.className = 'btn big'; a.href = 'android/' + apk; a.textContent = 'Get the Android app (works offline)'; a.style.textDecoration = 'none'; card.insertBefore(a, status); }
  window.TC_WEB_BUILD = '__VERSION__'; // web build stamp, compared by Check for updates
  var vs = document.getElementById('verSub'); if (vs && standalone) vs.textContent += ' · installed';
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
