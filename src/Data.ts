import DataType from './DataType';
import { SchemaField, NumericalField, CategoricalField } from './SchemaField';

class Data {
  static readonly DEFAULT_INPUT_DATA = new Data([
    new NumericalField('x'),
    new NumericalField('y')
  ], [
    [1.2, 2.4],
    [1.6, 6,7],
    [1.8, 8.9],
    [0.5, 4.1]
  ]);
    
  static readonly DEFAULT_OUTPUT_DATA = new Data([
    new NumericalField('z')
  ], [
    [0],
    [1],
    [1],
    [0]
  ]);

  constructor(public schema: SchemaField[], public values: (number|string)[][]) {
  }

  divideEvenly(count): Data[] {
    if (count == 0) {
      throw Error('count must not be zero');
    }

    const batchSize = Math.floor(this.values.length / count);

    let results = [];

    for (let i = 0; i < count; i++) {
      results.push(this.slice(i * batchSize, i * batchSize + batchSize));
    }

    return results;
  }

  slice(start: number, end: number) {
    if (start >= 0 && start < this.values.length && end <= this.values.length) {
      return new Data(this.schema.slice(start, end), this.values.slice(start, end));
    }

    throw Error('(' + start + ', ' + end + ') out of range of (0, ' + this.values.length + ')');
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
    } else {
      header = rows[0].map((el, i) => {
        let rem = i % 26;
        let div = Math.floor(i / 26) + 1;
        return String.fromCharCode(65 + rem) + div;
      });
    }

    return new Data(header.map((label, i) => {
      const firstRowElement = rows[0][i];

      if (!isNaN(firstRowElement as any)) {
        return new NumericalField(label);
      } else {
        // get possible values
        return new CategoricalField(label, rows.map(row => row[i]));
      }
    }), rows);
  }
}

export default Data;