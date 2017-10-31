import { ModelData } from './ModelData';
import sigmoidFunction from './SigmoidFunction';

function forwardPropagation(modelData: ModelData, row: number[]) {
  let arr: number[] = [];

  for (let i = 0; i < modelData.weights.w[0].length; i++) {
    // 1. activation
    var activation = 0.0;

    for (let j = 0; j < modelData.weights.w.length; j++) {
      activation += row[j] * modelData.weights.w[j][i];
    }

    arr.push(sigmoidFunction(activation + modelData.bias[i]));
  }

  return arr;
}

export default forwardPropagation;