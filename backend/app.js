import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connection } from './db/connection.js';
import { startSocketServer } from './sockets/ioInstance.js';
import indexRoutes from './routes/index.js';
import { start } from 'repl';
import helmet from 'helmet';

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos.', err);
    return;
  }
  console.log('Conexión a la base de datos exitosa.');
});

const app = express();

/* 
-------------- IMPLEMENTACIÓN --------------
Mitigación del error:
El servidor divulga información mediante un campo(s) de encabezado de respuesta HTTP ''''X-Powered-By''''  
*/
app.disable('x-powered-by');


/* 
-------------- IMPLEMENTACIÓN --------------
Mitigación del error:
Configuración Incorrecta Cross-Domain
*/
const allowedOrigins = [ // Frontend en desarrollo
  'http://localhost:5173',
  'http://127.0.0.1:5173', // Alternativa
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por la política CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

/* 
-------------- IMPLEMENTACIÓN --------------
Mitigación del error:
Falta encabezado X-Content-Type-Options 
*/
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Evita que los navegadores interpreten incorrectamente el tipo de contenido
  next();
});


/* 
-------------- IMPLEMENTACIÓN --------------
Mitigación del error:
Falta de cabecera Anti-Clickjacking
*/
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Routes
app.use('/', indexRoutes);

// Sockets
const server = http.createServer(app);
startSocketServer(server);

export default server;