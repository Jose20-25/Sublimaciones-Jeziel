# 🔥 Sistema ERP - Sublimaciones Jeziel

## 📋 Descripción

Sistema de Planificación de Recursos Empresariales (ERP) completo diseñado específicamente para **Sublimaciones Jeziel**. Una solución web moderna que integra gestión de inventario, ventas, compras, clientes, proveedores, facturas y más, con sincronización en tiempo real usando Firebase.

---

## ✨ Características Principales

### 📊 **Dashboard Inteligente**
- Panel de control en tiempo real con métricas clave
- Gráficos interactivos con Chart.js
- Estadísticas de ventas, inventario y finanzas
- Actualización automática desde todos los módulos

### 🏢 **Módulos Disponibles**
- **📦 Inventario**: Gestión completa de productos y stock
- **💰 Ventas**: Registro y seguimiento de ventas
- **🛒 Compras**: Control de órdenes de compra y proveedores
- **👥 Clientes**: Base de datos de clientes y seguimiento
- **🏭 Proveedores**: Gestión de proveedores y contactos
- **📄 Facturas**: Creación y gestión de facturas
- **🏭 Producción**: Control de procesos productivos
- **📊 Reportes**: Análisis y reportes detallados
- **💹 Finanzas**: Control financiero y presupuestos
- **📚 Contabilidad**: Registro contable y balances
- **⚙️ Configuración**: Ajustes del sistema
- **🆘 Soporte**: Centro de ayuda y documentación

### 🔥 **Sincronización en la Nube**
- Integración completa con **Firebase**
- Acceso multi-dispositivo y multi-navegador
- Respaldo automático en localStorage
- Sincronización en tiempo real
- Notificaciones de estado de sincronización

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para sincronización con Firebase)
- Servidor web local (opcional, para desarrollo)

### 1. Clonación del Proyecto
```bash
git clone [URL_DEL_REPOSITORIO]
cd "Sublimaciones Jeziel"
```

### 2. Configuración de Firebase
1. Abre el archivo `firebase-config.html`
2. Verifica que las credenciales de Firebase estén configuradas
3. Testa la conexión usando el botón "Probar Conexión"

### 3. Ejecución
```bash
# Opción 1: Servidor local simple
python -m http.server 8000

# Opción 2: Live Server (VS Code)
# Instala la extensión "Live Server" y haz clic derecho en index.html

# Opción 3: Acceso directo
# Abre index.html directamente en tu navegador
```

### 4. Acceso al Sistema
- **URL Principal**: `http://localhost:8000/index.html`
- **Dashboard**: Panel principal con acceso a todos los módulos
- **Configuración**: `firebase-config.html` para ajustes de Firebase

---

## 🎯 Uso del Sistema

### Dashboard Principal
1. Abre `index.html` en tu navegador
2. El dashboard carga automáticamente las estadísticas
3. Usa la barra lateral para navegar entre módulos
4. Las gráficas se actualizan en tiempo real

### Gestión de Datos
1. **Agregar registros**: Usa los botones "+" en cada módulo
2. **Editar**: Haz clic en el icono de edición
3. **Eliminar**: Usa el icono de papelera (con confirmación)
4. **Buscar**: Utiliza los filtros y barra de búsqueda
5. **Exportar**: Descarga datos en formato Excel

### Sincronización
- Los datos se guardan automáticamente en Firebase
- Se muestra una notificación cuando se sincroniza
- Si no hay internet, se usa localStorage como respaldo
- Al reconectar, los datos se sincronizan automáticamente

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsivo con Flexbox y Grid
- **JavaScript ES6+**: Funcionalidad interactiva y async/await
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografía Inter para mejor legibilidad

### Bibliotecas Externas
- **Chart.js 4.4.0**: Gráficos interactivos y responsivos
- **SheetJS**: Exportación a archivos Excel
- **Firebase SDK 10.12.2**: Sincronización en la nube

### Backend/Database
- **Firebase Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Realtime Database**: Actualizaciones en vivo
- **Firebase Authentication**: Seguridad y autenticación
- **LocalStorage**: Respaldo local de datos

---

## 📁 Estructura del Proyecto

```
Sublimaciones Jeziel/
├── index.html                  # Dashboard principal
├── firebase-config.html        # Configuración de Firebase
├── README.md                   # Este archivo
├── logo/
│   └── logo.jpg               # Logo de la empresa
├── js/
│   └── firebase-config.js     # Configuración compartida de Firebase
└── modules/
    ├── inventario.html        # Gestión de inventario
    ├── ventas.html           # Registro de ventas
    ├── compras.html          # Órdenes de compra
    ├── clientes.html         # Base de datos de clientes
    ├── proveedores.html      # Gestión de proveedores
    ├── facturas.html         # Creación de facturas
    ├── produccion.html       # Control de producción
    ├── reportes.html         # Análisis y reportes
    ├── finanzas.html         # Gestión financiera
    ├── contabilidad.html     # Registro contable
    ├── configuracion.html    # Ajustes del sistema
    └── soporte.html          # Centro de ayuda
```

---

## 🔧 Configuración Avanzada

### Variables de Firebase
Edita `js/firebase-config.js` con tus credenciales:

