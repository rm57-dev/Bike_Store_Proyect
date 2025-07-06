const API_URL = "http://localhost:3000/api";
const { jsPDF } = window.jspdf;

let reporteVentasCliente = [];
let reporteArticulosVendidos = [];

function getFechaFinCompleta(fecha) {
    return fecha;
}

async function generarReporteCliente() {
    const fechaInicio = document.getElementById("fechaInicioCliente").value;
    const fechaFinRaw = document.getElementById("fechaFinCliente").value;
    const fechaFin = getFechaFinCompleta(fechaFinRaw);

    if (!fechaInicio || !fechaFinRaw) {
        alert("Por favor seleccione ambas fechas");
        return;
    }

    try {
        const resp = await fetch(
            `${API_URL}/reportes/ventas-por-cliente?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (!resp.ok)
            throw new Error((await resp.json()).error || "Error desconocido");

        const json = await resp.json();
        console.table(json); // DEBUG
        reporteVentasCliente = Array.isArray(json)
            ? json
            : json.ventas ?? json.data ?? [];

        mostrarReporteCliente();
        if (!reporteVentasCliente.length)
            alert("No se encontraron ventas para el rango seleccionado.");
    } catch (e) {
        console.error(e);
        alert("Error al generar reporte: " + e.message);
    }
}

async function generarReporteArticulos() {
    const fechaInicio = document.getElementById("fechaInicioArticulos").value;
    const fechaFinRaw = document.getElementById("fechaFinArticulos").value;
    const fechaFin = getFechaFinCompleta(fechaFinRaw);

    if (!fechaInicio || !fechaFinRaw) {
        alert("Por favor seleccione ambas fechas");
        return;
    }

    try {
        const resp = await fetch(
            `${API_URL}/reportes/articulos-mas-vendidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (!resp.ok)
            throw new Error((await resp.json()).error || "Error desconocido");

        const json = await resp.json();
        console.table(json); // DEBUG
        reporteArticulosVendidos = Array.isArray(json)
            ? json
            : json.articulos ?? json.data ?? [];

        mostrarReporteArticulos();
        if (!reporteArticulosVendidos.length)
            alert("No se encontraron artículos en el rango seleccionado.");
    } catch (e) {
        console.error(e);
        alert("Error al generar reporte: " + e.message);
    }
}

function mostrarReporteCliente() {
    const tbody = document.querySelector("#tablaClientes tbody");
    tbody.innerHTML = "";

    if (reporteVentasCliente.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4">No hay ventas por cliente en el rango de fechas seleccionado.</td></tr>';
        return;
    }

    reporteVentasCliente.forEach((v) => {
        const total = Number(v.total); // ← NUEVA línea
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(v.fecha).toLocaleDateString()}</td>
            <td>${v.id_ventas}</td>
            <td>${v.nombre_cliente}</td>
            <td>$${total.toFixed(2)}</td>`; 
        tbody.appendChild(tr);
    });
}

function mostrarReporteArticulos() {
    const tbody = document.querySelector("#tablaArticulos tbody");
    tbody.innerHTML = "";

    if (reporteArticulosVendidos.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4">No hay artículos vendidos en el rango de fechas seleccionado.</td></tr>';
        return;
    }

    reporteArticulosVendidos.forEach((a) => {
        const total = Number(a.total_venta); // ← NUEVA línea
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.id_producto}</td>
            <td>${a.descripcion_articulo}</td>
            <td>$${total.toFixed(2)}</td>  
            <td>${a.cantidad_vendida}</td>`;
        tbody.appendChild(tr);
    });
}

async function exportarPDFCliente() {
    if (reporteVentasCliente.length === 0) {
        alert("Genere el reporte primero");
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    const usuarioEmisor = `${usuario.nombre ?? "Sistema"} ${usuario.apellido ?? ""
        }`.trim();
    const fechaEmision = new Date().toLocaleString();

    const doc = new jsPDF();
    doc
        .setFontSize(18)
        .text("Reporte de ventas por cliente", 105, 15, { align: "center" });
    doc
        .setFontSize(10)
        .text(`Fecha de emisión: ${fechaEmision}`, 14, 25)
        .text(`Usuario emisor:   ${usuarioEmisor}`, 14, 30);

    const headers = [["Fecha", "ID Venta", "Cliente", "Total"]];
    const data = reporteVentasCliente.map((r) => [
        new Date(r.fecha).toLocaleDateString(),
        r.id_ventas,
        r.nombre_cliente,
        `$${Number(r.total).toFixed(2)}`, // ← convierte a Number
    ]);

    doc.autoTable({
        startY: 40,
        head: headers,
        body: data,
        margin: { top: 40 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc
            .setPage(i)
            .setFontSize(8)
            .text(`Página ${i} de ${pages}`, 105, 285, { align: "center" });
    }
    doc.save(
        `reporte_ventas_cliente_${new Date().toISOString().slice(0, 10)}.pdf`
    );
}

async function exportarPDFArticulos() {
    if (reporteArticulosVendidos.length === 0) {
        alert("Genere el reporte de artículos más vendidos primero.");
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    const usuarioEmisor = `${usuario.nombre ?? "Sistema"} ${usuario.apellido ?? ""
        }`.trim();
    const fechaEmision = new Date().toLocaleDateString();

    const doc = new jsPDF();
    doc
        .setFontSize(16)
        .text("Reporte de Artículos Más Vendidos", 105, 15, { align: "center" });
    doc
        .setFontSize(10)
        .text(`Fecha de emisión: ${fechaEmision}`, 14, 25)
        .text(`Usuario emisor:   ${usuarioEmisor}`, 14, 30);

    const headers = [
        ["ID Artículo", "Descripción", "Total Ventas", "Cantidad Vendida"],
    ];
    const data = reporteArticulosVendidos.map(r => [
        r.id_producto,
        r.descripcion_articulo,
        `$${Number(r.total_venta).toFixed(2)}`,     // ← convierte a Number
        r.cantidad_vendida
    ]);

    doc.autoTable({
        startY: 40,
        head: headers,
        body: data,
        margin: { top: 40 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc
            .setPage(i)
            .setFontSize(8)
            .text(`Página ${i} de ${pages}`, 105, 285, { align: "center" });
    }
    doc.save(
        `reporte_articulos_vendidos_${new Date().toISOString().slice(0, 10)}.pdf`
    );
}
