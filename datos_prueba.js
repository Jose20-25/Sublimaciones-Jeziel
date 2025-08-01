// Datos de prueba para el sistema ERP
var clientesEjemplo = [
  {id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0101'},
  {id: '2', nombre: 'María García', email: 'maria@email.com', telefono: '555-0102'},
  {id: '3', nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-0103'}
];

var inventarioEjemplo = [
  {id: '1', nombre: 'Camiseta Sublimada', precio: 250.00, stock: 50},
  {id: '2', nombre: 'Taza Personalizada', precio: 150.00, stock: 30},
  {id: '3', nombre: 'Mouse Pad Custom', precio: 100.00, stock: 25}
];

// Guardar en localStorage
localStorage.setItem('clientesJeziel', JSON.stringify(clientesEjemplo));
localStorage.setItem('inventarioJeziel', JSON.stringify(inventarioEjemplo));

console.log('Datos de prueba creados exitosamente');
console.log('Clientes:', clientesEjemplo);
console.log('Inventario:', inventarioEjemplo);
