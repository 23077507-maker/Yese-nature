const CORE_CACHE='natura-core-v2';
const PHOTO_CACHE='natura-photo-v2';
const CORE=['./','./index.html','./icon-180.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CORE_CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>!([CORE_CACHE,PHOTO_CACHE].includes(key))).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.hostname==='images.unsplash.com'){
    event.respondWith(caches.open(PHOTO_CACHE).then(async cache=>{
      const cached=await cache.match(req);
      if(cached)return cached;
      try{const response=await fetch(req);if(response.ok||response.type==='opaque')cache.put(req,response.clone()).catch(()=>{});return response}catch(err){return Response.error()}
    }));return;
  }
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CORE_CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{})}return response}).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok)caches.open(CORE_CACHE).then(cache=>cache.put(req,response.clone())).catch(()=>{});return response})));
});
