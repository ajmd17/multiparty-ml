import Model from './Model';
import { ProcessingModelData } from './shared/ModelData';
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
  private _delegations: {
    [clientId: string]: {
      dataSlices: [Data, Data],
      completedIter: number,
      assignedIter: number
    }
  } = {};

  static State = ArenaState;

  connectedClients: ClientConnection[];

  constructor(public id: string, activeModel?: Model) {
    this.connectedClients = [];
    this.activeModel = activeModel;
  }

  get state() {
    return this._state;
  }

  get activeModel() {
    return this._processingModelData;
  }

  set activeModel(model: Model) {
    this._processingModelData = new ProcessingModelData(
      model.cloneWeights(), model.cloneBias(), 0.0
    );
  }

  get trainingComplete() {
    if (this._state == ArenaState.COMPLETED) {
      return true;
    }

    for (let key in this._delegations) {
      if (this._delegations[key].completedIter < this._delegations[key].assignedIter) {
        return false;
      }
    }

    return true;
  }

  stats() {
    let res: {
      completedIter: number,
      assignedIter: number
    }[] = [];

    for (let key in this._delegations) {
      res.push({
        completedIter: this._delegations[key].completedIter,
        assignedIter: this._delegations[key].assignedIter
      });
    }

    return res;
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
      this._delegations[client.id] = {
        dataSlices: null,
        assignedIter: NaN,
        completedIter: NaN
      };
    }
  }

  disconnectClient(client: ClientConnection) {
    let index = this._indexOfClient(client);

    if (index !== -1) {
      this.connectedClients.splice(index, 1);
      delete this._delegations[client.id];
    }
  }

  addDeltaUpdates(client: ClientConnection, deltaModel: ProcessingModelData) {
    if (this._delegations[client.id]) {
      this._delegations[client.id].completedIter++;
    }

    for (let i = 0; i < deltaModel.weights.v.length; i++) {
      this._processingModelData.weights.v[i] += deltaModel.weights.v[i];
    }

    for (let i = 0; i < deltaModel.weights.w.length; i++) {
      for (let j = 0; j < deltaModel.weights.w[i].length; j++) {
        this._processingModelData.weights.w[i][j] += deltaModel.weights.w[i][j];
      }
    }

    for (let i = 0; i < deltaModel.bias.length; i++) {
      this._processingModelData.bias[i] += deltaModel.bias[i];
    }
  }

  beginTraining(inputData: Data, outputData: Data, numIterations: number) {
    switch (this._state) {
      case ArenaState.TRAINING:
        throw Error('Training already started');
      case ArenaState.COMPLETED:
        throw Error('Training already completed');
    }

    this._processingModelData.initialize(inputData.values[0].length);
    this._state = ArenaState.TRAINING;

    let inputSplit = inputData.divideEvenly(this.connectedClients.length);
    let outputSplit = outputData.divideEvenly(this.connectedClients.length);

    this.connectedClients.forEach((client, i) => {
      client.sendInitData(
        inputSplit[i].values,
        outputSplit[i].values,
        inputSplit[i].offset
      );

      this._delegations[client.id].dataSlices = [inputSplit[i], outputSplit[i]];
      this._delegations[client.id].assignedIter = numIterations;
      this._delegations[client.id].completedIter = 0;
    });
  }

  finishTraining() {
    switch (this._state) {
      case ArenaState.IDLE:
        throw Error('Training not started');
      case ArenaState.COMPLETED:
        throw Error('Training already completed');
    }

    this.reset();
    this._state = ArenaState.COMPLETED;
  }

  reset() {
    this.connectedClients = [];
    this._delegations = {};
    this._processingModelData = null;
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