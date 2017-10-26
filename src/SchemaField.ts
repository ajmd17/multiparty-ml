import DataType from './DataType';

class SchemaField {
  constructor(public label: string, public type: DataType) {
  }
}

export default SchemaField;