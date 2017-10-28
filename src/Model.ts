import { ModelData, WeightData } from './ModelData';

class Model implements ModelData {
  weights: WeightData;
  bias: number[];
}

export default Model;