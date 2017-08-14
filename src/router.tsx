import * as React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './pages/index/IndexPage';

function RouterConfig({ history }: any) {
  return (
    <Router history={history}>
      <Route path="/" component={IndexPage} />
    </Router>
  );
}

export default RouterConfig;
