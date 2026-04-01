const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const ticketsRoutes = require('./routes/tickets');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta frontend ubicado en la raíz
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/tickets', ticketsRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
