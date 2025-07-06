-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS bikestore_ivan;
USE bikestore_ivan;

-- Crear tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100) unique,
    clave VARCHAR(500),
    rol ENUM('cliente', 'admin', 'super_usuario') DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

Select * From usuarios;

-- Crear tabla productos con campo stock calculado
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,            -- Identificador único autoincremental
    nombre VARCHAR(100) NOT NULL,                          -- Nombre del producto
    descripcion TEXT,                                      -- Descripción del producto
    categoria VARCHAR(100),                                -- Categoría a la que pertenece el producto
    entradas INT DEFAULT 0 CHECK (entradas >= 0),          -- Entradas no negativas
    salidas INT DEFAULT 0 CHECK (salidas >= 0),            -- La cantidad de productos que se venden
    stock INT AS (entradas - salidas) VIRTUAL,             -- Stock calculado automáticamente
    precio DECIMAL(10,2) NOT NULL,                         -- Precio con dos decimales
    imagen LONGBLOB,                                       -- Imagen del producto en binario
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,     -- Fecha de creación del registro
	fecha_eliminacion date
);

-- Ver los registros actuales de la tabla productos
SELECT * FROM productos;

CREATE TABLE ventas (
    id_ventas INT AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    cantidad_productos INT NOT NULL,
    PRIMARY KEY (id_ventas),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

SELECT * FROM ventas;

-- Tabla de detalles de venta

CREATE TABLE detalle_venta (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_ventas INT NOT NULL,
    id_producto INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_ventas) REFERENCES ventas(id_ventas),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

SELECT * FROM detalle_venta;
