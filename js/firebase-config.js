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

// Función para inicializar Firebase
function initializeFirebaseShared() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        realtimeDb = firebase.database();
        auth = firebase.auth();
        isFirebaseEnabled = true;
        console.log('✅ Firebase inicializado correctamente');
        console.log('🔥 Proyecto:', firebaseConfig.projectId);
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
        } catch (error) {
            console.warn(`⚠️ Error guardando en Firebase, datos en localStorage: ${collectionName}`, error);
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

// Función para verificar conectividad
function checkFirebaseConnection() {
    return new Promise((resolve) => {
        if (!isFirebaseEnabled || !db) {
            resolve(false);
            return;
        }
        
        // Intentar una operación simple para verificar conexión
        db.collection('_connection_test').limit(1).get()
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

// Inicializar Firebase automáticamente cuando se carga el script
if (typeof firebase !== 'undefined') {
    initializeFirebaseShared();
} else {
    console.warn('⚠️ Firebase SDK no encontrado, funcionando solo con localStorage');
}

// Exportar funciones globalmente
window.firebaseUtils = {
    saveData: saveDataToFirebase,
    loadData: loadDataFromFirebase,
    deleteData: deleteFromFirebase,
    setupListener: setupRealtimeListener,
    notifyDashboard: notifyDashboardUpdate,
    checkConnection: checkFirebaseConnection,
    isEnabled: () => isFirebaseEnabled
};
