// Servicio de Inventario para Firebase
// Maneja todas las operaciones CRUD del inventario en Firebase

class InventarioService {
    constructor() {
        this.collectionName = 'inventario';
        this.categorias = [
            'Camisetas',
            'Mugs',
            'Llaveros', 
            'Gorras',
            'Stickers',
            'Sublimación',
            'Insumos',
            'Otros'
        ];
    }

    // Obtener todos los productos del inventario
    async obtenerTodos() {
        try {
            return await firebaseManager.getAll(this.collectionName);
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            // Fallback a localStorage si Firebase falla
            return this.obtenerDeLocalStorage();
        }
    }

    // Agregar nuevo producto
    async agregar(producto) {
        try {
            // Validar datos requeridos
            if (!this.validarProducto(producto)) {
                throw new Error('Datos del producto inválidos');
            }

            // Preparar datos del producto
            const productoData = {
                nombre: producto.nombre.trim(),
                categoria: producto.categoria,
                precio: parseFloat(producto.precio),
                stock: parseInt(producto.stock),
                stockMinimo: parseInt(producto.stockMinimo) || 5,
                proveedor: producto.proveedor?.trim() || '',
                descripcion: producto.descripcion?.trim() || '',
                codigo: producto.codigo?.trim() || this.generarCodigo(),
                estado: producto.stock > 0 ? 'Disponible' : 'Agotado',
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            const id = await firebaseManager.add(this.collectionName, productoData);
            
            // Actualizar también en localStorage como backup
            this.actualizarLocalStorage();
            
            this.mostrarNotificacion('Producto agregado exitosamente', 'success');
            return { id, ...productoData };
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarNotificacion('Error al agregar producto: ' + error.message, 'error');
            throw error;
        }
    }

    // Actualizar producto existente
    async actualizar(id, producto) {
        try {
            if (!this.validarProducto(producto)) {
                throw new Error('Datos del producto inválidos');
            }

            const productoData = {
                nombre: producto.nombre.trim(),
                categoria: producto.categoria,
                precio: parseFloat(producto.precio),
                stock: parseInt(producto.stock),
                stockMinimo: parseInt(producto.stockMinimo) || 5,
                proveedor: producto.proveedor?.trim() || '',
                descripcion: producto.descripcion?.trim() || '',
                codigo: producto.codigo?.trim() || this.generarCodigo(),
                estado: producto.stock > 0 ? 'Disponible' : 'Agotado',
                fechaActualizacion: new Date().toISOString()
            };

            await firebaseManager.update(this.collectionName, id, productoData);
            
            // Actualizar también en localStorage como backup
            this.actualizarLocalStorage();
            
            this.mostrarNotificacion('Producto actualizado exitosamente', 'success');
            return { id, ...productoData };
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            this.mostrarNotificacion('Error al actualizar producto: ' + error.message, 'error');
            throw error;
        }
    }

    // Eliminar producto
    async eliminar(id) {
        try {
            await firebaseManager.delete(this.collectionName, id);
            
            // Actualizar también en localStorage como backup
            this.actualizarLocalStorage();
            
            this.mostrarNotificacion('Producto eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            this.mostrarNotificacion('Error al eliminar producto: ' + error.message, 'error');
            throw error;
        }
    }

    // Buscar productos por texto
    async buscar(termino) {
        try {
            const productos = await this.obtenerTodos();
            const terminoLower = termino.toLowerCase();
            
            return productos.filter(producto => 
                producto.nombre.toLowerCase().includes(terminoLower) ||
                producto.categoria.toLowerCase().includes(terminoLower) ||
                producto.codigo.toLowerCase().includes(terminoLower) ||
                (producto.proveedor && producto.proveedor.toLowerCase().includes(terminoLower))
            );
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }

    // Filtrar por categoría
    async filtrarPorCategoria(categoria) {
        try {
            const productos = await this.obtenerTodos();
            if (categoria === 'todos') {
                return productos;
            }
            return productos.filter(producto => producto.categoria === categoria);
        } catch (error) {
            console.error('Error al filtrar por categoría:', error);
            return [];
        }
    }

    // Obtener productos con stock bajo
    async obtenerStockBajo() {
        try {
            const productos = await this.obtenerTodos();
            return productos.filter(producto => producto.stock <= producto.stockMinimo);
        } catch (error) {
            console.error('Error al obtener productos con stock bajo:', error);
            return [];
        }
    }

    // Actualizar stock de un producto
    async actualizarStock(id, nuevoStock, razon = '') {
        try {
            const producto = await firebaseManager.getById(this.collectionName, id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            const stockActualizado = {
                stock: parseInt(nuevoStock),
                estado: nuevoStock > 0 ? 'Disponible' : 'Agotado',
                fechaActualizacion: new Date().toISOString()
            };

            await firebaseManager.update(this.collectionName, id, stockActualizado);

            // Registrar movimiento de stock si se proporciona una razón
            if (razon) {
                await this.registrarMovimientoStock(id, producto.stock, nuevoStock, razon);
            }

            this.mostrarNotificacion('Stock actualizado exitosamente', 'success');
            return { ...producto, ...stockActualizado };
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            this.mostrarNotificacion('Error al actualizar stock: ' + error.message, 'error');
            throw error;
        }
    }

    // Registrar movimiento de stock
    async registrarMovimientoStock(productoId, stockAnterior, stockNuevo, razon) {
        try {
            const movimiento = {
                productoId,
                stockAnterior: parseInt(stockAnterior),
                stockNuevo: parseInt(stockNuevo),
                diferencia: parseInt(stockNuevo) - parseInt(stockAnterior),
                razon,
                fecha: new Date().toISOString(),
                usuario: 'Sistema' // Aquí se podría integrar autenticación
            };

            await firebaseManager.add('movimientos_stock', movimiento);
        } catch (error) {
            console.error('Error al registrar movimiento de stock:', error);
        }
    }

    // Validar datos del producto
    validarProducto(producto) {
        if (!producto.nombre || producto.nombre.trim() === '') {
            this.mostrarNotificacion('El nombre del producto es requerido', 'error');
            return false;
        }
        if (!producto.categoria) {
            this.mostrarNotificacion('La categoría es requerida', 'error');
            return false;
        }
        if (!producto.precio || isNaN(parseFloat(producto.precio)) || parseFloat(producto.precio) < 0) {
            this.mostrarNotificacion('El precio debe ser un número válido mayor a 0', 'error');
            return false;
        }
        if (!producto.stock || isNaN(parseInt(producto.stock)) || parseInt(producto.stock) < 0) {
            this.mostrarNotificacion('El stock debe ser un número válido mayor o igual a 0', 'error');
            return false;
        }
        return true;
    }

    // Generar código único para producto
    generarCodigo() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `PRD-${timestamp}-${random}`.toUpperCase();
    }

    // Migrar datos de localStorage a Firebase
    async migrarDatos() {
        try {
            const datosLocales = localStorage.getItem('inventarioJeziel');
            if (!datosLocales) {
                console.log('No hay datos locales para migrar');
                return;
            }

            const productos = JSON.parse(datosLocales);
            if (!Array.isArray(productos) || productos.length === 0) {
                console.log('No hay productos válidos para migrar');
                return;
            }

            console.log(`Iniciando migración de ${productos.length} productos...`);
            
            let migrados = 0;
            for (const producto of productos) {
                try {
                    await this.agregar(producto);
                    migrados++;
                } catch (error) {
                    console.error(`Error al migrar producto ${producto.nombre}:`, error);
                }
            }

            console.log(`✅ Migración completada: ${migrados}/${productos.length} productos migrados`);
            this.mostrarNotificacion(`Migración completada: ${migrados} productos migrados`, 'success');
            
        } catch (error) {
            console.error('Error durante la migración:', error);
            this.mostrarNotificacion('Error durante la migración: ' + error.message, 'error');
        }
    }

    // Fallback a localStorage
    obtenerDeLocalStorage() {
        try {
            const datos = localStorage.getItem('inventarioJeziel');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al leer localStorage:', error);
            return [];
        }
    }

    // Actualizar localStorage como backup
    async actualizarLocalStorage() {
        try {
            const productos = await firebaseManager.getAll(this.collectionName);
            localStorage.setItem('inventarioJeziel_backup', JSON.stringify(productos));
        } catch (error) {
            console.error('Error al actualizar backup en localStorage:', error);
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
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Obtener estadísticas del inventario
    async obtenerEstadisticas() {
        try {
            const productos = await this.obtenerTodos();
            
            const stats = {
                totalProductos: productos.length,
                valorTotal: productos.reduce((total, p) => total + (p.precio * p.stock), 0),
                stockBajo: productos.filter(p => p.stock <= p.stockMinimo).length,
                agotados: productos.filter(p => p.stock === 0).length,
                porCategoria: {}
            };

            // Estadísticas por categoría
            this.categorias.forEach(categoria => {
                const productosCategoria = productos.filter(p => p.categoria === categoria);
                stats.porCategoria[categoria] = {
                    cantidad: productosCategoria.length,
                    valor: productosCategoria.reduce((total, p) => total + (p.precio * p.stock), 0)
                };
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalProductos: 0,
                valorTotal: 0,
                stockBajo: 0,
                agotados: 0,
                porCategoria: {}
            };
        }
    }
}

// Crear instancia global del servicio
const inventarioService = new InventarioService();

// Exportar para uso global
window.inventarioService = inventarioService;

console.log('📦 Servicio de Inventario con Firebase inicializado');
