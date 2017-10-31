import TrainingData from '../../shared/TrainingData';
import { ProcessingModelData } from '../../shared/ModelData';
import forwardPropagation from '../../shared/ForwardPropagation';
import sigmoidFunction from '../../shared/SigmoidFunction';

class Model {
  constructor() {
    /** @type {{ w: number[][], v: number[] }} */
    this.weights = { w: [], v: [] };
    /** @type {number[]} */
    this.bias = [];
  }
}

const noop = ()=>{};

class Trainer {
  /**
   * @param {TrainingData} trainingData
   * @param {number} numIterations
   */
  constructor(trainingData, numIterations) {
    this.trainingData = trainingData;
    this.numIterations = numIterations;

    this._trainingState = 'idle';
    /** @type {IterableIterator<ProcessingModelData>} */
    this._trainingIterator = null;
    this._trainingInterval = 0;
    this._iterationCallback = noop;
    this._trainingCallback = noop;

    this._modelData = new ProcessingModelData(
      { w: [], v: [] },
      [],
      0.0
    );
  }

  /**
   * @param {number[]} inputRow 
   * @param {number[]} outputRow 
   * @param {number[]} fprop 
   */
  _learn(inputRow, outputRow, fprop) {
    let predictedValue = this._predict(fprop);

    let error = outputRow[0] - predictedValue;
    let learningRate = 0.05;

    const dimension = this.trainingData.dimension;

    let dwi = new Array(dimension);
    let dw = new Array(dimension);
  
    for (let i = 0; i < dimension; i++) {
      dw[i] = new Array(dimension);
    }
  
    let dbi = new Array(dimension);
    let db = new Array(dimension);
  
    let dv = predictedValue * (1 - predictedValue) * error;

    const [start, end] = this.trainingData.offset;
  
    for (let i = 0; i < dimension; i++) {
      this._modelData.weights.v[i] += learningRate * dv * fprop[i];
    }
  
    let dbout = learningRate * dv;
    this._modelData.deltaBias += dbout;
  
    for (let i = 0; i < dimension; i++) {
      dwi[i] = fprop[i] * (1 - fprop[i]) * this._modelData.weights.v[i] * dv;

      for (let j = 0; j < dimension; j++) {
        dw[j][i] = learningRate * dwi[i] * inputRow[j];
        this._modelData.weights.w[j][i] += dw[j][i];
      }
    }
  
    // modify bias
    for (let i = 0; i < dimension; i++) {
      dbi[i] = fprop[i] * (1 - fprop[i]) * this._modelData.weights.v[i] * dv;
      db[i] = learningRate * dbi[i];
      this._modelData.bias[i] += db[i];
    }
  }

  /**
   * @param {number[]} fprop 
   */
  _predict(fprop) {
    let value = fprop.reduce((accum, el, i) => {
      return accum + (el * this._modelData.weights.v[i]);
    }, 0);

    return sigmoidFunction(value + this._modelData.deltaBias);
  }

  *_doIteration() {
    for (let i = 0; i < this.trainingData.outputValues.length; i++) {
      let inputRow = this.trainingData.getInputRow(i);
      let outputRow = this.trainingData.getOutputRow(i);

      let fprop = forwardPropagation(this._modelData, inputRow);

      yield this._learn(inputRow, outputRow, fprop);
    }
  }

  /**
   * @param {number} numIterations 
   */
  *_iterate(numIterations) {
    for (let iter = 0; iter < numIterations; iter++) {
      let prevModelData = this._modelData.clone();

      let doIt = this._doIteration();

      while (!doIt.next().done) {
        doIt.next();
      }

      // calculate deltas (difference from last iteration)
      yield this._modelData.subtract(prevModelData);
    }
  }

  /**
   * @param {ProcessingModelData} deltaModel 
   */
  syncDeltaUpdates(deltaModel) {
    this._modelData.addLocalDeltaUpdates(deltaModel);
  }

  beginTraining(modelData, numIterations, { onIteration=(deltas)=>{}, onDone=()=>{} }) {
    this._modelData = new ProcessingModelData(
      modelData.weights,
      modelData.bias,
      modelData.deltaBias
    );

    this._trainingState = 'active';
    this._trainingIterator = this._iterate(numIterations);
    this._iterationCallback = onIteration;
    this._trainingCallback = onDone;
    this._setupTrainingInterval();
  }

  pauseTraining() {
    this._trainingState = 'paused';
    clearInterval(this._trainingInterval);
    this._trainingInterval = 0;
  }

  resumeTraining() {
    this._trainingState = 'active';

    if (this._trainingInterval != 0) {
      this._setupTrainingInterval();
    }
  }

  cancelTraining() {
    this._trainingState = 'idle';
    this._trainingIterator = noop;
    this._trainingCallback = noop;

    clearInterval(this._trainingInterval);
    this._trainingInterval = 0;
  }

  _setupTrainingInterval() {
    this._trainingInterval = setInterval(() => {
      let next = this._trainingIterator.next();
      if (next.done) {
        clearInterval(this._trainingInterval);
        this._trainingCallback();
      } else {
        this._iterationCallback(next.value);
      }
    }, 50);
  }
}

export { TrainingData, Trainer };