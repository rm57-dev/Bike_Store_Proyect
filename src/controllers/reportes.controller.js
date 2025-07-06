const db = require('../config/db');
const jsPDF = require('jspdf');
require('jspdf-autotable');

class ReportesController {
    async generarReporteVentasPorCliente(fechaInicio, fechaFin) {
        const query = `
            SELECT
                v.fecha,
                v.id_ventas,
                CONCAT(u.nombre,' ',u.apellido) AS nombre_cliente,
                v.total
            FROM ventas v
            JOIN usuarios u ON v.id_usuario = u.id_usuario
            WHERE v.fecha >= ? AND v.fecha < DATE_ADD( ?, INTERVAL 1 DAY )
            ORDER BY v.fecha DESC
        `;

        console.log('[Controller] Generando ventas por cliente:', fechaInicio, fechaFin);
        const [rows] = await db.query(query, [fechaInicio, fechaFin]);
        console.log('[Controller] Filas devueltas:', rows.length);
        return rows;
    }

        async generarReporteArticulosMasVendidos(fechaInicio, fechaFin) {
        const query = `
            SELECT
                p.id_producto,
                p.nombre AS descripcion_articulo,
                SUM(dv.precio_unitario * dv.cantidad) AS total_venta,
                SUM(dv.cantidad)                         AS cantidad_vendida
            FROM detalle_venta dv
            JOIN ventas    v ON dv.id_ventas  = v.id_ventas
            JOIN productos p ON dv.id_producto = p.id_producto
            WHERE v.fecha >= ? AND v.fecha < DATE_ADD( ?, INTERVAL 1 DAY )
            GROUP BY p.id_producto, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 10
        `;
        const [rows] = await db.query(query, [fechaInicio, fechaFin]);
        return rows;
    }

    generarPDF(reporte, tipoReporte, usuarioEmisor) {
        const doc = new jsPDF();
        const fechaEmision = new Date().toLocaleString();

        // Encabezado del reporte
        doc.setFontSize(18);
        doc.text(`Reporte de ${tipoReporte}`, 105, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Fecha de emisión: ${fechaEmision}`, 14, 25);
        doc.text(`Usuario emisor: ${usuarioEmisor}`, 14, 30);

        // Datos del reporte
        const headers = tipoReporte === 'ventas por cliente'
            ? ['Fecha', 'ID Venta', 'Cliente', 'Total']
            : ['ID Artículo', 'Descripción', 'Total Ventas', 'Cantidad Vendida']; 

        const data = reporte.map(item => {
            return tipoReporte === 'ventas por cliente'
                ? [new Date(item.fecha).toLocaleDateString(), item.id_ventas, item.nombre_cliente, `$${item.total.toFixed(2)}`]
                : [item.id_producto, item.descripcion_articulo, `$${item.total_venta.toFixed(2)}`, item.cantidad_vendida];
        });

        doc.autoTable({
            startY: 40,
            head: [headers],
            body: data,
            margin: { top: 40 },
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        // Pie de página con numeración
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        }

        return doc;
    }
}

module.exports = new ReportesController();