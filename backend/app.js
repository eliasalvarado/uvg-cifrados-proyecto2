import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connection } from './db/connection.js';
import { Server } from 'socket.io';
import socketHandler from './sockets/socketHandler.js';
import { verifyToken } from './utils/auth.js';
import indexRoutes from './routes/index.js';
import signatureRoutes from '../backend/apiServices/signature/signature.route.js';
import './apiServices/oauth/oauth.google.js';

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
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      // const user = verifyToken(token);
      socket.user = undefined;
      next();
    } catch (err) {
      next(new Error("Autenticación inválida"));
    }
});

io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);
        socketHandler(io, socket);
    }
);

export default server;