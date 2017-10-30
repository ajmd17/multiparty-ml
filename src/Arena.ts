import Model from './Model';
import { ProcessingModelData } from './ModelData';
import Data from './Data';
import ClientConnection from './ClientConnection';

enum ArenaState {
  IDLE,
  TRAINING,
  COMPLETED
}

class Arena {
  private _processingModelData: ProcessingModelData;
  private _state: ArenaState = ArenaState.IDLE;

  connectedClients: ClientConnection[];

  constructor(public id: string, activeModel?: Model) {
    this.connectedClients = [];
    this._initProcessingModelData(activeModel);
  }

  private _initProcessingModelData(activeModel?: Model) {
    if (activeModel) {
      this._processingModelData = {
        weights: activeModel.weights,
        bias: activeModel.bias,
        deltaBias: 0.0
      };
    } else {
      this._processingModelData = {
        weights: { w: [], v: [] },
        bias: [],
        deltaBias: 0.0
      };
    }
  }

  get state() {
    return this._state;
  }

  private _indexOfClient(client: ClientConnection) {
    let index = this.connectedClients.indexOf(client);

    if (index !== -1) {
      return index;
    }

    for (let i = 0; i < this.connectedClients.length; i++) {
      if (this.connectedClients[i].id == client.id) {
        return i;
      }
    }

    return -1;
  }

  hasClient(client: ClientConnection) {
    return this._indexOfClient(client) !== -1;
  }

  connectClient(client: ClientConnection) {
    if (this._indexOfClient(client) === -1) {
      this.connectedClients.push(client);
    }
  }

  disconnectClient(client: ClientConnection) {
    let index = this._indexOfClient(client);

    if (index !== -1) {
      this.connectedClients.splice(index, 1);
    }
  }

  private _handleDeltasUpdate(deltas: ProcessingModelData, offset: number) {
    for (let i = 0; i < deltas.weights.v.length; i++) {
      this._processingModelData.weights.v[offset + i] += deltas.weights.v[i];
    }

    for (let i = 0; i < deltas.weights.w.length; i++) {
      for (let j = 0; j < deltas.weights.w[i].length; j++) {
        this._processingModelData.weights.w[offset + i][j] += deltas.weights.w[i][j];
      }
    }

    for (let i = 0; i < deltas.bias.length; i++) {
      this._processingModelData.bias[offset + i] += deltas.bias[i];
    }
  }

  beginTraining(inputData: Data, outputData: Data) {
    switch (this._state) {
      case ArenaState.TRAINING:
        throw Error('Training already started');
      case ArenaState.COMPLETED:
        throw Error('Training already completed');
    }

    this._state = ArenaState.TRAINING;

    let inputSplit = inputData.divideEvenly(this.connectedClients.length);
    let outputSplit = outputData.divideEvenly(this.connectedClients.length);

    this.connectedClients.forEach((client, i) => {
      client.sendInitData(inputSplit[i], outputSplit[i]);
    });
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
      numActiveClients: this.connectedClients.length
    };
  }
}

export default Arena;