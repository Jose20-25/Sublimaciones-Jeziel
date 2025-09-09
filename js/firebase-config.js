// Configuración compartida de Firebase para Sublimaciones Jeziel
// Este archivo debe ser incluido en todas las páginas del sistema

// Configuración de Firebase - CREDENCIALES REALES
const firebaseConfig = {
    apiKey: "AIzaSyBtPEDn8ry5_skz0IjmkDd77ix-sqm5Y8Q",
    authDomain: "sublimaciones-jeziel.firebaseapp.com",
    databaseURL: "https://sublimaciones-jeziel-default-rtdb.firebaseio.com",
    projectId: "sublimaciones-jeziel",
    storageBucket: "sublimaciones-jeziel.firebasestorage.app",
    messagingSenderId: "83882425003",
    appId: "1:83882425003:web:2e00bbd7fe3a7e23fb15ee"
};

// Variables globales
let db, realtimeDb, auth;
let isFirebaseEnabled = false;
let realtimeListeners = new Map(); // Para manejar listeners activos
let lastSyncTime = new Map(); // Para evitar loops de sincronización

// Función para inicializar Firebase con listeners automáticos
function initializeFirebaseShared() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        realtimeDb = firebase.database();
        auth = firebase.auth();
        isFirebaseEnabled = true;
        
        console.log('🔥 Firebase inicializado correctamente');
        console.log('� Proyecto:', firebaseConfig.projectId);
        console.log('🌐 Sincronización automática activada');
        
        // Configurar sincronización automática
        setupAutoSync();
        
        return true;
    } catch (error) {
        console.warn('⚠️ Firebase no disponible:', error);
        isFirebaseEnabled = false;
        return false;
    }
}

// Función para guardar datos en Firebase con respaldo a localStorage
async function saveDataToFirebase(collectionName, data, docId = null) {
    // Siempre guardar en localStorage primero
    try {
        const currentData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        
        if (docId) {
            // Actualizar registro existente
            const index = currentData.findIndex(item => item.id === docId);
            if (index !== -1) {
                currentData[index] = { ...data, id: docId };
            } else {
                currentData.push({ ...data, id: docId });
            }
        } else {
            // Nuevo registro
            const newId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            currentData.push({ ...data, id: newId });
            docId = newId;
        }
        
        localStorage.setItem(collectionName, JSON.stringify(currentData));
        console.log(`💾 Datos guardados en localStorage: ${collectionName}`);
        
    } catch (error) {
        console.error('❌ Error guardando en localStorage:', error);
    }

    // Intentar guardar en Firebase si está disponible
    if (isFirebaseEnabled && db) {
        try {
            // Notificar que está sincronizando
            notifySyncStatus(collectionName, 'saving');
            
            if (docId && !docId.startsWith('local_')) {
                // Actualizar documento existente en Firebase
                await db.collection(collectionName).doc(docId).set(data, { merge: true });
                console.log(`☁️ Documento actualizado en Firebase: ${collectionName}/${docId}`);
            } else {
                // Crear nuevo documento en Firebase
                const docRef = await db.collection(collectionName).add(data);
                console.log(`☁️ Nuevo documento creado en Firebase: ${collectionName}/${docRef.id}`);
                
                // Actualizar localStorage con el ID de Firebase
                const currentData = JSON.parse(localStorage.getItem(collectionName) || '[]');
                const localIndex = currentData.findIndex(item => item.id === docId);
                if (localIndex !== -1) {
                    currentData[localIndex].id = docRef.id;
                    localStorage.setItem(collectionName, JSON.stringify(currentData));
                }
                
                return docRef.id;
            }
            
            // Notificar sincronización exitosa
            notifySyncStatus(collectionName, 'saved');
            
        } catch (error) {
            console.warn(`⚠️ Error guardando en Firebase, datos en localStorage: ${collectionName}`, error);
            notifySyncStatus(collectionName, 'error');
        }
    }
    
    return docId;
}

