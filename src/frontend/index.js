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