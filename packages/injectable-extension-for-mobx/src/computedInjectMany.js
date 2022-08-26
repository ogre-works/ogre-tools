import {
  deregistrationDecoratorToken,
  getInjectable,
  lifecycleEnum,
  registrationDecoratorToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction, _getGlobalState } from 'mobx';
import uniq from 'lodash/fp/uniq';

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),
});

const getInvalidatorInstance =
  registerOrDeregister =>
  di =>
  registerToBeDecorated =>
  (...injectables) => {
    const { inBatch } = _getGlobalState();
    if (inBatch === 0) {
      throw new Error(
        `Tried to ${registerOrDeregister} injectables "${injectables
          .map(x => x.id)
          .join(
            '", ',
          )}" outside of MobX-transaction, as without computedInjectMany could cause untimely observations and injections`,
      );
    }

    const registered = registerToBeDecorated(...injectables);

    const injectionTokens = injectables
      .filter(injectable => injectable.injectionToken)
      .map(injectable => injectable.injectionToken);

    const uniqueInjectionTokens = uniq(injectionTokens);

    uniqueInjectionTokens.forEach(injectionToken => {
      const mobxAtomForToken = di.inject(
        invalidabilityForReactiveInstances,
        injectionToken,
      );

      mobxAtomForToken.reportChanged();
    });

    return registered;
  };

const invalidateReactiveInstancesOnRegisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-register',

  instantiate: getInvalidatorInstance('register'),

  injectionToken: registrationDecoratorToken,
});

const invalidateReactiveInstancesOnDeregisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',

  instantiate: getInvalidatorInstance('deregister'),

  injectionToken: deregistrationDecoratorToken,
});

export const computedInjectManyInjectable = getInjectable({
  id: 'computed-inject-many',

  instantiate: di => injectionToken =>
    di.inject(reactiveInstancesInjectable, injectionToken),

  lifecycle: lifecycleEnum.transient,

  cannotCauseCycles: true,
});

const reactiveInstancesInjectable = getInjectable({
  id: 'reactive-instances',

  instantiate: (di, injectionToken) => {
    const mobxAtomForToken = di.inject(
      invalidabilityForReactiveInstances,
      injectionToken,
    );

    return computed(() => {
      mobxAtomForToken.reportObserved();

      return di.injectMany(injectionToken);
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, injectionToken) => injectionToken,
  }),

  cannotCauseCycles: true,
});

export const registerMobX = di => {
  runInAction(() => {
    di.register(
      invalidabilityForReactiveInstances,
      reactiveInstancesInjectable,
      computedInjectManyInjectable,
      invalidateReactiveInstancesOnRegisterDecorator,
      invalidateReactiveInstancesOnDeregisterDecorator,
    );
  });
};
