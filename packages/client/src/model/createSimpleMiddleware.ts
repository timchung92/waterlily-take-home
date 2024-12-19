import { AppState } from './store';
import { AnyAction, MiddlewareAPI } from '@reduxjs/toolkit';
import { Dispatch } from '@reduxjs/toolkit';

export type SimpleMiddleware = {
  (
    dispatch: Dispatch<AnyAction>,
    getStore: () => AppState,
    next: Dispatch<AnyAction>,
    action: AnyAction
  ): void;
}

export function createSimpleMiddleware(middleware: SimpleMiddleware) {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, AppState>) =>
    (next: Dispatch<AnyAction>) =>
      (action: AnyAction) => 
        middleware(store.dispatch, store.getState, next, action)
}
