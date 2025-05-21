const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
