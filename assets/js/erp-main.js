// Inicializador principal para todos los servicios Firebase
// Este archivo debe cargarse en todas las páginas que usen Firebase

class JezielERP {
    constructor() {
        this.servicios = {};
        this.inicializado = false;
        this.migrationCompleted = false;
    }

    // Inicializar todos los servicios
    async inicializar() {
        try {
            console.log('🚀 Inicializando Jeziel ERP con Firebase...');
            
            // Esperar a que Firebase esté listo
            await this.esperarFirebase();
            
            // Registrar servicios disponibles
            this.registrarServicios();
            
            // Configurar listeners globales
            this.configurarListeners();
            
            this.inicializado = true;
            console.log('✅ Jeziel ERP inicializado correctamente');
            
            // Verificar si necesita migración
            await this.verificarMigracion();
            
        } catch (error) {
            console.error('❌ Error al inicializar Jeziel ERP:', error);
            this.mostrarError('Error al conectar con Firebase. Trabajando en modo offline.');
        }
    }

    // Esperar a que Firebase esté disponible
    async esperarFirebase() {
        return new Promise((resolve, reject) => {
            let intentos = 0;
            const maxIntentos = 10;
            
            const verificar = () => {
                if (window.firebaseManager) {
                    resolve();
                } else if (intentos >= maxIntentos) {
                    reject(new Error('Timeout esperando Firebase'));
                } else {
                    intentos++;
                    setTimeout(verificar, 500);
                }
            };
            
            verificar();
        });
    }

    // Registrar todos los servicios disponibles
    registrarServicios() {
        if (window.inventarioService) {
            this.servicios.inventario = window.inventarioService;
            console.log('📦 Servicio de Inventario registrado');
        }
        
        if (window.clientesService) {
            this.servicios.clientes = window.clientesService;
            console.log('👥 Servicio de Clientes registrado');
        }
        
        if (window.ventasService) {
            this.servicios.ventas = window.ventasService;
            console.log('🛒 Servicio de Ventas registrado');
        }
        
        // Agregar más servicios según se vayan creando
        console.log(`📋 Total de servicios registrados: ${Object.keys(this.servicios).length}`);
    }

    // Configurar listeners globales
    configurarListeners() {
        // Manejar errores de conexión
        window.addEventListener('online', () => {
            this.mostrarEstado('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.mostrarEstado('Sin conexión a internet', 'warning');
        });
        
        // Limpiar listeners al salir
        window.addEventListener('beforeunload', () => {
            Object.values(this.servicios).forEach(servicio => {
                if (servicio.limpiarListeners) {
                    servicio.limpiarListeners();
                }
            });
        });
    }

    // Verificar si hay datos para migrar
    async verificarMigracion() {
        try {
            const clavesMigracion = [
                'inventarioJeziel',
                'clientesJeziel', 
                'ventasJeziel',
                'comprasJeziel',
                'facturasJeziel',
                'movimientosJeziel'
            ];

            let tieneDatosLocales = false;
            let datosEncontrados = [];

            for (const clave of clavesMigracion) {
                const datos = localStorage.getItem(clave);
                if (datos) {
                    try {
                        const parsed = JSON.parse(datos);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            tieneDatosLocales = true;
                            datosEncontrados.push(clave);
                        }
                    } catch (e) {
                        console.warn(`Datos corruptos en ${clave}:`, e);
                    }
                }
            }

            if (tieneDatosLocales && !this.migrationCompleted) {
                console.log('📊 Datos locales encontrados:', datosEncontrados);
                this.ofrecerMigracion(datosEncontrados);
            }
            
        } catch (error) {
            console.error('Error al verificar migración:', error);
        }
    }

