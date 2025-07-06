// Variables globales
const API_URL = 'http://localhost:3000/api';
let productos = [];

// Elementos del DOM
const productoForm = document.getElementById('productoForm');
const tablaPersonasBody = document.getElementById('tablaPersonasBody');
const btnCancelar = document.getElementById('btnCancelar');
const imagenInput = document.getElementById('imagen');
const previewImagen = document.getElementById('previewImagen');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado
    verificarAutenticacion();

    // Mostrar nombre del usuario si está autenticado
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuariodescripcion = localStorage.getItem('usuariodescripcion');

    if (usuarioNombre && usuariodescripcion) {
        const infoUsuario = document.createElement('div');
        infoUsuario.innerHTML = `
            <p>Bienvenido, ${usuarioNombre} ${usuariodescripcion} | 
                <a href="#" id="btnCerrarSesion">Cerrar sesión</a>
            </p>
        `;
        document.body.insertBefore(infoUsuario, document.body.firstChild);

        // Agregar listener para cerrar sesión
        document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    }

    cargarProductos();
});

productoForm.addEventListener('submit', manejarSubmit);
btnCancelar.addEventListener('click', limpiarFormulario);
imagenInput.addEventListener('change', manejarImagen);

// Verificar autenticación
function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
        // Si no hay ID de usuario, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // Verificar con el servidor si el usuario es válido
    fetch(`${API_URL}/auth/verificar/${usuarioId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Sesión inválida');
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                // Si la verificación falla, limpiar localStorage y redirigir
                localStorage.clear();
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            localStorage.clear();
            window.location.href = 'login.html';
        });
}

// Cerrar sesión
function cerrarSesion(e) {
    e.preventDefault();

    // Limpiar datos de autenticación del localStorage
    localStorage.clear();

    // Redirigir al login
    window.location.href = 'login.html';
}

// Funciones para el manejo de productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        productos = await response.json();
        await mostrarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

async function mostrarProductos() {
    const contenedor = document.getElementById('contenedorCards');
    contenedor.innerHTML = '';
    const template = document.getElementById('templateCard');

    for (const producto of productos) {
        const clone = template.content.cloneNode(true);

        const card = clone.querySelector('.card-productos');
        const img = clone.querySelector('.imagen-productos');
        const nombre = clone.querySelector('.nombre-productos');
        const descripcion = clone.querySelector('.descripcion-productos');
        const precio = clone.querySelector('.precio-productos')
        const categoria = clone.querySelector('.categoria-productos');
        const id = clone.querySelector('.id-productos');
        const stock = clone.querySelector('.stock-productos');

        // Imagen
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/productos/id_producto/${producto.id_producto}`);
            const data = await response.json();
            if (data.imagen) {
                img.src = `data:image/jpeg;base64,${data.imagen}`;
                img.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al cargar imagen:', error);
        }

        if ((producto.entradas - producto.salidas) <= 10) {
            stock.style.color = 'red';
            stock.textContent += ' (STOCK BAJO)';
        }

        // Mostrar si no hay stock
        if ((producto.entradas - producto.salidas) <= 0) {
            stock.textContent = 'SIN STOCK';
            stock.style.color = 'red';
            card.style.opacity = '0.7'; // Hacer la tarjeta más transparente
        }

        nombre.textContent = `${producto.nombre}`;
        descripcion.textContent = producto.descripcion;
        precio.textContent = producto.precio;
        categoria.textContent = producto.categoria;
        id.textContent = `ID: ${producto.id_producto}`;
        stock.textContent = `Stock: ${producto.entradas - producto.salidas}`;

        // Botones
        const btnEditar = clone.querySelector('.btn-editar');
        const btnEliminar = clone.querySelector('.btn-eliminar');
        btnEditar.addEventListener('click', () => editarProducto(producto.id_producto));
        btnEliminar.addEventListener('click', () => eliminarProducto(producto.id_producto));

        contenedor.appendChild(clone);
    }
}


async function manejarSubmit(e) {
    e.preventDefault();

    const entradas = parseInt(document.getElementById('entradas').value, 10);

    // Validación de máximo 100 unidades
    if (entradas > 100) {
        alert('El máximo permitido por entrada es 100 unidades');
        return;
    }

    // Obtener los valores del formulario directamente
    const producto = {
        id_producto: document.getElementById('id_producto').value || null,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categorias').value,
        entradas: parseInt(document.getElementById('entradas').value, 10),
        // salidas: parseInt(document.getElementById('salidas').value, 10),
        precio: parseFloat(document.getElementById('precio').value),
    };

    try {
        if (producto.id_producto) {
            // Si hay una imagen seleccionada, primero actualizamos la imagen
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/subir/productos/id_producto/${producto.id_producto}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
            // Luego actualizamos los datos del producto
            await actualizarProducto(producto);
        } else {
            // Primero creamos el producto
            const nuevoProducto = await crearProducto(producto);
            // Si hay una imagen seleccionada, la subimos
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/productos/id_producto/${nuevoProducto.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
        }

        limpiarFormulario();
        cargarProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar los datos: ' + error.message);
    }
}

async function crearProducto(producto) {
    const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el producto');
    }
    return await response.json();
}

async function actualizarProducto(producto) {
    const response = await fetch(`${API_URL}/productos/${producto.id_producto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el producto');
    }
    return await response.json();
}

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
        try {
            // Primero eliminamos la imagen si existe
            await fetch(`${API_URL}/imagenes/eliminar/productos/id_producto/${id}`, {
                method: 'DELETE'
            });
            // Luego eliminamos el producto
            await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
            cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto: ' + error.message);
        }
    }
}

async function editarProducto(id) {
    const producto = productos.find(p => p.id_producto === id);
    if (producto) {
        document.getElementById('id_producto').value = producto.id_producto;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('categorias').value = producto.categoria;
        document.getElementById('entradas').value = producto.entradas;
        // document.getElementById('salidas').value = producto.salidas;
        document.getElementById('precio').value = producto.precio;

        // Cargar imagen si existe
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/productos/id_producto/${id}`);
            const data = await response.json();
            if (data.imagen) {
                previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
                previewImagen.style.display = 'block';
            } else {
                previewImagen.style.display = 'none';
                previewImagen.src = '';
            }
        } catch (error) {
            console.error('Error al cargar imagen:', error);
            previewImagen.style.display = 'none';
            previewImagen.src = '';
        }
    }
}

function limpiarFormulario() {
    productoForm.reset();
    document.getElementById('id_producto').value = '';
    previewImagen.style.display = 'none';
    previewImagen.src = '';
}

// Funciones para el manejo de imágenes
function manejarImagen(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Función para convertir imagen a base64
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Eliminar el prefijo "data:image/jpeg;base64," del resultado
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}