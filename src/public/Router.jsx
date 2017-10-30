import * as React from 'react';
import { Switch } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';

import ArenasOverviewScreen from './arenas/screens/ArenasOverviewScreen';
import ArenaScreen from './arenas/screens/ArenaScreen';

export default () => (
  <BrowserRouter>
    <div>
      <Route exact path='/' component={ArenasOverviewScreen} />
      <Route exact path='/arenas' component={ArenasOverviewScreen} />
      <Route path='/arenas/:id' component={ArenaScreen} />
    </div>
  </BrowserRouter>
);