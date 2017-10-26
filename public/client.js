/**
 * @param {number[][]} inputValues 
 * @param {number[][]} outputValues 
 */
function TrainingData(inputValues, outputValues) {
  this.inputValues = inputValues;
  this.outputValues = outputValues;
}

TrainingData.prototype.extractRow = function () {

};

function Model() {
  /** @type {{ w: number[][], v: number[] }} */
  this.weights = { w: [], v: [] };
  /** @type {number[]} */
  this.bias = [];
}

class Client {
  /**
   * @param {TrainingData} trainingData
   * @param {number} numIterations
   */
  constructor(trainingData, numIterations) {
    this.trainingData = trainingData;
    this.numIterations = numIterations;
  }

  callbacks = {
    /** @param {Model} model */
    onIterationCompleted: (model) => {}
  };

  _nextIter() {
    for (let i = 0; i < this.trainingData.outputValues.length; i++) {

    }
  }

  beginTraining() {
    return new Promise((resolve, reject) => {
      
    });
  }
}