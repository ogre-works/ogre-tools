import { useContext, useDeferredValue, useMemo } from 'react';
import { diContext } from '../withInjectables/withInjectables';
import { use } from './_private/use';
import { checkForUnsupportedAsyncTransient } from './_private/checkForUnsupportedAsyncTransient';
import { checkForUnsupportedPromiseLikeTransient } from './_private/checkForUnsupportedPromiseLikeTransient';

const useNonDeferredValue = x => x;

const _useInject = (injectable, instantiationParameters, config) => {
  checkForUnsupportedAsyncTransient(injectable);

  const di = useContext(diContext);

  const maybePromise = di.inject(injectable, ...instantiationParameters);

  checkForUnsupportedPromiseLikeTransient(injectable, maybePromise);

  const maybePromiseBetweenUpdates = config.betweenUpdates(maybePromise);

  return use(maybePromiseBetweenUpdates);
};

export const useInject = (injectable, ...instantiationParameters) =>
  _useInject(injectable, instantiationParameters, {
    betweenUpdates: useNonDeferredValue,
  });

export const useInjectDeferred = (injectable, ...instantiationParameters) =>
  _useInject(injectable, instantiationParameters, {
    betweenUpdates: useDeferredValue,
  });
