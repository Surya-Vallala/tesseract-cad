// Tesseract CAD Tools — offline cache.
// Pages and scripts: network first (so updates show up), cache as fallback.
// The 9 MB DWG engine (.wasm): cache first, refreshed whenever the version changes.
const VERSION = '__VERSION__';
const CACHE = 'tct-' + VERSION;
const CORE = ['./', 'index.html', 'cad-worker.js', 'libredwg-web.wasm', 'manifest.webmanifest', 'icon-192.png', 'logo-ink-dark.png', 'logo-ink-light.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tct-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Files shared from other apps (WhatsApp, Files, Gmail…) arrive as a POST to ./share-target (manifest share_target).
// They wait in the 'share-inbox' cache (not a tct- cache, so a version change does not wipe them) until the page picks them up.
const INBOX = 'share-inbox';
async function receiveShare(req) {
  const home = new URL('./?app=1', self.registration.scope);
  try {
    const fd = await req.formData(); const files = fd.getAll('file').filter(f => f && typeof f !== 'string');
    const c = await caches.open(INBOX); for (const k of await c.keys()) await c.delete(k);
    let n = 0; for (const f of files) await c.put(new URL('./shared/' + (n++), self.registration.scope).href, new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream', 'X-Name': encodeURIComponent(f.name || ''), 'X-Type': encodeURIComponent(f.type || '') } }));
    home.searchParams.set('share', String(n));
  } catch (err) { home.searchParams.set('share', 'err'); }
  return Response.redirect(home.href, 303);
}
self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share-target')) { e.respondWith(receiveShare(req)); return; }
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin) return; // fonts etc. go straight to the network
  if (url.pathname.endsWith('.wasm')) {
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith(fetch(req).then(r => { if (r.ok && !url.searchParams.has('share')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
