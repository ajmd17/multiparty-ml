import TrainingData from '../../shared/TrainingData';
import { ProcessingModelData } from '../../shared/ModelData';
import forwardPropagation from '../../shared/ForwardPropagation';

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

  beginTraining(modelData, { onIteration=(deltas)=>{}, onDone=()=>{} }) {
    console.log('modelData = ', modelData);
    this._modelData = new ProcessingModelData(
      modelData.weights,
      modelData.bias,
      modelData.deltaBias
    );

    this._trainingState = 'active';
    this._trainingIterator = this._iterate(5);
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