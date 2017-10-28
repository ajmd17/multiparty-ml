import Data from './Data';
import * as WebSocket from 'ws';

class ClientConnection {
  private _socket: WebSocket;
  private _id: string;

  completedIterations: number = 0;

  constructor(id: string, socket: WebSocket) {
    this._id = id;
    this._socket = socket;
  }

  get id() {
    return this._id;
  }

  sendInitData(inputData: Data, outputData: Data) {
    this._socket.send(JSON.stringify({
      type: 'data.init',
      inputData: inputData.values,
      outputData: outputData.values
    }));
  }
}

export default ClientConnection;