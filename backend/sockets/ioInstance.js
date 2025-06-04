import { Server } from 'socket.io';
import socketHandler from './socketHandler.js';
import { verifyToken } from '../utils/auth.js';
import { getGroupsIdForUser } from '../apiServices/chat/chat.model.js';

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
        }


         // Obtener grupos del usuario y unirse a cada uno

        getGroupsIdForUser(userId).then((groupsId) => {

            for (const groupId of groupsId) {
                const roomName = `group_${groupId}`;
                socket.join(roomName);
                console.log(`Usuario ${userId} se ha unido a la sala de grupo ${roomName}`);
            }
        }).catch((err) => {
            console.error('Error al obtener grupos del usuario:', err);
        });
       

        socketHandler(io, socket);
    }
    );

}

export {io, startSocketServer};