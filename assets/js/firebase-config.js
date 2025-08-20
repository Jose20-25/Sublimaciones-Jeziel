// Configuración Firebase para Sublimaciones Jeziel ERP
// Este archivo centraliza la configuración de Firebase para todo el sistema

// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    query,
    orderBy,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBtPEDn8ry5_skz0IjmkDd77ix-sqm5Y8Q",
    authDomain: "sublimaciones-jeziel.firebaseapp.com",
    projectId: "sublimaciones-jeziel",
    storageBucket: "sublimaciones-jeziel.firebasestorage.app",
    messagingSenderId: "83882425003",
    appId: "1:83882425003:web:e61e2f6a75331c69fb15ee"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Clase para manejar las operaciones de Firebase
class FirebaseManager {
    constructor() {
        this.db = db;
        this.collections = {
            clientes: 'clientes',
            ventas: 'ventas',
            inventario: 'inventario',
            compras: 'compras',
            facturas: 'facturas',
            movimientos: 'movimientos_financieros'
        };
    }

    // Obtener todos los documentos de una colección
    async getAll(collectionName) {
        try {
            const querySnapshot = await getDocs(collection(this.db, collectionName));
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            return documents;
        } catch (error) {
            console.error(`Error al obtener ${collectionName}:`, error);
            return [];
        }
    }

    // Agregar un nuevo documento
    async add(collectionName, data) {
        try {
            const docRef = await addDoc(collection(this.db, collectionName), {
                ...data,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            });
            console.log(`Documento agregado con ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error(`Error al agregar a ${collectionName}:`, error);
            throw error;
        }
    }

    // Actualizar un documento existente
    async update(collectionName, docId, data) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                fechaActualizacion: new Date().toISOString()
            });
            console.log(`Documento ${docId} actualizado exitosamente`);
        } catch (error) {
            console.error(`Error al actualizar ${collectionName}:`, error);
            throw error;
        }
    }

    // Eliminar un documento
    async delete(collectionName, docId) {
        try {
            await deleteDoc(doc(this.db, collectionName, docId));
            console.log(`Documento ${docId} eliminado exitosamente`);
        } catch (error) {
            console.error(`Error al eliminar de ${collectionName}:`, error);
            throw error;
        }
    }

    // Obtener un documento específico por ID
    async getById(collectionName, docId) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No se encontró el documento");
                return null;
            }
        } catch (error) {
            console.error(`Error al obtener documento:`, error);
            return null;
        }
    }

    // Escuchar cambios en tiempo real en una colección
    onCollectionChange(collectionName, callback) {
        const q = query(collection(this.db, collectionName), orderBy("fechaCreacion", "desc"));
        return onSnapshot(q, (querySnapshot) => {
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            callback(documents);
        });
    }

    // Migrar datos de localStorage a Firebase
    async migrateFromLocalStorage() {
        try {
            console.log('Iniciando migración de localStorage a Firebase...');
            
            // Migrar cada colección
            const migrations = [
                { key: 'clientesJeziel', collection: this.collections.clientes },
                { key: 'ventasJeziel', collection: this.collections.ventas },
                { key: 'inventarioJeziel', collection: this.collections.inventario },
                { key: 'comprasJeziel', collection: this.collections.compras },
                { key: 'facturasJeziel', collection: this.collections.facturas },
                { key: 'movimientosJeziel', collection: this.collections.movimientos }
            ];

            for (const migration of migrations) {
                const localData = localStorage.getItem(migration.key);
                if (localData) {
                    try {
                        const data = JSON.parse(localData);
                        if (Array.isArray(data) && data.length > 0) {
                            console.log(`Migrando ${data.length} registros de ${migration.key}...`);
                            
                            for (const item of data) {
                                await this.add(migration.collection, item);
                            }
                            
                            console.log(`✅ Migración de ${migration.key} completada`);
                        }
                    } catch (parseError) {
                        console.error(`Error al parsear datos de ${migration.key}:`, parseError);
                    }
                }
            }
            
            console.log('🎉 Migración completada exitosamente');
            
            // Opcional: Limpiar localStorage después de la migración
            if (confirm('¿Desea limpiar los datos locales después de la migración exitosa?')) {
                migrations.forEach(migration => localStorage.removeItem(migration.key));
                console.log('🧹 Datos locales limpiados');
            }
            
        } catch (error) {
            console.error('Error durante la migración:', error);
        }
    }

    // Función de respaldo - guardar en localStorage como backup
    async backupToLocalStorage() {
        try {
            console.log('Creando respaldo en localStorage...');
            
            const backups = [
                { collection: this.collections.clientes, key: 'clientesJeziel_backup' },
                { collection: this.collections.ventas, key: 'ventasJeziel_backup' },
                { collection: this.collections.inventario, key: 'inventarioJeziel_backup' },
                { collection: this.collections.compras, key: 'comprasJeziel_backup' },
                { collection: this.collections.facturas, key: 'facturasJeziel_backup' },
                { collection: this.collections.movimientos, key: 'movimientosJeziel_backup' }
            ];

            for (const backup of backups) {
                const data = await this.getAll(backup.collection);
                localStorage.setItem(backup.key, JSON.stringify(data));
            }
            
            console.log('✅ Respaldo creado exitosamente');
        } catch (error) {
            console.error('Error al crear respaldo:', error);
        }
    }
}

// Crear instancia global de Firebase Manager
const firebaseManager = new FirebaseManager();

// Exportar para uso en otros archivos
window.firebaseManager = firebaseManager;
window.firebaseDb = db;

// Función para mostrar estado de conexión
function mostrarEstadoConexion() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'firebase-status';
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    statusDiv.innerHTML = '<i class="fas fa-cloud"></i> Firebase Conectado';
    document.body.appendChild(statusDiv);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        statusDiv.style.opacity = '0';
        statusDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => statusDiv.remove(), 500);
    }, 3000);
}

// Mostrar estado cuando se carga
document.addEventListener('DOMContentLoaded', () => {
    mostrarEstadoConexion();
});

console.log('🔥 Firebase Manager inicializado correctamente');
console.log('📊 Sublimaciones Jeziel ERP - Sistema de datos en la nube activo');
