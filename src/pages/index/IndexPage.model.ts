import { AnyAction } from 'redux'
import {EffectsCommandMap, SubscriptionAPI} from 'dva';
export default {

  namespace: 'indexPage',

  state: {
    storage: [{"id":"87","server":"core","host":"http://123.com","port":"","user":"web","password":"123456","db":"db1"},{"id":"88","server":"games","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"89","server":"data","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"90","server":"common","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"91","server":"main","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"92","server":"logs","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"93","server":"redis","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"94","server":"mongodb","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"},{"id":"95","server":"rabbitmq","host":"123.com","port":"80","user":"web","password":"123456","db":"db1"}],
  },

  subscriptions: {
    setup({ dispatch, history }: SubscriptionAPI) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch({ payload }: AnyAction, { call, put }: EffectsCommandMap) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    save(state: IndexPageState, action: AnyAction) {
      return { ...state, ...action.payload };
    },
  },

};

export interface IndexPageState {
  storage: StorageItem[];
}

interface StorageItem {
  id: string;
  server: string;
  host: string;
  port: string;
  user: string;
  password: string;
  db: string;
}
