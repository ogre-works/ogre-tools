import { useContext, useDeferredValue, useMemo } from 'react';
import { diContext } from '../withInjectables/withInjectables';
import { use } from './_private/use';
import { checkForUnsupportedAsyncTransient } from './_private/checkForUnsupportedAsyncTransient';
import { checkForUnsupportedPromiseLikeTransient } from './_private/checkForUnsupportedPromiseLikeTransient';

export const useInject = (injectable, instantiationParameter, config = {}) => {
  checkForUnsupportedAsyncTransient(injectable);

  const { di } = useContext(diContext);

  const maybePromise = useMemo(
    () => di.inject(injectable, instantiationParameter),
    [injectable, instantiationParameter],
  );

  checkForUnsupportedPromiseLikeTransient(injectable, maybePromise);

  let maybeDeferredValue;

  if (config.betweenUpdates !== 'suspend') {
    maybeDeferredValue = useDeferredValue(maybePromise);
  } else {
    maybeDeferredValue = maybePromise;
  }

  return use(maybeDeferredValue);
};
