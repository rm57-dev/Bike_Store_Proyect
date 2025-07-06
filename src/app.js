const express = require('express');
const cors = require('cors');
const path = require('path'); 
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
app.use('/api/imagenes', require('./routes/imagenes.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/reportes', require('./routes/reportes.routes')); 

module.exports = app;
