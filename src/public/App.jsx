import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Client from './services/Client';

import Router from './Router';

class App extends React.Component {
  componentWillMount() {
    Client.init();
  }

  render() {
    return (
      <Router />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));