// Función para cargar datos desde Firebase con respaldo de localStorage
async function loadDataFromFirebase(collectionName) {
    let data = [];
    
    if (isFirebaseEnabled && db) {
        try {
            console.log(`📡 Cargando ${collectionName} desde Firebase...`);
            const snapshot = await db.collection(collectionName).get();
            data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Guardar en localStorage como caché
            localStorage.setItem(collectionName, JSON.stringify(data));
            console.log(`✅ ${collectionName} cargado desde Firebase: ${data.length} registros`);
            
        } catch (error) {
            console.warn(`⚠️ Error cargando ${collectionName} desde Firebase, usando localStorage:`, error);
            // Cargar desde localStorage como respaldo
            data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        }
    } else {
        // Cargar desde localStorage
        data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        console.log(`📁 ${collectionName} cargado desde localStorage: ${data.length} registros`);
    }
    
    return data;
}

// Función para eliminar datos
async function deleteFromFirebase(collectionName, docId) {
    // Eliminar de localStorage
    try {
        const currentData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const filteredData = currentData.filter(item => item.id !== docId);
        localStorage.setItem(collectionName, JSON.stringify(filteredData));
        console.log(`🗑️ Registro eliminado de localStorage: ${collectionName}/${docId}`);
    } catch (error) {
        console.error('❌ Error eliminando de localStorage:', error);
    }
    
    // Eliminar de Firebase si está disponible
    if (isFirebaseEnabled && db && !docId.startsWith('local_')) {
        try {
            await db.collection(collectionName).doc(docId).delete();
            console.log(`☁️ Registro eliminado de Firebase: ${collectionName}/${docId}`);
        } catch (error) {
            console.warn(`⚠️ Error eliminando de Firebase: ${collectionName}/${docId}`, error);
        }
    }
}

// Función para configurar listeners en tiempo real
function setupRealtimeListener(collectionName, callback) {
    if (!isFirebaseEnabled || !db) return;
    
    try {
        db.collection(collectionName).onSnapshot((snapshot) => {
            const changes = snapshot.docChanges();
            if (changes.length > 0) {
                console.log(`🔄 Cambios detectados en ${collectionName}:`, changes.length);
                
                // Actualizar localStorage
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                localStorage.setItem(collectionName, JSON.stringify(data));
                
                // Ejecutar callback si se proporciona
                if (callback) callback(data, changes);
            }
        });
        
        console.log(`🔄 Listener en tiempo real configurado para ${collectionName}`);
    } catch (error) {
        console.error(`❌ Error configurando listener para ${collectionName}:`, error);
    }
}

// Función para notificar cambios al dashboard
function notifyDashboardUpdate() {
    try {
        // Múltiples métodos para asegurar notificación
        if (window.parent && window.parent.notifyDashboardUpdate) {
            window.parent.notifyDashboardUpdate();
        }
        if (window.opener && window.opener.notifyDashboardUpdate) {
            window.opener.notifyDashboardUpdate();
        }
        if (window.top && window.top.notifyDashboardUpdate) {
            window.top.notifyDashboardUpdate();
        }
        
        // Evento personalizado
        window.dispatchEvent(new CustomEvent('dashboardUpdate'));
        
        // Trigger de localStorage
        localStorage.setItem('dashboardLastUpdate', Date.now().toString());
        
    } catch (error) {
        console.log('No se pudo notificar al dashboard:', error);
    }
}

// Función para notificar al dashboard sobre cambios de conexión
function notifyDashboardConnectionStatus(isConnected) {
    if (typeof window !== 'undefined') {
        const eventName = isConnected ? 'firebaseConnected' : 'firebaseDisconnected';
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: { timestamp: new Date().toISOString() }
        }));
        console.log(`🔔 Evento enviado: ${eventName}`);
    }
}

// Función para notificar estado de sincronización
function notifySyncStatus(module, status = 'syncing') {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firebaseSyncing', {
            detail: { module, status, timestamp: new Date().toISOString() }
        }));
    }
}

