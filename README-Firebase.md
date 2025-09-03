# Sistema ERP Sublimaciones Jeziel - Configuración Firebase

## 🚀 Configuración Rápida de Firebase

Este sistema ERP incluye sincronización en la nube con Firebase. Sigue estos pasos para configurarlo:

### 📋 Requisitos Previos
- Cuenta de Google
- Navegador web moderno
- Conexión a internet

### 🔥 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `sublimaciones-jeziel` (o el que prefieras)
4. Acepta los términos y crea el proyecto

### 🌐 Paso 2: Configurar Web App

1. En la página del proyecto, haz clic en el ícono Web `</>`
2. Nombre de la app: "Sublimaciones Jeziel ERP"
3. **NO marques** "También configurar Firebase Hosting"
4. Haz clic en "Registrar app"
5. **COPIA** la configuración que aparece (la necesitarás después)

```javascript
// Ejemplo de configuración que obtendrás:
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "sublimaciones-jeziel.firebaseapp.com",
  projectId: "sublimaciones-jeziel",
  storageBucket: "sublimaciones-jeziel.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 🗄️ Paso 3: Configurar Firestore Database

1. En el menú lateral, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige una ubicación cercana (ej: us-central1)
5. Haz clic en "Listo"

### 🔐 Paso 4: Configurar Reglas de Seguridad

Ve a la pestaña "Reglas" en Firestore y reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a todas las colecciones del ERP
    match /{collection}/{document} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Nota de Seguridad**: Estas reglas permiten acceso completo. Para producción, configura reglas más restrictivas.

### 🔧 Paso 5: Configurar en el Sistema ERP

1. Abre tu sistema ERP
2. Ve a "Configuración" → "Firebase" en el menú lateral
3. Ingresa los datos de tu configuración de Firebase:
   - **API Key**: Tu clave de API
   - **Auth Domain**: proyecto.firebaseapp.com
   - **Project ID**: ID de tu proyecto
   - **Storage Bucket**: proyecto.appspot.com
   - **Messaging Sender ID**: Tu ID de mensajería
   - **App ID**: Tu App ID
4. Haz clic en "Probar Conexión"
5. Si es exitoso, haz clic en "Guardar Configuración"

### ✅ Verificación

Después de configurar Firebase:

1. **Indicador de Estado**: Verás un indicador verde en el dashboard
2. **Sincronización Automática**: Los datos se guardarán automáticamente en la nube
3. **Múltiples Dispositivos**: Podrás acceder desde cualquier navegador
4. **Tiempo Real**: Los cambios se sincronizarán instantáneamente

### 📊 Colecciones de Datos

El sistema creará automáticamente estas colecciones en Firestore:

- `salesData` - Datos de ventas
- `customersData` - Información de clientes
- `inventoryData` - Productos en inventario
- `productionData` - Órdenes de producción
- `purchaseData` - Datos de compras
- `invoiceCounter` - Contador de facturas

### 🔄 Modo Sin Firebase

Si no configuras Firebase, el sistema funcionará perfectamente con localStorage:

- ✅ Todos los módulos funcionan normalmente
- ✅ Datos se guardan localmente en el navegador
- ❌ No hay sincronización entre dispositivos
- ❌ Datos solo disponibles en el navegador usado

### 🛠️ Solución de Problemas

#### Error: "Firebase no disponible"
- Verifica que la configuración sea correcta
- Asegúrate de tener conexión a internet
- Revisa que las reglas de Firestore permitan acceso

#### Error: "Permission denied"
- Verifica las reglas de seguridad en Firestore
- Asegúrate de que las reglas permitan lectura/escritura

#### Los datos no se sincronizan
- Abre la consola del navegador (F12)
- Busca mensajes de error
- Verifica la configuración de Firebase

### 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12) para errores
2. Verifica que todos los campos de configuración estén completos
3. Asegúrate de que Firebase esté configurado correctamente
4. Contacta al desarrollador si persisten los problemas

### 🎯 Beneficios de Firebase

- **☁️ Sincronización en la Nube**: Accede desde cualquier dispositivo
- **🔄 Tiempo Real**: Cambios instantáneos entre usuarios
- **💾 Respaldo Automático**: Tus datos están seguros
- **📱 Multiplataforma**: Funciona en cualquier navegador
- **🚀 Escalable**: Crece con tu negocio

---

¡Disfruta tu Sistema ERP con sincronización en la nube! 🎉
