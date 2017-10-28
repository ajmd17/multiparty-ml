interface WeightData {
  w: number[][];
  v: number[];
}

interface ModelData {
  weights: WeightData;
  bias: number[];
}

interface ProcessingModelData extends ModelData {
  deltaBias: number;
}

export { ModelData, ProcessingModelData, WeightData };