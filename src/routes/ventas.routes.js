const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');

// Ruta para crear una nueva venta
router.post('/', async (req, res) => {
    try {
        const resultado = await ventasController.crearVenta(req.body);
        res.json(resultado);
    } catch (error) {
        console.error('Error en ruta de ventas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al registrar la venta'
        });
    }
});

module.exports = router;