const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models'); // Load associations

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configuración CORS más permisiva para desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir orígenes sin origen (como apps móviles, Postman)
    if (!origin) return callback(null, true);
    
    // En producción, solo permitir dominios específicos
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        'https://tu-dominio.com',
        'https://www.tu-dominio.com'
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    }
    
    // En desarrollo, permitir cualquier origen local
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.') || origin.includes('10.0.')) {
      return callback(null, true);
    }
    
    // Para otros orígenes en desarrollo
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes y videos)
app.use('/uploads', express.static('public/uploads'));

// En arquitectura separada, no servimos el frontend estático desde el backend
// app.use(express.static('../frontend')); // Comentado para arquitectura separada

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
