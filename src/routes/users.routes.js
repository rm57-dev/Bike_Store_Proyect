const express = require('express');
const router = express.Router();
const CrudController = require('../controllers/crud.controller');

// Instanciamos el controlador
const crud = new CrudController();

// Tabla y campo que usaremos para este CRUD
const tabla = 'usuarios';
const idCampo = 'id_usuario';

// Obtener todas las personas
router.get('/', async (req, res) => {
    try {
        const usuarios = await crud.obtenerTodos(tabla);
        // NO filtramos la contraseña aquí, se enviará tal cual de la BD
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener una persona por su ID
router.get('/:id', async (req, res) => {
    try {
        const persona = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(persona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva persona
router.post('/', async (req, res) => {
    try {
        const nuevaPersona = await crud.crear(tabla, req.body);
        res.status(201).json(nuevaPersona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una persona
router.put('/:id', async (req, res) => {
    try {
        const personaActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);
        res.json(personaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una persona
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const resultado = await crud.eliminar(tabla, idCampo, id);
        res.json(resultado);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        if (error.message.includes('Registro no encontrado')) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.status(500).json({ error: 'Error al eliminar el usuario en el servidor: ' + error.message });
        }
    }
});

module.exports = router;
