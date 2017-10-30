class TrainingData {
  constructor(public inputValues: number[][], public outputValues: number[][]) {
    this.inputValues = inputValues;
    this.outputValues = outputValues;
  }

  get dimension(): number {
    if (this.inputValues.length == 0) {
      return -1;
    }

    return this.inputValues[0].length;
  }

  getInputRow(rowIndex: number): number[] {
    return this.inputValues[rowIndex];
  }

  getOutputRow(rowIndex: number): number[] {
    return this.outputValues[rowIndex];
  }
}

export default TrainingData;