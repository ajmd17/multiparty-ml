import DataType from './DataType';
import SchemaField from './SchemaField';

class Data {
  constructor(public schema: SchemaField[], public values: any[][]) {
  }

  static from(rows: string[][], header?: string[]) {
    if (rows.length == 0) {
      throw Error('No rows provided.');
    }

    let firstRowSchema = rows[0].map((element) => {
      if (!isNaN(element as any)) {
        return DataType.NUMERICAL;
      } else if (element == 'true' || element == 'false') {
        return DataType.BOOLEAN;
      } else {
        return DataType.CATEGORICAL;
      }
    });

    if (header != null) {
      if (header.length != rows[0].length) {
        throw Error('Header column length must be same as row column length');
      }

      return new Data(header.map((label, i) => new SchemaField(label, firstRowSchema[i])), rows);
    }

    return new Data(rows[0].map((element, i) => {
      let rem = i % 26;
      let div = Math.floor(i / 26) + 1;
      let label = String.fromCharCode(65 + rem) + div;

      return new SchemaField(label, firstRowSchema[i]);
    }), rows);
  }
}

export default Data;