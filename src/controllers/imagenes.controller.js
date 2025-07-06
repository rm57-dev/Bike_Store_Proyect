const db = require('../config/db');

class ImagenesController {
    // Subir o actualizar una imagen (como binario)
    async subirImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Verificar si el registro existe
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);
            
            if (registro.length === 0) {
                return { error: 'No se encontró el registro con el ID proporcionado.' };
            }

            // Convertir la imagen de base64 a binario
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Ejecutar la consulta para actualizar la imagen en la tabla correspondiente
            const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
            const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

            if (result.affectedRows > 0) {
                return { message: 'Imagen actualizada correctamente.' };
            } else {
                return { error: 'Error al actualizar la imagen.' };
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }

    // Obtener la imagen en base64
    async obtenerImagen(tabla, campoId, id) {
        try {
            // Consultar la imagen en binario de la base de datos
            const [rows] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if (rows.length === 0) {
                return { error: 'Registro no encontrado' };
            }

            if (!rows[0].imagen) {
                return { error: 'No hay imagen asociada a este registro' };
            }

            // Convertir la imagen binaria a base64
            const imagenBase64 = rows[0].imagen.toString('base64');

            return { imagen: imagenBase64 };
        } catch (error) {
            console.error('Error al obtener la imagen:', error);
            throw error;
        }
    }

    // Eliminar la imagen (limpiar el campo de imagen en la base de datos)
    async eliminarImagen(tabla, campoId, id) {
        try {
            // Verificar si el registro existe
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);
            
            if (registro.length === 0) {
                return { error: 'No se encontró el registro con el ID proporcionado.' };
            }

            // Ejecutar la consulta para actualizar el campo imagen a NULL
            const query = `UPDATE ?? SET imagen = NULL WHERE ?? = ?`;
            const [result] = await db.query(query, [tabla, campoId, id]);

            if (result.affectedRows > 0) {
                return { message: 'Imagen eliminada correctamente.' };
            } else {
                return { error: 'Error al eliminar la imagen.' };
            }
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            throw error;
        }
    }

    // Insertar una nueva imagen (guardar como binario)
    async insertarImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Verificar si el registro existe
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);
            
            if (registro.length === 0) {
                return { error: 'No se encontró el registro con el ID proporcionado.' };
            }

            // Convertir la imagen de base64 a binario
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Verificar si ya existe una imagen
            const [imagenExistente] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);
            
            if (imagenExistente[0]?.imagen) {
                // Si ya existe una imagen, actualizamos
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);
                
                if (result.affectedRows > 0) {
                    return { message: 'Imagen actualizada correctamente.' };
                } else {
                    return { error: 'Error al actualizar la imagen.' };
                }
            } else {
                // Si no existe imagen, insertamos
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);
                
                if (result.affectedRows > 0) {
                    return { message: 'Imagen insertada correctamente.' };
                } else {
                    return { error: 'Error al insertar la imagen.' };
                }
            }
        } catch (error) {
            console.error('Error al insertar la imagen:', error);
            throw error;
        }
    }

    // CRUD completo para manejar imágenes (binario y base64)
    async procesarImagen(tabla, campoId, id, imagenBase64 = null) {
        if (imagenBase64) {
            // Si la imagen es proporcionada en base64, guardamos o actualizamos
            return await this.subirImagen(tabla, campoId, id, imagenBase64);
        } else {
            // Si no se proporciona imagen, solo obtenemos la imagen en base64
            return await this.obtenerImagen(tabla, campoId, id);
        }
    }
}

// Exportar el controlador para ser utilizado en otras partes de la aplicación
module.exports = new ImagenesController();
