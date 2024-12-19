import { cloneDeep } from 'lodash';
import { ChangeEvent, SyntheticEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

export function useClientOnChangeCallback<
  TElement extends Element,
  TEvent extends SyntheticEvent<TElement> = ChangeEvent<TElement>
>(
  client: Client,
  actionCreator: ActionCreatorWithPayload<Client, string>,
  clientUpdater: (event: TEvent, client: Client) => boolean,
  extraDependencies: unknown[] = [],
) {
  const dispatch = useDispatch();
  return useCallback(
    function clientOnChangeCallbackProxy(event: TEvent) {
      const updatingClient = cloneDeep(client);
      const valid = clientUpdater(event, updatingClient);
      if (valid) {
        dispatch(actionCreator(updatingClient));
      }
    },
    extraDependencies.concat(client)
  );
}
