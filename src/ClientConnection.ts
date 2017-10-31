import Data from './Data';

class ClientConnection {
  private _socket: SocketIO.Socket;
  private _id: string;

  completedIterations: number = 0;

  constructor(id: string, socket: SocketIO.Socket) {
    this._id = id;
    this._socket = socket;
  }

  get id() {
    return this._id;
  }

  sendInitData(inputData: (string|number)[][], outputData: (string|number)[][], offset: [number, number]) {
    this._socket.emit('receive init data', {
      inputData,
      outputData,
      offset
    });
  }
}

export default ClientConnection;