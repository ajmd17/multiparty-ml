import * as React from 'react';
import axios from 'axios';

import ArenasList from '../components/ArenasList';

class ArenasOverviewScreen extends React.Component {
  state = {
    arenas: null
  };
  
  componentDidMount() {
    axios.get('/active-arenas').then((res) => {
      return res.data;
    }).then((arenas) => {
      this.setState({ arenas });
    });
  }

  renderArenas() {
    if (this.state.arenas != null) {
      return (
        <ArenasList arenas={this.state.arenas} />
      );
    }

    return (
      <div>
        Loading...
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Arenas</h1>
        {this.renderArenas()}
      </div>
    );
  }
}

export default ArenasOverviewScreen;