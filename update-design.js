#!/usr/bin/env node
// Script para actualizar todos los archivos del ERP con el nuevo diseño moderno

const fs = require('fs');
const path = require('path');

// Enlaces de CSS modernos que se aplicarán a todas las páginas
const modernCSSLinks = `    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/modern-erp.css">`;

// Estructura de sidebar moderna
const modernSidebar = `    <!-- Sidebar -->
    <div class="sidebar position-fixed h-100 d-flex flex-column" style="width: 250px; z-index: 1000;">
        <div class="logo-container">
            <div class="d-flex align-items-center">
                <img src="logo/logo.jpg" alt="Logo" class="logo-img me-3">
                <div>
                    <h5 class="text-white mb-0 fw-bold">Jeziel</h5>
                    <small class="text-white-50">Sublimaciones</small>
                </div>
            </div>
        </div>
        
        <nav class="flex-grow-1 p-3">
            <ul class="nav flex-column">
                <li class="nav-item mb-2">
                    <a class="nav-link {{DASHBOARD_ACTIVE}}" href="index.html">
                        <i class="fas fa-home me-3"></i>Dashboard
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{CLIENTES_ACTIVE}}" href="clientes.html">
                        <i class="fas fa-users me-3"></i>Clientes
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{VENTAS_ACTIVE}}" href="ventas.html">
                        <i class="fas fa-shopping-cart me-3"></i>Ventas
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{INVENTARIO_ACTIVE}}" href="inventario.html">
                        <i class="fas fa-boxes me-3"></i>Inventario
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{COMPRAS_ACTIVE}}" href="compras.html">
                        <i class="fas fa-shopping-bag me-3"></i>Compras
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{FACTURAS_ACTIVE}}" href="facturas.html">
                        <i class="fas fa-file-invoice me-3"></i>Facturas
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{FINANZAS_ACTIVE}}" href="finanzas.html">
                        <i class="fas fa-chart-line me-3"></i>Finanzas
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link {{REPORTES_ACTIVE}}" href="reportes.html">
                        <i class="fas fa-chart-bar me-3"></i>Reportes
                    </a>
                </li>
            </ul>
        </nav>
        
        <div class="p-3 border-top border-light">
            <div class="text-center text-white-50 small">
                <i class="fas fa-crown text-warning me-1"></i>
                © 2025 Jeziel ERP
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div style="margin-left: 250px; min-height: 100vh;">
        <div class="hero-section">
            <h1 class="erp-title">{{PAGE_TITLE}}</h1>
            <p class="hero-subtitle">{{PAGE_SUBTITLE}}</p>
        </div>`;

// Configuración de páginas
const pageConfigs = {
    'clientes.html': {
        title: 'Gestión de Clientes',
        subtitle: 'Administra tu base de datos de clientes de forma profesional',
        activeMenu: 'CLIENTES'
    },
    'ventas.html': {
        title: 'Gestión de Ventas', 
        subtitle: 'Registro y control profesional de ventas de productos',
        activeMenu: 'VENTAS'
    },
    'inventario.html': {
        title: 'Control de Inventario',
        subtitle: 'Supervisa tu stock y mantén control detallado de productos',
        activeMenu: 'INVENTARIO'
    },
    'compras.html': {
        title: 'Gestión de Compras',
        subtitle: 'Control y registro de compras y proveedores',
        activeMenu: 'COMPRAS'
    },
    'facturas.html': {
        title: 'Gestión de Facturas',
        subtitle: 'Genera facturas profesionales y controla la facturación',
        activeMenu: 'FACTURAS'
    },
    'finanzas.html': {
        title: 'Gestión Financiera',
        subtitle: 'Control total de ingresos, gastos y flujo de caja',
        activeMenu: 'FINANZAS'
    },
    'reportes.html': {
        title: 'Reportes y Estadísticas',
        subtitle: 'Analiza el rendimiento de tu negocio con datos precisos',
        activeMenu: 'REPORTES'
    }
};

console.log('🎨 Iniciando actualización del diseño ERP moderno...');
console.log('📋 Configuración aplicada:', Object.keys(pageConfigs).length, 'páginas');

// Esta información será usada manualmente para actualizar cada archivo
console.log('\n✨ Plantillas generadas exitosamente para aplicación manual');
console.log('📁 Archivo CSS principal: assets/css/modern-erp.css');
console.log('🔧 Aplicar manualmente las plantillas a cada archivo HTML');

module.exports = {
    modernCSSLinks,
    modernSidebar,
    pageConfigs
};
