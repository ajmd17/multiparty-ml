class TrainingData {
  /**
   * @param {number[][]} inputValues 
   * @param {number[][]} outputValues 
   */
  constructor(inputValues, outputValues) {
    this.inputValues = inputValues;
    this.outputValues = outputValues;
  }

  extractRow() {

  }
}

class Model {
  constructor() {
    /** @type {{ w: number[][], v: number[] }} */
    this.weights = { w: [], v: [] };
    /** @type {number[]} */
    this.bias = [];
  }
}

class Trainer {
  /**
   * @param {TrainingData} trainingData
   * @param {number} numIterations
   */
  constructor(trainingData, numIterations) {
    this.trainingData = trainingData;
    this.numIterations = numIterations;

    this._callbacks = {
      /** @param {Model} model */
      onIterationCompleted: (model) => {}
    };
  }

  get callbacks() {
    return this._callbacks;
  }

  _nextIter() {
    for (let i = 0; i < this.trainingData.outputValues.length; i++) {

    }
  }

  beginTraining() {
    return new Promise((resolve, reject) => {
      
    });
  }
}

export default Trainer;