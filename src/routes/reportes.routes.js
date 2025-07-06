const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

// Ruta para reporte de ventas por cliente
router.get('/ventas-por-cliente', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        console.log(`[Backend] Solicitud de reporte de ventas por cliente. Fechas: ${fechaInicio} a ${fechaFin}`);
        const reporte = await reportesController.generarReporteVentasPorCliente(fechaInicio, fechaFin);
        console.log(`[Backend] Datos obtenidos: ${reporte.length} registros.`);
        res.json(reporte);
    } catch (error) {
        console.error('[Backend] Error en ruta de ventas por cliente:', error); 
        res.status(500).json({ error: 'Error al generar reporte en el servidor' });
    }
});

// Ruta para reporte de artículos más vendidos
router.get('/articulos-mas-vendidos', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const reporte = await reportesController.generarReporteArticulosMasVendidos(fechaInicio, fechaFin);
        res.json(reporte);
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ error: 'Error al generar reporte' });
    }
});

module.exports = router;