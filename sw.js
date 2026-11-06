const CORE_CACHE='natura-v6-core';
const PHOTO_CACHE='natura-v6-nature';
const CORE=['./','./index.html','./icon-180.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CORE_CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CORE_CACHE&&k!==PHOTO_CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(u.hostname==='images.unsplash.com'){
  event.respondWith(caches.open(PHOTO_CACHE).then(async c=>{const cached=await c.match(req);if(cached)return cached;try{const res=await fetch(req);if(res.ok||res.type==='opaque')c.put(req,res.clone()).catch(()=>{});return res;}catch(e){return Response.error();}}));return;
 }
 if(u.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CORE_CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});}return res;}).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok)caches.open(CORE_CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});return res;})));
});
