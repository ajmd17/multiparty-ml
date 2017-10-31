import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import * as http from 'http';
import * as crypto from 'crypto';

import Arenas from './Arenas';
import Data from './Data';
import { SchemaField, NumericalField, CategoricalField } from './SchemaField';
import ClientConnection from './ClientConnection';


const DEFAULT_INPUT_DATA = new Data([
  new NumericalField('x'),
  new NumericalField('y')
], [
  [1.2, 2.4],
  [1.6, 6,7],
  [1.8, 8.9],
  [0.5, 4.1]
]);

const DEFAULT_OUTPUT_DATA = new Data([
  new NumericalField('z')
], [
  [0],
  [1],
  [1],
  [0]
]);


const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

app.get('/api/arenas/:id', (req, res) => {
  const arena = Arenas.get(req.params.id);

  if (arena == null) {
    return res.sendStatus(404);
  }

  res.json({ arena: arena.toJSON() });
});

app.get('/active-arenas', (req, res) => {
  let arenasList = [];

  for (let key of Arenas.keys()) {
    arenasList.push(Arenas.get(key).toJSON());
  }

  res.json(arenasList);
});

app.get('/arenas/:id/train', (req, res) => {
  const arena = Arenas.get(req.params.id);

  if (!arena) {
    return res.status(404).json({
      error: 'No arena with id ' + req.params.id
    });
  }

  // for testing
  try {
    arena.beginTraining(DEFAULT_INPUT_DATA, DEFAULT_OUTPUT_DATA, 1000);

    res.json({
      message: 'Training started'
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

app.use('/js', express.static(path.join(__dirname, '..', 'lib', 'public', 'js')));
app.use(/\/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

import Sockets from './Sockets';
Sockets(io);

server.listen(8080);