// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem('usuarioRol');

    // Si no está autenticado, redirige al login
    if (!rol) {
        window.location.href = 'login.html';
        return;
    }

    // Si es cliente, oculta opciones de admin
    if (rol === 'cliente') {
        // Oculta enlaces de administración
        const navProductos = document.getElementById('nav-productos');
        const navReportes = document.getElementById('nav-reportes');
        const navUsuarios = document.getElementById('nav-usuarios');
        if (navProductos) navProductos.style.display = 'none';
        if (navReportes) navReportes.style.display = 'none';
        if (navUsuarios) navUsuarios.style.display = 'none';

        // Si intenta acceder a una página restringida, redirige al catálogo
        const paginaRestringida = ['productos.html', 'reportes.html', 'usuarios.html'];
        if (paginaRestringida.some(p => window.location.pathname.endsWith(p))) {
            window.location.href = 'catalogo.html';
        }
    }
    // ...resto de tu código...
});



// Variables globales
const API_URL = 'http://localhost:3000/api'; // Asegúrate de que coincida con tu URL de backend

// Variables globales (manteniendo tus nombres exactos)
const contenedorCarrito = document.getElementById('cartItems');
const mensajeCarritoVacio = document.getElementById('emptyCart');
const resumenCarrito = document.getElementById('cartSummary');
const elementoSubtotal = document.getElementById('subtotal');
const elementoEnvio = document.getElementById('shipping');
const elementoTotal = document.getElementById('total');
const botonPagar = document.getElementById('checkoutBtn');

// Cargar carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Mostrar los productos en el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
});

let productosCatalogo = [];
async function cargarProductosCatalogoParaCarrito() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        productosCatalogo = await response.json();
    } catch (error) {
        productosCatalogo = [];
    }
}

