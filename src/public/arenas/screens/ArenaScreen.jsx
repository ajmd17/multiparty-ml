import * as React from 'react';
import * as PropTypes from 'prop-types';
import axios from 'axios';

import Client from '../../services/Client';
import Trainer from '../../services/Trainer';

class ArenaScreen extends React.Component {
  state = {
    arena: null,
    stats: null,
    joined: false
  };

  componentDidMount() {
    Client.send('subscribe to arena', this.props.match.params.id);

    this.arenaListener = Client.on('update arena', (arena) => {
      this.setState({ arena });
      console.log('update arena: ', arena);
    });

    this.arenaStatsListener = Client.on('arena stats', (stats) => {
      console.log('stats = ', stats);
      this.setState({ stats });
    });

    this.startTrainingListener = Client.on('start training', (modelData, numIterations) => {
      if (Client.trainer == null) {
        throw Error('Client.trainer is null, init data not yet received.');
      }

      Client.trainer.beginTraining(modelData, numIterations,
        {
          onIteration: (deltas) => {
            Client.send('delta updates', this.state.arena.id, deltas.toJSON());
          },
          onDone: (results) => {
            console.log('results = ', results);
          }
        }
      );
    });

    this.finishTrainingListener = Client.on('finish training', () => {
      if (Client.trainer == null) {
        throw Error('Client.trainer is null, init data not yet received.');
      }

      Client.trainer.cancelTraining();
    });

    // sync model delta updates from other clients to this client
    this.syncDeltaUpdatesListener = Client.on('sync delta updates', (deltaModel) => {
      if (Client.trainer == null) {
        throw Error('Client.trainer is null, init data not yet received.');
      }

      Client.trainer.syncDeltaUpdates(deltaModel);
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
    this.arenaStatsListener.remove();
    this.startTrainingListener.remove();
    this.finishTrainingListener.remove();
    this.syncDeltaUpdatesListener.remove();
  }

  handleJoinClick = () => {
    Client.Arena.join(this.state.arena.id);
    this.setState({ joined: true });
  };

  handleStartTrainingClick = () => {
    Client.Arena.startTraining(this.state.arena.id);
  };

  renderStats() {
    if (this.state.stats != null) {
      return (
        <div>
          <h3>Progress</h3>
          {this.state.stats.map((el, i) => {
            return (
              <div key={i}>
                <span>
                  Client #{i + 1}
                </span>
                &nbsp;&nbsp;&nbsp;
                <span>
                  {(el.completedIter / (el.assignedIter || 1) * 100).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }

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
        {this.renderStats()}
      </div>
    );
  };
}

export default ArenaScreen;