// Función para verificar conectividad
function checkFirebaseConnection() {
    return new Promise((resolve) => {
        if (!isFirebaseEnabled || !db) {
            notifyDashboardConnectionStatus(false);
            resolve(false);
            return;
        }
        
        console.log('🔍 Verificando conexión a Firebase...');
        
        // Intentar una operación simple para verificar conexión
        db.collection('_connection_test').limit(1).get()
            .then(() => {
                console.log('✅ Conexión a Firebase verificada');
                notifyDashboardConnectionStatus(true);
                resolve(true);
            })
            .catch((error) => {
                console.warn('⚠️ Sin conexión a Firebase:', error.message);
                notifyDashboardConnectionStatus(false);
                resolve(false);
            });
    });
}

// Función para configurar sincronización automática mejorada
function setupAutoSync() {
    if (!isFirebaseEnabled) {
        console.log('📱 Trabajando en modo local - Firebase no disponible');
        return;
    }
    
    console.log('🔄 Configurando sincronización automática mejorada...');
    
    // Módulos que requieren sincronización automática
    const syncModules = [
        'ventas',
        'inventario', 
        'clientes',
        'proveedores',
        'compras',
        'facturas'
    ];
    
    syncModules.forEach(module => {
        setupBidirectionalSync(module);
    });
    
    // Configurar heartbeat para mantener conexión
    setupSyncHeartbeat();
    
    console.log('✅ Sincronización automática configurada para todos los módulos');
}

// Función mejorada para configurar sincronización bidireccional
function setupBidirectionalSync(moduleName) {
    try {
        console.log(`🔗 Configurando sync bidireccional para: ${moduleName}`);
        
        // 1. Listener para cambios remotos (Firebase -> Local)
        const unsubscribe = db.collection(moduleName).onSnapshot((snapshot) => {
            if (snapshot.empty) {
                console.log(`📭 No hay datos en Firebase para: ${moduleName}`);
                return;
            }
            
            const firebaseData = [];
            snapshot.forEach((doc) => {
                firebaseData.push({
                    id: doc.id,
                    ...doc.data(),
                    _lastModified: doc.data()._lastModified || Date.now()
                });
            });
            
            // Verificar si hay cambios reales
            const localData = JSON.parse(localStorage.getItem(moduleName) || '[]');
            const lastSync = lastSyncTime.get(moduleName) || 0;
            const now = Date.now();
            
            // Evitar loops de sincronización
            if (now - lastSync < 3000) {
                console.log(`⏸️ Sync pausado para evitar loop: ${moduleName}`);
                return;
            }
            
            // Fusionar datos de ambas fuentes
            const mergedData = mergeDataSources(localData, firebaseData, moduleName);
            
            // Solo actualizar si hay diferencias reales
            if (hasRealChanges(localData, mergedData)) {
                console.log(`🔄 Actualizando ${moduleName} desde Firebase...`);
                localStorage.setItem(moduleName, JSON.stringify(mergedData));
                lastSyncTime.set(moduleName, now);
                
                // Notificar a la interfaz
                notifyInterfaceUpdate(moduleName, mergedData);
                
                // Mostrar notificación
                showSyncNotification(`🔄 ${moduleName} sincronizado desde otro dispositivo`, 'info');
            }
        }, (error) => {
            console.error(`❌ Error en listener de ${moduleName}:`, error);
            showSyncNotification(`⚠️ Error de conexión: ${moduleName}`, 'warning');
        });
        
        // 2. Watcher para cambios locales (Local -> Firebase)
        setupLocalChangeWatcher(moduleName);
        
        // 3. Sincronización inicial
        performInitialSync(moduleName);
        
        // Guardar referencia del listener
        realtimeListeners.set(moduleName, unsubscribe);
        
        console.log(`✅ Sync bidireccional activo para ${moduleName}`);
        
    } catch (error) {
        console.error(`❌ Error configurando sync para ${moduleName}:`, error);
    }
}

