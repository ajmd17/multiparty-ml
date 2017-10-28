import DataType from './DataType';

abstract class SchemaField {
  constructor(public label: string, public type: DataType) {
  }
}

class NumericalField extends SchemaField {
  constructor(label: string) {
    super(label, DataType.NUMERICAL);
  }
}

class CategoricalField extends SchemaField {
  constructor(label: string, public possibleValues: (number|string)[]) {
    super(label, DataType.CATEGORICAL);
  }
}

export { SchemaField, NumericalField, CategoricalField };