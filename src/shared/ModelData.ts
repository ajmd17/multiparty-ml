interface WeightData {
  w: number[][];
  v: number[];
}

// interface ModelData {
//   weights: WeightData;
//   bias: number[];
// }

// interface ProcessingModelData extends ModelData {
//   deltaBias: number;
// }

class ModelData {
  constructor(public weights: WeightData, public bias: number[]) {
  }

  cloneWeights() {
    let clonedWeights: WeightData = {
      w: [],
      v: []
    };

    for (let i = 0; i < this.weights.v.length; i++) {
      clonedWeights.v.push(this.weights.v[i]);
    }

    for (let i = 0; i < this.weights.w.length; i++) {
      clonedWeights.w.push([]);

      for (let j = 0; j < this.weights.w[i].length; j++) {
        clonedWeights.w[i].push(this.weights.w[i][j]);
      }
    }

    return clonedWeights;
  }

  cloneBias() {
    let clonedBias: number[] = [];

    for (let i = 0; i < this.bias.length; i++) {
      clonedBias.push(this.bias[i]);
    }

    return clonedBias;
  }

  clone() {
    return new ModelData(this.cloneWeights(), this.cloneBias());
  }

  toJSON() {
    return {
      weights: this.weights,
      bias: this.bias
    };
  }
}

class ProcessingModelData extends ModelData {
  constructor(weights: WeightData, bias: number[], public deltaBias: number) {
    super(weights, bias);
  }

  initialize(dimension: number) {
    this.weights.v = [];
    this.weights.w = [];
    this.bias = [];

    for (let i = 0; i < dimension; i++) {
      this.weights.v.push(Math.random() - 0.5);
      this.weights.w.push([]);

      for (let j = 0; j < dimension; j++) {
        this.weights.w[i].push(Math.random() - 0.5);
      }

      this.bias.push(Math.random() - 0.5);
    }
  }

  subtract(before: ProcessingModelData): ProcessingModelData {
    return new ProcessingModelData(
      {
        v: this.weights.v.map((x, i) => x - before.weights.v[i]),
        w: this.weights.w.map((x, i) => x.map((y, j) => y - before.weights.w[i][j])),
      },
      this.bias.map((x, i) => x - before.bias[i]),
      this.deltaBias - before.deltaBias
    );
  }

  clone() {
    return new ProcessingModelData(this.cloneWeights(), this.cloneBias(), this.deltaBias);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      deltaBias: this.deltaBias
    };
  }
}


export { ModelData, ProcessingModelData, WeightData };