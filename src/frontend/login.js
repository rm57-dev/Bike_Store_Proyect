// API URL base
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const mensajeDiv = document.getElementById('mensaje');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', manejarLogin);
    
    // Verificar si el usuario ya está autenticado
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
        // Si ya está autenticado, redirigir a la página principal
        window.location.href = 'index.html';
    }
});

// Función para manejar el inicio de sesión
async function manejarLogin(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const email = document.getElementById('email').value;
    const clave = document.getElementById('clave').value;
    
    try {
        // Enviar solicitud de inicio de sesión
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, clave })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Guardar información del usuario en localStorage
            localStorage.setItem('usuarioId', resultado.usuario.id_usuario);
            localStorage.setItem('usuarioNombre', resultado.usuario.nombre);
            localStorage.setItem('usuariodescripcion', resultado.usuario.apellido);
            localStorage.setItem('usuarioEmail', resultado.usuario.email);
            localStorage.setItem('usuarioRol', resultado.usuario.rol);
            
            mostrarMensaje('Inicio de sesión exitoso. Redirigiendo...', true);
            
            // Redirigir a la página principal
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            mostrarMensaje(resultado.message, false);
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mostrarMensaje('Error al procesar el inicio de sesión. Intente nuevamente.', false);
    }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, esExito) {
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = 'block';
    
    if (esExito) {
        mensajeDiv.style.backgroundColor = '#d4edda';
        mensajeDiv.style.color = '#155724';
    } else {
        mensajeDiv.style.backgroundColor = '#f8d7da';
        mensajeDiv.style.color = '#721c24';
    }
}