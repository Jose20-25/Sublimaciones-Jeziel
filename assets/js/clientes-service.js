// Servicio de Clientes para Firebase
// Maneja todas las operaciones CRUD de clientes en Firebase

class ClientesService {
    constructor() {
        this.collectionName = 'clientes';
    }

    // Obtener todos los clientes
    async obtenerTodos() {
        try {
            return await firebaseManager.getAll(this.collectionName);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            return this.obtenerDeLocalStorage();
        }
    }

    // Agregar nuevo cliente
    async agregar(cliente) {
        try {
            if (!this.validarCliente(cliente)) {
                throw new Error('Datos del cliente inválidos');
            }

            const clienteData = {
                nombre: cliente.nombre.trim(),
                email: cliente.email?.trim() || '',
                telefono: cliente.telefono?.trim() || '',
                direccion: cliente.direccion?.trim() || '',
                identificacion: cliente.identificacion?.trim() || '',
                fechaRegistro: new Date().toISOString(),
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            const id = await firebaseManager.add(this.collectionName, clienteData);
            this.mostrarNotificacion('Cliente agregado exitosamente', 'success');
            return { id, ...clienteData };
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            this.mostrarNotificacion('Error al agregar cliente: ' + error.message, 'error');
            throw error;
        }
    }

    // Actualizar cliente existente
    async actualizar(id, cliente) {
        try {
            if (!this.validarCliente(cliente)) {
                throw new Error('Datos del cliente inválidos');
            }

            const clienteData = {
                nombre: cliente.nombre.trim(),
                email: cliente.email?.trim() || '',
                telefono: cliente.telefono?.trim() || '',
                direccion: cliente.direccion?.trim() || '',
                identificacion: cliente.identificacion?.trim() || '',
                fechaActualizacion: new Date().toISOString()
            };

            await firebaseManager.update(this.collectionName, id, clienteData);
            this.mostrarNotificacion('Cliente actualizado exitosamente', 'success');
            return { id, ...clienteData };
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            this.mostrarNotificacion('Error al actualizar cliente: ' + error.message, 'error');
            throw error;
        }
    }

    // Eliminar cliente
    async eliminar(id) {
        try {
            await firebaseManager.delete(this.collectionName, id);
            this.mostrarNotificacion('Cliente eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            this.mostrarNotificación('Error al eliminar cliente: ' + error.message, 'error');
            throw error;
        }
    }

    // Buscar clientes por texto
    async buscar(termino) {
        try {
            const clientes = await this.obtenerTodos();
            const terminoLower = termino.toLowerCase();
            
            return clientes.filter(cliente => 
                cliente.nombre.toLowerCase().includes(terminoLower) ||
                (cliente.email && cliente.email.toLowerCase().includes(terminoLower)) ||
                (cliente.telefono && cliente.telefono.includes(termino)) ||
                (cliente.identificacion && cliente.identificacion.includes(termino))
            );
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            return [];
        }
    }

    // Validar datos del cliente
    validarCliente(cliente) {
        if (!cliente.nombre || cliente.nombre.trim() === '') {
            this.mostrarNotificacion('El nombre del cliente es requerido', 'error');
            return false;
        }
        if (cliente.email && !this.validarEmail(cliente.email)) {
            this.mostrarNotificacion('El email no tiene un formato válido', 'error');
            return false;
        }
        return true;
    }

    validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Fallback a localStorage
    obtenerDeLocalStorage() {
        try {
            const datos = localStorage.getItem('clientesJeziel');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al leer localStorage:', error);
            return [];
        }
    }

    // Escuchar cambios en tiempo real
    escucharCambios(callback) {
        return firebaseManager.onCollectionChange(this.collectionName, callback);
    }

    // Mostrar notificaciones
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${tipo === 'error' ? 'danger' : tipo === 'success' ? 'success' : 'info'} notification-custom`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${tipo === 'error' ? 'exclamation-triangle' : tipo === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
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

    // Migrar datos de localStorage a Firebase
    async migrarDatos() {
        try {
            const datosLocales = localStorage.getItem('clientesJeziel');
            if (!datosLocales) {
                console.log('No hay datos locales de clientes para migrar');
                return;
            }

            const clientes = JSON.parse(datosLocales);
            if (!Array.isArray(clientes) || clientes.length === 0) {
                console.log('No hay clientes válidos para migrar');
                return;
            }

            console.log(`Iniciando migración de ${clientes.length} clientes...`);
            
            let migrados = 0;
            for (const cliente of clientes) {
                try {
                    await this.agregar(cliente);
                    migrados++;
                } catch (error) {
                    console.error(`Error al migrar cliente ${cliente.nombre}:`, error);
                }
            }

            console.log(`✅ Migración completada: ${migrados}/${clientes.length} clientes migrados`);
            this.mostrarNotificacion(`Migración completada: ${migrados} clientes migrados`, 'success');
            
        } catch (error) {
            console.error('Error durante la migración:', error);
            this.mostrarNotificacion('Error durante la migración: ' + error.message, 'error');
        }
    }

    // Obtener estadísticas de clientes
    async obtenerEstadisticas() {
        try {
            const clientes = await this.obtenerTodos();
            
            const stats = {
                totalClientes: clientes.length,
                clientesRecientes: clientes.filter(c => {
                    const fechaRegistro = new Date(c.fechaRegistro || c.fechaCreacion);
                    const haceUnMes = new Date();
                    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
                    return fechaRegistro > haceUnMes;
                }).length,
                clientesConEmail: clientes.filter(c => c.email && c.email.trim() !== '').length,
                clientesConTelefono: clientes.filter(c => c.telefono && c.telefono.trim() !== '').length
            };

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalClientes: 0,
                clientesRecientes: 0,
                clientesConEmail: 0,
                clientesConTelefono: 0
            };
        }
    }
}

// Crear instancia global del servicio
const clientesService = new ClientesService();

// Exportar para uso global
window.clientesService = clientesService;

console.log('👥 Servicio de Clientes con Firebase inicializado');
