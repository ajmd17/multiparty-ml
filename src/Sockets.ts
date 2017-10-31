import * as crypto from 'crypto';

import Arenas from './Arenas';
import { ProcessingModelData } from './shared/ModelData';
import ClientConnection from './ClientConnection';
import Data from './Data';

export default function Sockets(io: SocketIO.Server) {
  io.on('connection', (socket) => {
    let connection = new ClientConnection(crypto.randomBytes(20).toString('hex'), socket);

    socket.on('subscribe to arena', (arenaId) => {
      socket.join(`arena_${arenaId}`);
    });

    socket.on('unsubscribe from arena', (arenaId) => {
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

    socket.on('request start training', (arenaId) => {
      const arena = Arenas.get(arenaId);

      if (!arena) {
        console.error('No arena with id ' + arenaId);
      }
    
      // for testing
      try {
        arena.beginTraining(Data.DEFAULT_INPUT_DATA, Data.DEFAULT_OUTPUT_DATA, 1000);
        io.in(`arena_${arena.id}`).emit('update arena', arena.toJSON());
        io.in(`arena_${arena.id}`).emit('start training', arena.activeModel.toJSON(), 1000);

        // send stats right away at first
        io.in(`arena_${arena.id}`).emit('arena stats', arena.stats());

        let sendStatsInterval = setInterval(() => {
          io.in(`arena_${arena.id}`).emit('arena stats', arena.stats());

          if (arena.state !== 1) {
            clearTimeout(sendStatsInterval);
          }
        }, 1000);
      } catch (err) {
        console.error('Could not train arena:', err);
      }
    });

    socket.on('delta updates', (arenaId: string, deltaModel: ProcessingModelData) => {
      const arena = Arenas.get(arenaId);

      if (!arena) {
        console.error('No arena with id ' + arenaId);
      }

      arena.addDeltaUpdates(connection, deltaModel);
      socket.broadcast.emit('sync delta updates', deltaModel);

      if (arena.trainingComplete) {
        arena.finishTraining();
        io.in(`arena_${arena.id}`).emit('finish training');
        io.in(`arena_${arena.id}`).emit('update arena', arena.toJSON());
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