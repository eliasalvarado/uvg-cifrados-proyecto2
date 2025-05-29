import { Server } from 'socket.io';
import socketHandler from './socketHandler.js';
import { verifyToken } from '../utils/auth.js';

let io = null;

const startSocketServer = async (server) => {

    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const user = verifyToken(token);
            console.log('Usuario autenticado en sockets:', user);
            socket.user = user;
            next();
        } catch (err) {
            console.error('Error de autenticación en sockets:', err);
            next(new Error("Autenticación inválida"));
        }
    });

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);

        const userId = socket.user.id;
        if (userId) {
            socket.join(userId.toString()); // el socket se une a la sala de ese usuario
            console.log(`Socket ${socket.id} unido a la sala ${userId}`);
            console.log('Salas del socket:', socket.rooms);
        }

        socketHandler(io, socket);
    }
    );

}

export {io, startSocketServer};