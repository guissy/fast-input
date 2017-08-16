import dva from 'dva';
import './index.less';
import {browserHistory} from 'dva/router';
import router from './router';

// 1. Initialize
const app = dva({history: browserHistory});

// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./pages/index/IndexPage.model').default);

// 4. Router
app.router(router);

// 5. Start
app.start('#root');
