import * as React from 'react';
import * as PropTypes from 'prop-types';
import axios from 'axios';

import Client from '../../services/Client';
import Trainer from '../../services/Trainer';

class ArenaScreen extends React.Component {
  state = {
    arena: null,
    joined: false
  };

  componentDidMount() {
    Client.send('subscribe to arena', this.props.match.params.id);

    this.arenaListener = Client.on('update arena', (arena) => {
      this.setState({ arena });
      console.log('update arena: ', arena);
    });

    this.startTrainingListener = Client.on('start training', (modelData) => {
      if (Client.trainer == null) {
        throw Error('Client.trainer is null, init data not yet received.');
      }

      Client.trainer.beginTraining(modelData,
        {
          onIteration: (deltas) => {
            console.log('deltas : ', deltas);
          },
          onDone: (results) => {
            console.log('results = ', results);
          }
        }
      );
    });

    axios.get(`/api/arenas/${this.props.match.params.id}`)
    .then(res => res.data)
    .then(({ arena }) => {
      this.setState({ arena });
    });
  }

  componentWillUnmount() {
    Client.send('unsubscribe from arena', this.props.match.params.id);
    this.arenaListener.remove();
  }

  handleJoinClick = () => {
    Client.Arena.join(this.state.arena.id);
    this.setState({ joined: true });
  };

  handleStartTrainingClick = () => {
    Client.Arena.startTraining(this.state.arena.id);
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
        <span>
          {this.state.arena.numActiveClients} active clients
        </span>
        <div>
          {['Idle', 'Training', 'Completed'][this.state.arena.state]}
        </div>
        <button disabled={this.state.arena.state != 0 || this.state.joined} onClick={this.handleJoinClick}>
          Join
        </button>
        <button disabled={this.state.arena.state != 0} onClick={this.handleStartTrainingClick}>
          Commence Training
        </button>
      </div>
    );
  };
}

export default ArenaScreen;