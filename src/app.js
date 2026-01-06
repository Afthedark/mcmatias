const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models'); // Load associations

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes y videos)
app.use('/uploads', express.static('public/uploads'));

// Routes
const routes = require('./routes/index');

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de MultiCentro Matias' });
});

// Basic Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

async function startServer() {
    try {
        // Authenticate database connection
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sync models
        await sequelize.sync();
        console.log('Modelos sincronizados con la base de datos.');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// Solo iniciar el servidor si este archivo se ejecuta directamente
if (require.main === module) {
    startServer();
}

module.exports = app;
