import Arena from './Arena';
import Data from './Data';
import DataType from './DataType';
import { SchemaField, NumericalField, CategoricalField } from './SchemaField';
import Model from './Model';

export default new class Arenas {
  arenas: { [id: string]: Arena } = {
    'testing-testing-testing': new Arena('testing-testing-testing', new Model({
      w: [], v: []
    }, []))
  };

  add(arena: Arena) {
    if (this.arenas[arena.id] !== undefined) {
      throw Error(`Arena with id ${arena.id} already exists!`);
    }

    this.arenas[arena.id] = arena;
    return this;
  }

  get(id: string) {
    return this.arenas[id];
  }

  keys() {
    return Object.keys(this.arenas);
  }
};