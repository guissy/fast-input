import * as H from 'history';
import * as R from 'react-router';

declare global {
  namespace HistoryModule {
    export type History = H.History;
  }
  namespace ReactRouter {
    export type PlainRoute = any;
    export type RouteProps = R.RouteProps;
    export type RouterState = any;
    export type StringifyQuery = any;
    export type RedirectFunction = any;
    export type LeaveHook = any;
    export type EnterHook = any;
    export type RouteHook = any;
    export type RouterListener = any;
    export type RouterOnContext = any;
    export type RouteComponentProps<P, S> = R.RouteComponentProps<P>;
    export type HistoryBase = any;
    export type ParseQueryString = any;
  }
  export interface ReduxProps {
    dispatch?: (action: Action) => void;
  }
}

declare module 'redux' {
  interface AnyAction {
    type: any;
    payload?: any;
  }
}