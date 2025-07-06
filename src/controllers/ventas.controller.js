const db = require('../config/db');

class VentasController {
    async crearVenta(ventaData) {
        try {
            // Iniciar transacción
            await db.query('START TRANSACTION');
            
            // 1. Crear la venta principal
            const [resultVenta] = await db.query(
                'INSERT INTO ventas (id_usuario, total, cantidad_productos) VALUES (?, ?, ?)',
                [ventaData.id_usuario, ventaData.total, ventaData.cantidad_productos]
            );
            
            const idVenta = resultVenta.insertId;
            
            // 2. Crear detalles de venta y actualizar stock
            for (const item of ventaData.items) {
                // Insertar detalle
                await db.query(
                    'INSERT INTO detalle_venta (id_ventas, id_producto, precio_unitario, cantidad) VALUES (?, ?, ?, ?)',
                    [idVenta, item.id_producto, item.precio_unitario, item.cantidad]
                );
                
                // Actualizar stock (incrementar salidas)
                await db.query(
                    'UPDATE productos SET salidas = salidas + ? WHERE id_producto = ?',
                    [item.cantidad, item.id_producto]
                );
            }
            
            // Confirmar transacción
            await db.query('COMMIT');
            
            return { 
                success: true,
                id_venta: idVenta
            };
            
        } catch (error) {
            // Revertir en caso de error
            await db.query('ROLLBACK');
            console.error('Error al crear venta:', error);
            throw error;
        }
    }
}

module.exports = new VentasController();