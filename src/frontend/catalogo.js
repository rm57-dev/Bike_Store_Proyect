// Variables globales
const API_URL = 'http://localhost:3000/api'; // Asegúrate de que esta URL sea correcta
let productos = []; // Variable para almacenar los productos

// Elementos del DOM
const contenedorCards = document.getElementById('contenedorCards'); // Cambiado de catalogoProductosContainer a contenedorCards
const templateCard = document.getElementById('templateCard'); // Cambiado de templateCardCatalogo a templateCard

// Event Listener para cargar productos cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', cargarProductosCatalogo);

// Función para cargar los productos desde la API
async function cargarProductosCatalogo() {
    try {
        const response = await fetch(`${API_URL}/productos`); //
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        productos = await response.json();
        mostrarProductosCatalogo();
    } catch (error) {
        console.error('Error al cargar productos para el catálogo:', error);
        contenedorCards.innerHTML = '<p>Error al cargar los productos. Por favor, inténtelo de nuevo más tarde.</p>';
    }
}

// Función para mostrar los productos en el catálogo
async function mostrarProductosCatalogo() {
    contenedorCards.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos

    for (const producto of productos) {
        const clone = templateCard.content.cloneNode(true);

        const card = clone.querySelector('.card-productos'); // Cambiado de .card-producto a .card-productos
        const img = clone.querySelector('.imagen-productos'); // Cambiado de .imagen-producto a .imagen-productos
        const nombre = clone.querySelector('.nombre-productos'); // Cambiado de .nombre-producto a .nombre-productos
        const descripcion = clone.querySelector('.descripcion-productos'); // Añadido
        const precio = clone.querySelector('.precio-productos'); // Cambiado de .precio-producto a .precio-productos
        const btnAddCart = clone.querySelector('.btn-add-cart');

        // Asignar datos del producto
        nombre.textContent = producto.nombre;
        descripcion.textContent = producto.descripcion;
        const precioNumero = parseFloat(producto.precio); // Convierte a número (o NaN si no es válido)
        precio.textContent = `Precio: $${!isNaN(precioNumero) ? precioNumero.toFixed(2) : 'N/A'}`;
        btnAddCart.setAttribute('data-id', producto.id_producto); // Asignar el ID al botón para futuras acciones


        let stock = clone.querySelector('.stock-productos');
        if (!stock) {
            const stockElement = document.createElement('p');
            stockElement.className = 'stock-productos';
            card.appendChild(stockElement);
            stock = stockElement;
        }

        const stockActual = producto.entradas - producto.salidas;
        stock.textContent = `Stock: ${stockActual}`;

        // Resaltar si stock es bajo
        if (stockActual <= 10) {
            stock.style.color = 'red';
            stock.textContent += ' (STOCK BAJO)';
        }

        // Mostrar si no hay stock y deshabilitar botón
        if (stockActual <= 0) {
            stock.textContent = 'SIN STOCK';
            stock.style.color = 'red';
            btnAddCart.disabled = true;
            btnAddCart.style.backgroundColor = '#cccccc';
            card.style.opacity = '0.7';
        }

        // Cargar y mostrar la imagen del producto
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/productos/id_producto/${producto.id_producto}`); //
            const data = await response.json();
            if (data.imagen) {
                img.src = `data:image/jpeg;base64,${data.imagen}`;
                img.style.display = 'block';
            } else {
                img.style.display = 'none'; // Opcional: ocultar si no hay imagen
                img.src = '';
            }
        } catch (error) {
            console.error(`Error al cargar imagen para el producto ${producto.id_producto}:`, error);
            img.style.display = 'none';
            img.src = '';
        }

        // Event listener para el botón "Añadir al Carrito"
        btnAddCart.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-id');
            añadirAlCarrito(productId);
        });

        contenedorCards.appendChild(clone);
    }
}

// Función de ejemplo para añadir al carrito (puedes expandirla)
async function añadirAlCarrito(idProducto) {
    const productoAAgregar = productos.find(p => p.id_producto == idProducto);
    const stockActual = productoAAgregar.entradas - productoAAgregar.salidas;

    if (!productoAAgregar) {
        alert('Producto no encontrado');
        return;
    }

    if (stockActual <= 0) {
        alert('Este producto no tiene stock disponible');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.id === idProducto);

    // Obtener la imagen correctamente
    let imagenProducto = '';
    try {
        const response = await fetch(`${API_URL}/imagenes/obtener/productos/id_producto/${idProducto}`);
        const data = await response.json();
        if (data.imagen) {
            imagenProducto = `data:image/jpeg;base64,${data.imagen}`;
        } else {
            imagenProducto = 'https://via.placeholder.com/80?text=Sin+imagen';
        }
    } catch (error) {
        console.error('Error al cargar imagen:', error);
        imagenProducto = 'https://via.placeholder.com/80?text=Error+imagen';
    }

    if (productoExistente) {
        if (productoExistente.cantidad < stockActual) {
            productoExistente.cantidad += 1;
        } else {
            alert(`No puedes agregar más de ${stockActual} unidades de "${productoAAgregar.nombre}".`);
            return;
        }
    } else {
        carrito.push({
            id: productoAAgregar.id_producto,
            nombre: productoAAgregar.nombre,
            descripcion: productoAAgregar.descripcion,
            precio: parseFloat(productoAAgregar.precio),
            imagen: imagenProducto,
            cantidad: 1,
            stock: stockActual // <-- Guarda el stock real aquí
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`"${productoAAgregar.nombre}" ha sido añadido al carrito.`);

    // Actualizar vista si estamos en la página del carrito
    if (typeof mostrarCarrito === 'function') {
        mostrarCarrito();
    }
}