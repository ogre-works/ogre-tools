import { useContext, useDeferredValue, useMemo } from 'react';
import { diContext } from '../withInjectables/withInjectables';
import { use } from './_private/use';
import { checkForUnsupportedAsyncTransient } from './_private/checkForUnsupportedAsyncTransient';
import { checkForUnsupportedPromiseLikeTransient } from './_private/checkForUnsupportedPromiseLikeTransient';

const useNonDeferredValue = x => x;

const _useInject = (injectable, instantiationParameter, config) => {
  checkForUnsupportedAsyncTransient(injectable);

  const { di } = useContext(diContext);

  const maybePromise = useMemo(
    () => di.inject(injectable, instantiationParameter),
    [injectable, instantiationParameter],
  );

  checkForUnsupportedPromiseLikeTransient(injectable, maybePromise);

  const maybePromiseBetweenUpdates = config.betweenUpdates(maybePromise);

  return use(maybePromiseBetweenUpdates);
};

export const useInject = (injectable, instantiationParameter) =>
  _useInject(injectable, instantiationParameter, {
    betweenUpdates: useNonDeferredValue,
  });

export const useInjectDeferred = (injectable, instantiationParameter) =>
  _useInject(injectable, instantiationParameter, {
    betweenUpdates: useDeferredValue,
  });
