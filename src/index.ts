import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import * as http from 'http';
import * as ws from 'ws';
import * as crypto from 'crypto';

import Arena from './Arena';
import Data from './Data';
import DataType from './DataType';
import { SchemaField, NumericalField, CategoricalField } from './SchemaField';
import Model from './Model';
import ClientConnection from './ClientConnection';


let arenas: { [id: string]: Arena } = {};
arenas['testing-testing-testing'] = new Arena(new Model());

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
const wss = new ws.Server({ server });

app.get('/active-arenas', (req, res) => {
  let arenasList = [];

  for (let key in arenas) {
    arenasList.push({
      id: key,
      state: arenas[key].state,
      numActiveClients: arenas[key].connectedClients.length
    });
  }

  res.json(arenasList);
});

app.get('/arenas/:id/train', (req, res) => {
  const arena = arenas[req.params.id];

  if (!arena) {
    return res.status(404).json({
      error: 'No arena with id ' + req.params.id
    });
  }

  // for testing
  try {
    arena.beginTraining(DEFAULT_INPUT_DATA, DEFAULT_OUTPUT_DATA);

    res.json({
      message: 'Training started'
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

wss.on('connection', (socket) => {
  let connection = new ClientConnection(crypto.randomBytes(20).toString('hex'), socket);

  socket.on('message', (data) => {
    let msgString = data.toString();
    let msgObject;
    
    try {
      msgObject = JSON.parse(msgString);
    } catch (err) {
      console.error('Failed to parse message: ', msgString);
    }

    switch (msgObject.type) {
      case 'arena.join':
        if (arenas[msgObject.arenaId] == null) {
          console.error('No arena with id "' + msgObject.arenaId + '"');
        } else {
          arenas[msgObject.arenaId].connectClient(connection);
        }

        break;
      default:
        console.error('Unrecognized message type: "' + msgObject.type + '"');
    }
  });

  socket.on('close', () => {
    // remove from any arenas
    for (let key in arenas) {
      arenas[key].disconnectClient(connection);
    }
  });
});

server.listen(8080);