import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { chatHandler } from './sockets/chat.js';
import { verifyToken } from './utils/auth.js';
import indexRoutes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Routes
app.use('/', indexRoutes);

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
        chatHandler(io, socket);
    }
);

export default server;