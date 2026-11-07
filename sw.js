// Service worker do app "Entrega dos Parceiros".
// Busca sempre a versão mais nova na internet; sem internet, abre a última cópia salva.
const CACHE = 'entregas-parceiros-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png', './Logo Agrícola Estufa Morrinhos.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n)))));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(resp => {
                // Guarda uma cópia (inclui Tailwind, ícones e o gerador de PDF) para funcionar sem internet
                if (resp.ok || resp.type === 'opaque') {
                    const copia = resp.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copia));
                }
                return resp;
            })
            .catch(() => caches.match(e.request)
                .then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : null))
                .then(r => r || Response.error()))
    );
});
