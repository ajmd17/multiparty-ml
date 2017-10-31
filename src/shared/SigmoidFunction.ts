function sigmoidFunction(value: number): number {
  return 1.0 / (1.0 + Math.exp(-value));
}

export default sigmoidFunction;