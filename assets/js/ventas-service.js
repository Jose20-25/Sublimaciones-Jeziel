// Servicio de Ventas para Firebase
// Maneja todas las operaciones CRUD de ventas en Firebase

class VentasService {
    constructor() {
        this.collectionName = 'ventas';
    }

    // Obtener todas las ventas
    async obtenerTodos() {
        try {
            return await firebaseManager.getAll(this.collectionName);
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            return this.obtenerDeLocalStorage();
        }
    }

    // Agregar nueva venta
    async agregar(venta) {
        try {
            if (!this.validarVenta(venta)) {
                throw new Error('Datos de la venta inválidos');
            }

            // Calcular totales
            const subtotal = venta.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
            const descuento = venta.descuento || 0;
            const total = subtotal - descuento;

            const ventaData = {
                numeroVenta: venta.numeroVenta || this.generarNumeroVenta(),
                fecha: venta.fecha || new Date().toISOString(),
                cliente: venta.cliente,
                productos: venta.productos,
                subtotal: subtotal,
                descuento: descuento,
                total: total,
                metodoPago: venta.metodoPago || 'Efectivo',
                estado: venta.estado || 'Completada',
                observaciones: venta.observaciones?.trim() || '',
                vendedor: venta.vendedor || 'Sistema',
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            const id = await firebaseManager.add(this.collectionName, ventaData);
            
            // Actualizar el stock de los productos vendidos
            await this.actualizarStockProductos(venta.productos);
            
            this.mostrarNotificacion('Venta registrada exitosamente', 'success');
            return { id, ...ventaData };
        } catch (error) {
            console.error('Error al agregar venta:', error);
            this.mostrarNotificacion('Error al registrar venta: ' + error.message, 'error');
            throw error;
        }
    }

    // Actualizar venta existente
    async actualizar(id, venta) {
        try {
            if (!this.validarVenta(venta)) {
                throw new Error('Datos de la venta inválidos');
            }

            const subtotal = venta.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
            const descuento = venta.descuento || 0;
            const total = subtotal - descuento;

            const ventaData = {
                fecha: venta.fecha,
                cliente: venta.cliente,
                productos: venta.productos,
                subtotal: subtotal,
                descuento: descuento,
                total: total,
                metodoPago: venta.metodoPago,
                estado: venta.estado,
                observaciones: venta.observaciones?.trim() || '',
                fechaActualizacion: new Date().toISOString()
            };

            await firebaseManager.update(this.collectionName, id, ventaData);
            this.mostrarNotificacion('Venta actualizada exitosamente', 'success');
            return { id, ...ventaData };
        } catch (error) {
            console.error('Error al actualizar venta:', error);
            this.mostrarNotificacion('Error al actualizar venta: ' + error.message, 'error');
            throw error;
        }
    }

    // Eliminar venta
    async eliminar(id) {
        try {
            await firebaseManager.delete(this.collectionName, id);
            this.mostrarNotificacion('Venta eliminada exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            this.mostrarNotificacion('Error al eliminar venta: ' + error.message, 'error');
            throw error;
        }
    }

    // Buscar ventas
    async buscar(termino) {
        try {
            const ventas = await this.obtenerTodos();
            const terminoLower = termino.toLowerCase();
            
            return ventas.filter(venta => 
                venta.numeroVenta.toLowerCase().includes(terminoLower) ||
                venta.cliente.nombre.toLowerCase().includes(terminoLower) ||
                venta.vendedor.toLowerCase().includes(terminoLower) ||
                venta.metodoPago.toLowerCase().includes(terminoLower)
            );
        } catch (error) {
            console.error('Error al buscar ventas:', error);
            return [];
        }
    }

    // Filtrar ventas por fecha
    async filtrarPorFecha(fechaInicio, fechaFin) {
        try {
            const ventas = await this.obtenerTodos();
            return ventas.filter(venta => {
                const fechaVenta = new Date(venta.fecha);
                const inicio = new Date(fechaInicio);
                const fin = new Date(fechaFin);
                return fechaVenta >= inicio && fechaVenta <= fin;
            });
        } catch (error) {
            console.error('Error al filtrar por fecha:', error);
            return [];
        }
    }

    // Filtrar por estado
    async filtrarPorEstado(estado) {
        try {
            const ventas = await this.obtenerTodos();
            return ventas.filter(venta => venta.estado === estado);
        } catch (error) {
            console.error('Error al filtrar por estado:', error);
            return [];
        }
    }

    // Actualizar stock de productos después de una venta
    async actualizarStockProductos(productos) {
        try {
            for (const producto of productos) {
                if (window.inventarioService && producto.id) {
                    const productoInventario = await inventarioService.obtenerTodos();
                    const item = productoInventario.find(p => p.id === producto.id);
                    if (item) {
                        const nuevoStock = item.stock - producto.cantidad;
                        await inventarioService.actualizarStock(
                            producto.id, 
                            nuevoStock, 
                            `Venta - Reducción automática por venta`
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error al actualizar stock de productos:', error);
        }
    }

    // Generar número de venta único
    generarNumeroVenta() {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().slice(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const timestamp = Date.now().toString().slice(-4);
        return `V${año}${mes}${dia}${timestamp}`;
    }

    // Validar datos de la venta
    validarVenta(venta) {
        if (!venta.cliente || !venta.cliente.nombre) {
            this.mostrarNotificacion('Debe seleccionar un cliente', 'error');
            return false;
        }
        if (!venta.productos || venta.productos.length === 0) {
            this.mostrarNotificacion('Debe agregar al menos un producto', 'error');
            return false;
        }
        if (venta.productos.some(p => p.cantidad <= 0 || p.precio <= 0)) {
            this.mostrarNotificacion('Cantidad y precio deben ser mayor a 0', 'error');
            return false;
        }
        return true;
    }

    // Fallback a localStorage
    obtenerDeLocalStorage() {
        try {
            const datos = localStorage.getItem('ventasJeziel');
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
            const datosLocales = localStorage.getItem('ventasJeziel');
            if (!datosLocales) {
                console.log('No hay datos locales de ventas para migrar');
                return;
            }

            const ventas = JSON.parse(datosLocales);
            if (!Array.isArray(ventas) || ventas.length === 0) {
                console.log('No hay ventas válidas para migrar');
                return;
            }

            console.log(`Iniciando migración de ${ventas.length} ventas...`);
            
            let migradas = 0;
            for (const venta of ventas) {
                try {
                    // No actualizar stock durante la migración para evitar duplicados
                    const ventaData = {
                        ...venta,
                        fechaCreacion: venta.fechaCreacion || new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    };
                    await firebaseManager.add(this.collectionName, ventaData);
                    migradas++;
                } catch (error) {
                    console.error(`Error al migrar venta ${venta.numeroVenta}:`, error);
                }
            }

            console.log(`✅ Migración completada: ${migradas}/${ventas.length} ventas migradas`);
            this.mostrarNotificacion(`Migración completada: ${migradas} ventas migradas`, 'success');
            
        } catch (error) {
            console.error('Error durante la migración:', error);
            this.mostrarNotificacion('Error durante la migración: ' + error.message, 'error');
        }
    }

    // Obtener estadísticas de ventas
    async obtenerEstadisticas() {
        try {
            const ventas = await this.obtenerTodos();
            
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

            const ventasHoy = ventas.filter(v => new Date(v.fecha) >= inicioDia);
            const ventasMes = ventas.filter(v => new Date(v.fecha) >= inicioMes);

            const stats = {
                totalVentas: ventas.length,
                ventasHoy: ventasHoy.length,
                ventasMes: ventasMes.length,
                ingresoTotal: ventas.reduce((sum, v) => sum + (v.total || 0), 0),
                ingresoHoy: ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0),
                ingresoMes: ventasMes.reduce((sum, v) => sum + (v.total || 0), 0),
                ventaPendiente: ventas.filter(v => v.estado === 'Pendiente').length,
                ventaCompletada: ventas.filter(v => v.estado === 'Completada').length,
                metodoPagoStats: this.calcularEstadisticasMetodoPago(ventas)
            };

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalVentas: 0,
                ventasHoy: 0,
                ventasMes: 0,
                ingresoTotal: 0,
                ingresoHoy: 0,
                ingresoMes: 0,
                ventaPendiente: 0,
                ventaCompletada: 0,
                metodoPagoStats: {}
            };
        }
    }

    calcularEstadisticasMetodoPago(ventas) {
        const stats = {};
        ventas.forEach(venta => {
            const metodo = venta.metodoPago || 'Efectivo';
            if (!stats[metodo]) {
                stats[metodo] = { cantidad: 0, total: 0 };
            }
            stats[metodo].cantidad++;
            stats[metodo].total += venta.total || 0;
        });
        return stats;
    }

    // Obtener ventas por cliente
    async obtenerVentasPorCliente(clienteId) {
        try {
            const ventas = await this.obtenerTodos();
            return ventas.filter(venta => venta.cliente.id === clienteId);
        } catch (error) {
            console.error('Error al obtener ventas por cliente:', error);
            return [];
        }
    }

    // Obtener productos más vendidos
    async obtenerProductosMasVendidos(limite = 10) {
        try {
            const ventas = await this.obtenerTodos();
            const productosVendidos = {};

            ventas.forEach(venta => {
                venta.productos.forEach(producto => {
                    const key = producto.id || producto.nombre;
                    if (!productosVendidos[key]) {
                        productosVendidos[key] = {
                            ...producto,
                            cantidadVendida: 0,
                            ingresoGenerado: 0
                        };
                    }
                    productosVendidos[key].cantidadVendida += producto.cantidad;
                    productosVendidos[key].ingresoGenerado += producto.precio * producto.cantidad;
                });
            });

            return Object.values(productosVendidos)
                .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
                .slice(0, limite);
        } catch (error) {
            console.error('Error al obtener productos más vendidos:', error);
            return [];
        }
    }
}

// Crear instancia global del servicio
const ventasService = new VentasService();

// Exportar para uso global
window.ventasService = ventasService;

console.log('🛒 Servicio de Ventas con Firebase inicializado');
