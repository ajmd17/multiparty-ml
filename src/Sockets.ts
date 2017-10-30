import * as crypto from 'crypto';

import Arenas from './Arenas';
import ClientConnection from './ClientConnection';
import Data from './Data';

export default function Sockets(io: SocketIO.Server) {
  io.on('connection', (socket) => {
    let connection = new ClientConnection(crypto.randomBytes(20).toString('hex'), socket);

    socket.on('subscribe to arena', (arenaId) => {
      socket.join(`arena_${arenaId}`);
    });

    socket.on('unsubscribe to arena', (arenaId) => {
      socket.leave(`arena_${arenaId}`);
    });

    socket.on('join arena', (arenaId) => {
      const arena = Arenas.get(arenaId);

      if (arena == null) {
        console.error('No arena with id "' + arenaId + '"');
      } else {
        arena.connectClient(connection);
        io.in(`arena_${arenaId}`).emit('update arena', arena.toJSON());
      }
    });

    socket.on('start training', (arenaId) => {
      const arena = Arenas.get(arenaId);

      if (!arena) {
        console.error('No arena with id ' + arenaId);
      }
    
      // for testing
      try {
        arena.beginTraining(Data.DEFAULT_INPUT_DATA, Data.DEFAULT_OUTPUT_DATA);
        io.in(`arena_${arena.id}`).emit('update arena', arena.toJSON());
      } catch (err) {
        console.error('Could not train arena:', err);
      }
    });

    socket.on('disconnect', () => {
      // remove from any arenas
      for (let key of Arenas.keys()) {
        const arena = Arenas.get(key);

        if (arena.hasClient(connection)) {
          arena.disconnectClient(connection);
          io.in(`arena_${arena.id}`).emit('update arena', arena.toJSON());
        }
      }
    });
  });
};