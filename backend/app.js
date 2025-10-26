import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import { connection } from './db/connection.js';
import { startSocketServer } from './sockets/ioInstance.js';
import indexRoutes from './routes/index.js';
import helmet from 'helmet';
import cors from 'cors';

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
const allowedOrigins = new Set([ // Frontend en desarrollo
  'http://localhost:5173',
  'http://127.0.0.1:5173', // Alternativa
]);

// Eliminación del middleware de CORS para aplicar la Política del Mismo Origen (SOP)

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
app.use(helmet.frameguard({ action: 'deny' }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'none'"],
      },
    },
    frameguard: {
      action: 'deny',
    },
  })
);

// Middleware para forzar las cabeceras de seguridad
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' ws: http: https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data:; connect-src 'self' ws: http: https:; frame-ancestors 'none';"
  );
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

/* 
-------------- IMPLEMENTACIÓN --------------
Middleware para forzar el encabezado Access-Control-Allow-Origin
*/
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'DENY');
  }
  next();
});

/* 
-------------- IMPLEMENTACIÓN --------------
Middleware de CORS con configuración restrictiva
*/
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: This origin is not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Routes
app.use('/', indexRoutes);

// Sockets
const server = http.createServer(app);
startSocketServer(server);

export default server;