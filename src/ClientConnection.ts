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

  sendInitData(inputData: Data, outputData: Data) {
    this._socket.emit('receive init data', {
      inputData: inputData.values,
      outputData: outputData.values
    });
  }
}

export default ClientConnection;