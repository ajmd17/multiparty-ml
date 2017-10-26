import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import * as http from 'http';


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

