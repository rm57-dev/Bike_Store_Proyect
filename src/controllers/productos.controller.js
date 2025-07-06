const db = require('../config/db');

class ProductosController {
    // Mostrar solo productos sin fecha de eliminación
    async obtenerTodos() {
        const [resultados] = await db.query(
            `SELECT * FROM productos WHERE fecha_eliminacion IS NULL`
        );
        return resultados.map(item => ({
            ...item,
            precio: item.precio !== null ? Number(item.precio) : 0
        }));
    }

    async obtenerUno(id_producto) {
        const [resultado] = await db.query(
            `SELECT * FROM productos WHERE id_producto = ? AND fecha_eliminacion IS NULL`,
            [id_producto]
        );
        return resultado[0];
    }

    async crear(data) {
        const [resultado] = await db.query(`INSERT INTO productos SET ?`, [data]);
        return { ...data, id_producto: resultado.insertId };
    }

    async actualizar(id_producto, data) {
        const [resultado] = await db.query(
            `UPDATE productos SET ? WHERE id_producto = ?`,
            [data, id_producto]
        );
        return await this.obtenerUno(id_producto);
    }

    // Eliminación física (solo si no está en ventas)
    async eliminar(id_producto) {
        const [ventas] = await db.query(
            `SELECT COUNT(*) AS total FROM detalle_venta WHERE id_producto = ?`,
            [id_producto]
        );

        if (ventas[0].total > 0) {
            throw new Error('El producto está asociado a una venta. No puede ser eliminado físicamente.');
        }

        const [resultado] = await db.query(
            `DELETE FROM productos WHERE id_producto = ?`,
            [id_producto]
        );
        return { mensaje: 'Producto eliminado físicamente' };
    }

    // Soft delete (actualizar la fecha de eliminación)
    async eliminarSuavemente(id_producto) {
        const [resultado] = await db.query(
            `UPDATE productos SET fecha_eliminacion = CURDATE() WHERE id_producto = ?`,
            [id_producto]
        );
        return { mensaje: 'Producto eliminado suavemente' };
    }
}

module.exports = new ProductosController();
