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

// Verificar autenticación
function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }
    // Si quieres verificar con el backend, puedes agregar aquí la llamada fetch como en productos.js
}

// Cerrar sesión
function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'login.html';
}