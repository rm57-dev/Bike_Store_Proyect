const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const CrudController = require('../controllers/crud.controller');


// Instanciamos el controlador
const crud = new CrudController();

// Tabla y campo que usaremos para este CRUD
const tabla = 'productos';
const idCampo = 'id_producto';

// Obtener todos los productos (sin eliminados)
router.get('/', async (req, res) => {
    try {
        const productos = await productosController.obtenerTodos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obtener una persona por su ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva persona
router.post('/', async (req, res) => {
    try {
        const nuevaProducto = await crud.crear(tabla, req.body);
        res.status(201).json(nuevaProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una persona
router.put('/:id', async (req, res) => {
    try {
        const productoActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);
        res.json(productoActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una persona
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await productosController.eliminar(id);
        res.json({ mensaje: 'Producto eliminado físicamente' });
    } catch (error) {
        // Si está asociado a una venta, intentar eliminar suavemente
        if (error.message.includes('asociado a una venta')) {
            try {
                await productosController.eliminarSuavemente(id);
                res.json({ mensaje: 'Producto eliminado suavemente' });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