// Función para mostrar el carrito
async function mostrarCarrito() {
    // Cargar catálogo si aún no está cargado
    if (!productosCatalogo.length) {
        await cargarProductosCatalogoParaCarrito();
    }

    contenedorCarrito.innerHTML = '';
    if (carrito.length === 0) {
        mensajeCarritoVacio.style.display = 'block';
        resumenCarrito.style.display = 'none';
        return;
    }
    mensajeCarritoVacio.style.display = 'none';
    resumenCarrito.style.display = 'block';

    let subtotal = 0;

    carrito.forEach((producto, indice) => {
        // Buscar el stock real en el catálogo
        const productoCatalogo = productosCatalogo.find(p => p.id_producto == producto.id);
        const stockMaximo = productoCatalogo ? (productoCatalogo.entradas - productoCatalogo.salidas) : 0;

        subtotal += producto.precio * producto.cantidad;

        const elementoProducto = document.createElement('div');
        elementoProducto.className = 'cart-item';
        elementoProducto.innerHTML = `
            <div class="item-info">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="item-details">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion || 'Sin descripción'}</p>
                    <p>Precio unitario: $${producto.precio.toFixed(2)}</p>
                    <p style="color:#888;font-size:0.9em;">Stock disponible: ${stockMaximo}</p>
                </div>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="actualizarCantidadCarrito(${indice}, ${producto.cantidad - 1}, ${stockMaximo})">-</button>
                    <input type="number" class="quantity-input" value="${producto.cantidad}" min="1" max="${stockMaximo}"
                           onchange="actualizarCantidadCarrito(${indice}, parseInt(this.value), ${stockMaximo})">
                    <button class="quantity-btn" onclick="actualizarCantidadCarrito(${indice}, ${producto.cantidad + 1}, ${stockMaximo})">+</button>
                </div>
                <button class="remove-btn" onclick="eliminarDelCarrito(${indice})">Eliminar</button>
            </div>
        `;
        contenedorCarrito.appendChild(elementoProducto);
    });

    // Calcular resumen
    const envio = subtotal > 100 ? 0 : 10;
    const total = subtotal + envio;

    elementoSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    elementoEnvio.textContent = envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`;
    elementoTotal.textContent = `$${total.toFixed(2)}`;
}

// Cambia la función para actualizar cantidad:
function actualizarCantidadCarrito(indice, nuevaCantidad, stockMaximo) {
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        eliminarDelCarrito(indice);
        return;
    }
    if (nuevaCantidad > stockMaximo) {
        alert(`Solo hay ${stockMaximo} unidades disponibles de "${carrito[indice].nombre}".`);
        carrito[indice].cantidad = stockMaximo;
    } else {
        carrito[indice].cantidad = nuevaCantidad;
    }
    guardarCarrito();
    mostrarCarrito();
}

// Funciones para manejar el carrito (nombres originales)
function actualizarCantidad(indice, cambio) {
    const nuevaCantidad = carrito[indice].cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(indice);
        return;
    }
    
    carrito[indice].cantidad = nuevaCantidad;
    guardarCarrito();
    mostrarCarrito();
}

function actualizarCantidadInput(indice, valor) {
    const nuevaCantidad = parseInt(valor);
    
    if (isNaN(nuevaCantidad)) {
        mostrarCarrito();
        return;
    }
    
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(indice);
        return;
    }
    
    carrito[indice].cantidad = nuevaCantidad;
    guardarCarrito();
    mostrarCarrito();
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    mostrarCarrito();
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para generar factura (nombres originales)
function generarFactura() {
    try {
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(20);
        doc.text('FACTURA DE COMPRA', 105, 20, { align: 'center' });
        
        // Datos de la empresa
        doc.setFontSize(12);
        doc.text('Tienda de Bicicletas BikeShop', 14, 30);
        doc.text('NIT: 123456789-0', 14, 40);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 50);
        doc.text(`Factura No: ${Math.floor(Math.random() * 10000)}`, 14, 60);
        
        // Línea separadora
        doc.line(14, 70, 190, 70);
        
        // Detalles de productos
        doc.setFontSize(14);
        doc.text('DETALLES DE LA COMPRA', 14, 80);
        
        let yPosition = 90;
        let subtotal = 0;
        
        // Cabecera de la tabla
        doc.setFontSize(12);
        doc.text('Producto', 14, yPosition);
        doc.text('Cant.', 100, yPosition);
        doc.text('Precio', 130, yPosition);
        doc.text('Total', 160, yPosition);
        
        yPosition += 10;
        
        // Productos
        carrito.forEach(producto => {
            const totalProducto = producto.precio * producto.cantidad;
            subtotal += totalProducto;
            
            doc.text(producto.nombre.substring(0, 40), 14, yPosition);
            doc.text(producto.cantidad.toString(), 100, yPosition);
            doc.text(`$${producto.precio.toFixed(2)}`, 130, yPosition);
            doc.text(`$${totalProducto.toFixed(2)}`, 160, yPosition);
            
            yPosition += 10;
            
            // Salto de página si se llega al final
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
        });
        
        // Totales
        const envio = subtotal > 100 ? 0 : 10;
        const total = subtotal + envio;
        
        doc.line(14, yPosition, 190, yPosition);
        yPosition += 10;
        
        doc.text('SUBTOTAL:', 140, yPosition);
        doc.text(`$${subtotal.toFixed(2)}`, 160, yPosition);
        yPosition += 10;
        
        doc.text('ENVÍO:', 140, yPosition);
        doc.text(envio === 0 ? 'GRATIS' : `$${envio.toFixed(2)}`, 160, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 140, yPosition);
        doc.text(`$${total.toFixed(2)}`, 160, yPosition);
        doc.setFont('helvetica', 'normal');
        
        // Pie de página
        doc.setFontSize(10);
        doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
        doc.text('Para reclamos o devoluciones contacte a servicio@bikeshop.com', 105, 285, { align: 'center' });
        
        // Guardar PDF
        doc.save(`factura_bikeshop_${new Date().getTime()}.pdf`);
    } catch (error) {
        console.error('Error al generar factura:', error);
        alert('Error al generar la factura. Por favor intente nuevamente.');
    }
}

// Evento para realizar compra
botonPagar.addEventListener('click', async () => {
    if (carrito.length === 0) return;

    // Asegúrate de tener el catálogo actualizado
    if (!productosCatalogo.length) {
        await cargarProductosCatalogoParaCarrito();
    }

    // Validar stock real antes de enviar la compra
    for (const producto of carrito) {
        const productoCatalogo = productosCatalogo.find(p => p.id_producto == producto.id);
        const stockMaximo = productoCatalogo ? (productoCatalogo.entradas - productoCatalogo.salidas) : 0;
        if (producto.cantidad > stockMaximo) {
            alert(`No puedes comprar más de ${stockMaximo} unidades de "${producto.nombre}".`);
            mostrarCarrito();
            return;
        }
    }
    
    // Obtener usuario actual
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        alert('Debes iniciar sesión para realizar una compra');
        window.location.href = 'login.html';
        return;
    }
    
    // Calcular totales
    let subtotal = 0;
    let cantidadTotal = 0;
    const items = carrito.map(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;
        cantidadTotal += item.cantidad;
        
        return {
            id_producto: item.id,
            precio_unitario: item.precio,
            cantidad: item.cantidad
        };
    });
    
    const envio = subtotal > 100 ? 0 : 10;
    const total = subtotal + envio;
    
    try {
        // Enviar datos al servidor
        const response = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Si usas JWT
            },
            body: JSON.stringify({
                id_usuario: usuarioId,
                total: total,
                cantidad_productos: cantidadTotal,
                items: items
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al registrar la venta');
        }
        
        // Generar factura PDF
        generarFactura();
        
        // Limpiar carrito después de la compra
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        
        alert('Compra realizada con éxito. Se ha generado tu factura.');
        
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        alert('Error al procesar la compra: ' + error.message);
    }
});

// Función para agregar al carrito desde el catálogo
function agregarAlCarrito(idProducto) {
    // Buscar el producto en el array de productos
    const productoAAgregar = window.productos.find(p => p.id_producto == idProducto);

    if (!productoAAgregar) {
        alert('Producto no encontrado');
        return;
    }

    // Calcular el stock real
    const stockReal = productoAAgregar.entradas - productoAAgregar.salidas;

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === idProducto);

    if (productoExistente) {
        if (productoExistente.cantidad < stockReal) {
            productoExistente.cantidad += 1;
        } else {
            alert(`No puedes agregar más de ${stockReal} unidades de "${productoAAgregar.nombre}".`);
            return;
        }
    } else {
        carrito.push({
            id: productoAAgregar.id_producto,
            nombre: productoAAgregar.nombre,
            descripcion: productoAAgregar.descripcion,
            precio: parseFloat(productoAAgregar.precio),
            imagen: productoAAgregar.imagen || '',
            cantidad: 1,
            stock: stockReal // <--- Guarda el stock real aquí
        });
    }

    guardarCarrito();
    alert(`"${productoAAgregar.nombre}" ha sido añadido al carrito.`);
}