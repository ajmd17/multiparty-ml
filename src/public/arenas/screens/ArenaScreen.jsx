import * as React from 'react';
import * as PropTypes from 'prop-types';
import axios from 'axios';

import Client from '../../services/Client';
import Trainer from '../../services/Trainer';

class ArenaScreen extends React.Component {
  state = {
    arena: null
  };

  componentDidMount() {
    Client.send('subscribe to arena', { arenaId: this.props.match.params.id });

    this.arenaListener = Client.on('update arena', (arena) => {
      this.setState({ arena });
    });

    axios.get(`/api/arenas/${this.props.match.params.id}`)
    .then(res => res.data)
    .then(({ arena }) => {
      this.setState({ arena });
    });
  }

  componentWillUnmount() {
    Client.send('unsubscribe from arena', { arenaId: this.props.match.params.id });
    this.arenaListener.remove();
  }

  handleJoinClick = () => {
    Client.joinArena(this.state.arena.id);
  };

  handleStartTrainingClick = () => {

  };

  render() {
    if (this.state.arena == null) {
      return (
        <div>
          Loading arena...
        </div>
      );
    }

    return (
      <div>
        <h3>{this.state.arena.id}</h3>
        {['Idle', 'Training', 'Completed'][this.state.arena.state]}
        <button onClick={this.handleJoinClick}>
          Join
        </button>
        <button onClick={this.handleStartTrainingClick}>
          Commence Training
        </button>
      </div>
    );
  };
}

export default ArenaScreen;