import { AnyAction } from 'redux'
import {EffectsCommandMap, SubscriptionAPI} from 'dva';
export default {

  namespace: 'indexPage',

  state: {},

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

interface IndexPageState {

}
