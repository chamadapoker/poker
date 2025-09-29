// Service Worker para PWA - Sistema POKER 360
const CACHE_NAME = 'poker-360-v1.0.0'
const STATIC_CACHE = 'poker-static-v1'
const DYNAMIC_CACHE = 'poker-dynamic-v1'

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/login',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/',
  '/_next/static/js/'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cache estático aberto')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na instalação:', error)
      })
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída')
        return self.clients.claim()
      })
  )
})

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Estratégia: Cache First para arquivos estáticos
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📱 Service Worker: Servindo do cache:', url.pathname)
            return cachedResponse
          }
          
          // Se não está no cache, buscar da rede
          return fetch(request)
            .then((networkResponse) => {
              // Verificar se a resposta é válida
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse
              }
              
              // Cachear resposta dinâmica
              const responseToCache = networkResponse.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
              
              return networkResponse
            })
            .catch((error) => {
              console.log('🌐 Service Worker: Erro na rede, tentando cache:', error)
              
              // Para páginas, retornar página offline
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html')
              }
              
              // Para outros recursos, retornar erro
              throw error
            })
        })
    )
  }
})

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronização em background:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados offline
      syncOfflineData()
    )
  }
})

// Notificações push
self.addEventListener('push', (event) => {
  console.log('📢 Service Worker: Notificação push recebida')
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Sistema POKER 360', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Clique em notificação:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log('🔄 Service Worker: Sincronizando dados offline...')
    
    // Aqui você pode implementar a lógica para sincronizar
    // dados que foram salvos offline quando a conexão voltar
    
    console.log('✅ Service Worker: Sincronização concluída')
  } catch (error) {
    console.error('❌ Service Worker: Erro na sincronização:', error)
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})
