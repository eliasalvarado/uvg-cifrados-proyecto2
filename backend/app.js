import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connection } from './db/connection.js';
import { startSocketServer } from './sockets/ioInstance.js';
import indexRoutes from './routes/index.js';
import signatureRoutes from '../backend/apiServices/signature/signature.route.js';
import { start } from 'repl';

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos.', err);
    return;
  }
  console.log('Conexión a la base de datos exitosa.');
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Routes
app.use('/', indexRoutes);
app.use('/signature', signatureRoutes);

// Sockets
const server = http.createServer(app);
startSocketServer(server);

export default server;