// Función para detectar cambios locales
function setupLocalChangeWatcher(moduleName) {
    let lastLocalData = localStorage.getItem(moduleName) || '[]';
    
    // Polling cada 5 segundos para detectar cambios locales
    setInterval(() => {
        const currentLocalData = localStorage.getItem(moduleName) || '[]';
        
        if (currentLocalData !== lastLocalData) {
            console.log(`📤 Cambios locales detectados en ${moduleName}`);
            
            try {
                const parsedData = JSON.parse(currentLocalData);
                syncLocalChangesToFirebase(moduleName, parsedData);
                lastLocalData = currentLocalData;
            } catch (error) {
                console.error(`❌ Error procesando cambios locales: ${moduleName}`, error);
            }
        }
    }, 5000);
    
    // Escuchar eventos personalizados de cambios
    window.addEventListener(`${moduleName}Changed`, (event) => {
        console.log(`🔄 Evento de cambio recibido para ${moduleName}`);
        if (event.detail && Array.isArray(event.detail)) {
            syncLocalChangesToFirebase(moduleName, event.detail);
        }
    });
}

// Función para sincronización inicial
async function performInitialSync(moduleName) {
    try {
        console.log(`🔄 Sincronización inicial para ${moduleName}...`);
        
        const localData = JSON.parse(localStorage.getItem(moduleName) || '[]');
        if (localData.length > 0) {
            // Enviar datos locales a Firebase si no están allí
            await syncLocalChangesToFirebase(moduleName, localData);
        }
        
        // Cargar datos desde Firebase
        const snapshot = await db.collection(moduleName).get();
        const firebaseData = [];
        snapshot.forEach((doc) => {
            firebaseData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (firebaseData.length > 0) {
            const mergedData = mergeDataSources(localData, firebaseData, moduleName);
            localStorage.setItem(moduleName, JSON.stringify(mergedData));
            
            // Notificar a la interfaz
            notifyInterfaceUpdate(moduleName, mergedData);
        }
        
        console.log(`✅ Sincronización inicial completada para ${moduleName}`);
        
    } catch (error) {
        console.error(`❌ Error en sincronización inicial de ${moduleName}:`, error);
    }
}

// Función para fusionar datos de múltiples fuentes
function mergeDataSources(localData, firebaseData, moduleName) {
    try {
        // Crear mapa de elementos por ID para facilitar comparación
        const localMap = new Map(localData.map(item => [item.id, item]));
        const firebaseMap = new Map(firebaseData.map(item => [item.id, item]));
        
        const merged = [];
        const allIds = new Set([...localMap.keys(), ...firebaseMap.keys()]);
        
        allIds.forEach(id => {
            const localItem = localMap.get(id);
            const firebaseItem = firebaseMap.get(id);
            
            if (localItem && firebaseItem) {
                // Ambos existen: usar el más reciente basado en timestamp
                const localModified = localItem._lastModified || 0;
                const firebaseModified = firebaseItem._lastModified || 0;
                
                merged.push(firebaseModified > localModified ? firebaseItem : localItem);
            } else if (firebaseItem) {
                // Solo existe en Firebase
                merged.push(firebaseItem);
            } else if (localItem) {
                // Solo existe localmente: lo enviaremos a Firebase
                merged.push(localItem);
                // Programar sincronización hacia Firebase
                setTimeout(() => {
                    syncLocalChangesToFirebase(moduleName, [localItem]);
                }, 1000);
            }
        });
        
        return merged;
    } catch (error) {
        console.error(`❌ Error fusionando datos para ${moduleName}:`, error);
        return localData; // Fallback a datos locales
    }
}

// Función para verificar si hay cambios reales
function hasRealChanges(data1, data2) {
    try {
        if (data1.length !== data2.length) return true;
        
        const sorted1 = [...data1].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        const sorted2 = [...data2].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        
        return JSON.stringify(sorted1) !== JSON.stringify(sorted2);
    } catch (error) {
        console.error('❌ Error comparando datos:', error);
        return true; // En caso de error, asumir que hay cambios
    }
}

// Función para enviar cambios locales a Firebase
async function syncLocalChangesToFirebase(moduleName, localData) {
    if (!isFirebaseEnabled || !db) return;
    
    try {
        const lastSync = lastSyncTime.get(moduleName) || 0;
        const now = Date.now();
        
        // Evitar loops de sincronización
        if (now - lastSync < 3000) return;
        
        console.log(`📤 Enviando cambios locales de ${moduleName} a Firebase...`);
        
        // Procesar cada elemento
        for (const item of localData) {
            if (!item.id) continue;
            
            const itemWithTimestamp = {
                ...item,
                _lastModified: now
            };
            
            await db.collection(moduleName).doc(item.id.toString()).set(itemWithTimestamp, { merge: true });
        }
        
        lastSyncTime.set(moduleName, now);
        console.log(`✅ Cambios de ${moduleName} sincronizados a Firebase`);
        
    } catch (error) {
        console.error(`❌ Error sincronizando ${moduleName} a Firebase:`, error);
    }
}

// Función para notificar cambios a la interfaz
function notifyInterfaceUpdate(moduleName, newData) {
    // Notificar mediante evento personalizado
    window.dispatchEvent(new CustomEvent(`${moduleName}Updated`, {
        detail: { data: newData, source: 'firebase' }
    }));
    
    // Notificar específicamente a módulos activos
    if (window.location.pathname.includes(moduleName)) {
        // Estamos en el módulo afectado, recargar datos
        if (window.renderTable && typeof window.renderTable === 'function') {
            setTimeout(() => window.renderTable(newData), 100);
        }
        
        if (window.updateStats && typeof window.updateStats === 'function') {
            setTimeout(() => window.updateStats(), 100);
        }
    }
}

// Función para configurar heartbeat de conexión
function setupSyncHeartbeat() {
    setInterval(async () => {
        if (!isFirebaseEnabled) return;
        
        try {
            // Ping simple a Firebase para mantener conexión activa
            await db.collection('_heartbeat').doc('ping').set({
                timestamp: Date.now(),
                source: 'webapp'
            }, { merge: true });
            
            notifyDashboardConnectionStatus(true);
        } catch (error) {
            console.warn('⚠️ Heartbeat falló - posible desconexión:', error);
            notifyDashboardConnectionStatus(false);
        }
    }, 30000); // Cada 30 segundos
}

// Función para mostrar notificaciones de sincronización
function showSyncNotification(message, type = 'info') {
    // Solo mostrar si estamos en el dashboard o en un módulo
    if (typeof document === 'undefined') return;
    
    const notification = document.createElement('div');
    notification.className = `sync-notification sync-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        border-radius: 5px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        ${type === 'success' ? 'background: #4CAF50;' : 
          type === 'error' ? 'background: #f44336;' : 
          'background: #2196F3;'}
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation' : 'fa-sync fa-spin'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para forzar sincronización de un módulo específico
async function forceSyncModule(moduleName) {
    if (!isFirebaseEnabled) {
        console.warn('Firebase no está habilitado');
        return false;
    }
    
    try {
        console.log(`🔄 Forzando sincronización de: ${moduleName}`);
        
        // Obtener datos locales
        const localData = JSON.parse(localStorage.getItem(moduleName) || '[]');
        
        if (localData.length === 0) {
            console.log(`📭 No hay datos locales para: ${moduleName}`);
            return true;
        }
        
        // Guardar todos los datos en Firebase
        const batch = db.batch();
        
        localData.forEach((item, index) => {
            const docRef = db.collection(moduleName).doc(`${moduleName}_${Date.now()}_${index}`);
            batch.set(docRef, {
                ...item,
                lastModified: new Date().toISOString(),
                syncSource: 'local'
            });
        });
        
        await batch.commit();
        console.log(`✅ Sincronización forzada completada para: ${moduleName}`);
        
        showSyncNotification(`🔄 ${moduleName} sincronizado forzosamente`, 'success');
        return true;
        
    } catch (error) {
        console.error(`❌ Error en sincronización forzada de ${moduleName}:`, error);
        showSyncNotification(`❌ Error sincronizando ${moduleName}`, 'error');
        return false;
    }
}

// Inicializar Firebase automáticamente cuando se carga el script
if (typeof firebase !== 'undefined') {
    initializeFirebaseShared();
    
    // Configurar sincronización automática después de la inicialización
    setTimeout(() => {
        if (isFirebaseEnabled) {
            setupAutoSync();
            console.log('🔄 Sistema de auto-sincronización iniciado');
            showSyncNotification('🌐 Sincronización automática activada', 'success');
        }
    }, 1000);
} else {
    console.warn('⚠️ Firebase SDK no encontrado, funcionando solo con localStorage');
}

// Escuchar cambios en localStorage para sincronizar a Firebase
function setupBidirectionalSync() {
    window.addEventListener('storage', async (e) => {
        // Solo procesar cambios de módulos conocidos
        const modules = ['ventas', 'inventario', 'clientes', 'proveedores', 'compras', 'facturas'];
        
        if (modules.includes(e.key) && e.newValue !== e.oldValue) {
            console.log(`🔄 Detectado cambio local en: ${e.key}`);
            
            try {
                const data = JSON.parse(e.newValue || '[]');
                await saveDataToFirebase(e.key, data);
                console.log(`✅ Cambio local sincronizado a Firebase: ${e.key}`);
            } catch (error) {
                console.error(`❌ Error sincronizando ${e.key} a Firebase:`, error);
            }
        }
    });
}

// Función para resolver conflictos de datos
function resolveDataConflicts(localData, firebaseData, moduleName) {
    try {
        // Si no hay datos locales, usar Firebase
        if (!localData || localData.length === 0) {
            return firebaseData;
        }
        
        // Si no hay datos en Firebase, usar locales
        if (!firebaseData || firebaseData.length === 0) {
            return localData;
        }
        
        // Comparar por timestamp de última modificación
        const localLatest = Math.max(...localData.map(item => 
            new Date(item.lastModified || item.fecha || '1970-01-01').getTime()
        ));
        
        const firebaseLatest = Math.max(...firebaseData.map(item => 
            new Date(item.lastModified || item.fecha || '1970-01-01').getTime()
        ));
        
        console.log(`🔍 Resolviendo conflicto ${moduleName}: Local=${new Date(localLatest)}, Firebase=${new Date(firebaseLatest)}`);
        
        // Usar el conjunto de datos más reciente
        if (firebaseLatest > localLatest) {
            console.log(`🔄 Usando datos de Firebase para ${moduleName} (más recientes)`);
            return firebaseData;
        } else {
            console.log(`🔄 Usando datos locales para ${moduleName} (más recientes)`);
            // Sincronizar datos locales a Firebase
            setTimeout(() => saveDataToFirebase(moduleName, localData), 500);
            return localData;
        }
        
    } catch (error) {
        console.error(`❌ Error resolviendo conflicto para ${moduleName}:`, error);
        // En caso de error, usar datos locales como fallback
        return localData || [];
    }
}

// Inicializar sincronización bidireccional
setTimeout(() => {
    setupBidirectionalSync();
    console.log('🔗 Sincronización bidireccional activada');
}, 2000);

// Exportar funciones globalmente
window.firebaseUtils = {
    saveData: saveDataToFirebase,
    loadData: loadDataFromFirebase,
    deleteData: deleteFromFirebase,
    setupListener: setupRealtimeListener,
    notifyDashboard: notifyDashboardUpdate,
    checkConnection: checkFirebaseConnection,
    forceSyncModule: forceSyncModule,
    showSyncNotification: showSyncNotification,
    resolveConflicts: resolveDataConflicts,
    setupBidirectionalSync: setupBidirectionalSync,
    isEnabled: () => isFirebaseEnabled,
    getListeners: () => realtimeListeners,
    getSyncStatus: () => lastSyncTime
};