    // Ofrecer migración de datos
    ofrecerMigracion(datosEncontrados) {
        const modal = this.crearModalMigracion(datosEncontrados);
        document.body.appendChild(modal);
        
        // Mostrar modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    // Crear modal de migración
    crearModalMigracion(datosEncontrados) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modalMigracion';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-cloud-upload-alt me-2"></i>
                            Migración a Firebase
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <i class="fas fa-database fa-3x text-primary mb-3"></i>
                            <h4>Datos locales detectados</h4>
                            <p class="text-muted">
                                Se encontraron datos almacenados localmente. 
                                ¿Desea migrar estos datos a Firebase para tener acceso desde cualquier dispositivo?
                            </p>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-check-circle text-success me-2"></i>Beneficios de Firebase:</h6>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-cloud text-info me-2"></i>Acceso desde cualquier dispositivo</li>
                                    <li><i class="fas fa-sync text-info me-2"></i>Sincronización en tiempo real</li>
                                    <li><i class="fas fa-shield-alt text-info me-2"></i>Respaldo automático</li>
                                    <li><i class="fas fa-users text-info me-2"></i>Colaboración en equipo</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-info-circle text-primary me-2"></i>Datos encontrados:</h6>
                                <ul class="list-unstyled">
                                    ${datosEncontrados.map(dato => {
                                        const nombre = dato.replace('Jeziel', '').replace('inventario', 'Inventario')
                                                          .replace('clientes', 'Clientes')
                                                          .replace('ventas', 'Ventas')
                                                          .replace('compras', 'Compras')
                                                          .replace('facturas', 'Facturas')
                                                          .replace('movimientos', 'Movimientos');
                                        return `<li><i class="fas fa-file-alt text-secondary me-2"></i>${nombre}</li>`;
                                    }).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <div class="alert alert-warning mt-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Nota:</strong> La migración puede tomar unos minutos dependiendo de la cantidad de datos.
                            Los datos locales se mantendrán como respaldo.
                        </div>
                        
                        <div id="progresoMigracion" class="mt-3" style="display: none;">
                            <div class="progress">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
                            </div>
                            <div class="text-center mt-2">
                                <small id="textoProgreso">Iniciando migración...</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="jezielERP.iniciarMigracion()">
                            <i class="fas fa-cloud-upload-alt me-2"></i>Migrar Datos
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="jezielERP.omitirMigracion()">
                            <i class="fas fa-skip-forward me-2"></i>Omitir
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // Iniciar proceso de migración
    async iniciarMigracion() {
        try {
            const progreso = document.getElementById('progresoMigracion');
            const progressBar = progreso.querySelector('.progress-bar');
            const textoProgreso = document.getElementById('textoProgreso');
            const botones = document.querySelectorAll('#modalMigracion .modal-footer button');
            
            // Mostrar progreso y deshabilitar botones
            progreso.style.display = 'block';
            botones.forEach(btn => btn.disabled = true);
            
            const serviciosParaMigrar = [
                { key: 'inventario', nombre: 'Inventario' },
                { key: 'clientes', nombre: 'Clientes' },
                { key: 'ventas', nombre: 'Ventas' }
            ];
            
            let completados = 0;
            const total = serviciosParaMigrar.length;
            
            for (const servicio of serviciosParaMigrar) {
                if (this.servicios[servicio.key]) {
                    textoProgreso.textContent = `Migrando ${servicio.nombre}...`;
                    
                    try {
                        await this.servicios[servicio.key].migrarDatos();
                        completados++;
                    } catch (error) {
                        console.error(`Error migrando ${servicio.nombre}:`, error);
                    }
                    
                    const porcentaje = (completados / total) * 100;
                    progressBar.style.width = `${porcentaje}%`;
                }
            }
            
            // Completar migración
            progressBar.style.width = '100%';
            textoProgreso.textContent = 'Migración completada exitosamente';
            progressBar.classList.remove('progress-bar-animated');
            progressBar.classList.add('bg-success');
            
            this.migrationCompleted = true;
            localStorage.setItem('jezielERP_migration_completed', 'true');
            
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('modalMigracion')).hide();
                this.mostrarEstado('Migración completada exitosamente', 'success');
            }, 2000);
            
        } catch (error) {
            console.error('Error durante la migración:', error);
            this.mostrarError('Error durante la migración. Algunos datos podrían no haberse transferido.');
        }
    }

    // Omitir migración
    omitirMigracion() {
        this.migrationCompleted = true;
        localStorage.setItem('jezielERP_migration_completed', 'true');
        bootstrap.Modal.getInstance(document.getElementById('modalMigracion')).hide();
        this.mostrarEstado('Migración omitida. Puede migrar los datos más tarde desde la configuración.', 'info');
    }

    // Mostrar estado de la aplicación
    mostrarEstado(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${tipo} notification-floating`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${tipo === 'error' || tipo === 'danger' ? 'exclamation-triangle' : 
                                  tipo === 'success' ? 'check-circle' : 
                                  tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                <span>${mensaje}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Mostrar errores
    mostrarError(mensaje) {
        this.mostrarEstado(mensaje, 'danger');
    }

    // Verificar estado de conexión
    verificarConexion() {
        return navigator.onLine && this.inicializado;
    }

    // Obtener servicio específico
    obtenerServicio(nombre) {
        return this.servicios[nombre] || null;
    }

    // Crear respaldo completo
    async crearRespaldo() {
        try {
            if (!this.verificarConexion()) {
                throw new Error('Sin conexión a Firebase');
            }
            
            const respaldo = {
                fecha: new Date().toISOString(),
                version: '1.0.0',
                datos: {}
            };
            
            for (const [nombre, servicio] of Object.entries(this.servicios)) {
                if (servicio.obtenerTodos) {
                    respaldo.datos[nombre] = await servicio.obtenerTodos();
                }
            }
            
            // Descargar respaldo
            const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jeziel_erp_respaldo_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.mostrarEstado('Respaldo creado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            this.mostrarError('Error al crear respaldo: ' + error.message);
        }
    }
}

// Crear instancia global
const jezielERP = new JezielERP();
window.jezielERP = jezielERP;

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    await jezielERP.inicializar();
});

console.log('🏢 Jeziel ERP Inicializador cargado');
