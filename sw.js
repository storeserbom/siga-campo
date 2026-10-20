/* SIGA Campo — funciona sem internet. Troque a VERSAO ao publicar mudanças. */
const VERSAO = 'siga-campo-v1.1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // login Microsoft e OneDrive: sempre pela rede
  if (/microsoftonline\.com|graph\.microsoft\.com/.test(u.hostname)) return;
  // retorno do login (?code=) precisa chegar à página
  if (u.origin === location.origin && u.search) {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // fontes: cache primeiro
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.open(VERSAO).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { c.put(e.request, n.clone()); return n; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  // app: rede primeiro (pega atualização), cache se sem internet
  e.respondWith(fetch(e.request).then(n => { const cp = n.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); return n; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
