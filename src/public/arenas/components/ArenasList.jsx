import * as React from 'react';
import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';

class ArenasList extends React.Component {
  static propTypes = {
    arenas: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render() {
    return (
      <div>
        {this.props.arenas.map((arena) => {
          return (
            <div key={arena.id}>
              <Link to={`/arenas/${arena.id}`}>
                {arena.id}
              </Link>
              &nbsp;
              <span>
                {arena.numActiveClients} active clients
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default ArenasList;