```javascript
const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto.firebaseio.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};
```

### Personalización de Datos
- **Moneda**: Sistema configurado en USD ($)
- **Fecha**: Formato DD/MM/YYYY
- **Números**: Separador de miles con comas
- **Idioma**: Español (es-MX)

---

## 📊 Características de los Módulos

### 📦 Inventario
- ✅ Control de stock mínimo
- ✅ Categorización de productos
- ✅ Códigos automáticos (TEX-001, ALU-001, etc.)
- ✅ Cálculo automático de ganancias
- ✅ Alertas de stock bajo

### 💰 Ventas
- ✅ Registro detallado de ventas
- ✅ Múltiples métodos de pago
- ✅ Cálculo automático de totales
- ✅ Estados de venta (pendiente, completado, cancelado)
- ✅ Actualización automática de inventario

### 🛒 Compras
- ✅ Órdenes de compra automatizadas
- ✅ Seguimiento de estados
- ✅ Integración con proveedores
- ✅ Actualización automática de inventario
- ✅ Control de fechas de entrega

### 👥 Clientes
- ✅ Base de datos completa
- ✅ Clasificación por estado (activo, potencial, inactivo)
- ✅ Información de contacto
- ✅ Historial de compras

### 🏭 Proveedores
- ✅ Gestión de contactos
- ✅ Evaluación de proveedores
- ✅ Control de calidad
- ✅ Información comercial completa

### 📄 Facturas
- ✅ Generación automática de números
- ✅ Cálculo de totales e impuestos
- ✅ Estados de pago
- ✅ Fechas de vencimiento
- ✅ Exportación a PDF

---

## 🔐 Seguridad y Respaldo

### Seguridad de Datos
- Conexión HTTPS con Firebase
- Validación de datos en frontend
- Autenticación Firebase (opcional)
- Reglas de seguridad en Firestore

### Sistema de Respaldo
1. **Primario**: Firebase Cloud Storage
2. **Secundario**: LocalStorage del navegador
3. **Manual**: Exportación a Excel
4. **Automático**: Sincronización en tiempo real

---

## 🚨 Solución de Problemas

### Error de Conexión Firebase
```
❌ Error: No se puede conectar a Firebase
✅ Solución: Verifica tu conexión a internet y credenciales
```

### Datos No Se Sincronizan
```
❌ Error: Los datos no se guardan en la nube
✅ Solución: Revisa la configuración en firebase-config.html
```

### Pantalla en Blanco
```
❌ Error: La página no carga
✅ Solución: Verifica que todos los archivos estén en sus carpetas
```

### Performance Lenta
```
❌ Error: El sistema va lento
✅ Solución: Limpia caché del navegador y reinicia
```

---

## 📈 Roadmap de Desarrollo

### Versión Actual: 1.0.0
- ✅ Dashboard completo con gráficas
- ✅ 12 módulos funcionales
- ✅ Integración Firebase completa
- ✅ Sincronización multi-dispositivo
- ✅ Exportación a Excel

### Próximas Versiones
- 🔄 **v1.1**: Autenticación de usuarios
- 🔄 **v1.2**: Reportes avanzados con filtros
- 🔄 **v1.3**: Notificaciones push
- 🔄 **v1.4**: Aplicación móvil (PWA)
- 🔄 **v1.5**: Integración con APIs externas

---

## 👥 Contribuciones

### Cómo Contribuir
1. Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Reportar Bugs
- Usa el módulo de **Soporte** en el sistema
- Crea un issue en GitHub con detalles
- Incluye capturas de pantalla si es posible

---

## 📞 Soporte y Contacto

### Documentación
- **Manual de Usuario**: Disponible en el módulo Soporte
- **Videos Tutoriales**: En desarrollo
- **FAQ**: Preguntas frecuentes en soporte.html

### Contacto Técnico
- **Email**: soporte@sublimacionesjeziel.com
- **Teléfono**: +503 xxxx-xxxx
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

---

## 📄 Licencia

Este proyecto está licenciado bajo **Uso Interno de Sublimaciones Jeziel**.

### Términos de Uso
- ✅ Uso interno de la empresa
- ✅ Modificaciones para mejoras
- ✅ Respaldo y distribución interna
- ❌ Redistribución comercial externa
- ❌ Uso por terceros sin autorización

---

## 🏆 Créditos

### Desarrollado para
**Sublimaciones Jeziel** - Sistema ERP Personalizado

### Tecnologías Agradecidas
- Firebase Team por la plataforma en la nube
- Chart.js por las gráficas interactivas
- Font Awesome por la iconografía
- Google Fonts por la tipografía

---

## 📋 Changelog

### v1.0.0 (Septiembre 2025)
- 🎉 Lanzamiento inicial
- ✅ Dashboard completo con métricas
- ✅ 12 módulos funcionales
- ✅ Integración Firebase total
- ✅ Sincronización en tiempo real
- ✅ Exportación a Excel
- ✅ Diseño responsivo
- ✅ Notificaciones visuales
- ✅ Sistema de respaldo automático

---

**¡Gracias por usar el Sistema ERP de Sublimaciones Jeziel!** 🚀

Para más información, visita el módulo de **Soporte** dentro del sistema.
