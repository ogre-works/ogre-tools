import { computed } from 'mobx';
import {
  getInjectable,
  getInjectionToken,
  getKeyedSingletonCompositeKey,
  lifecycleEnum,
} from '@ogre-tools/injectable';
import { computedInjectManyWithMetaInjectionToken } from './computedInjectMany';

export const computedInjectMaybeInjectionToken = getInjectionToken({
  id: 'computed-inject-maybe',
});

export const _computedInjectMaybeInjectable = getInjectable({
  id: 'computed-inject-maybe-internal',

  instantiate: (di, { token, args }) => {
    const computedInjectManyWithMeta = di.inject(
      computedInjectManyWithMetaInjectionToken,
    );
    const computedMany = computedInjectManyWithMeta(token, ...args);

    return computed(() => {
      const [value, ...collidingValues] = computedMany.get();

      if (collidingValues.length) {
        throw new Error(
          `Tried to computedInjectMaybe "${
            token.id
          }", but more than one contribution was encountered: "${[
            value.meta.id,
            ...collidingValues.map(x => x.meta.id),
          ].join('", "')}"`,
        );
      }

      return value?.instance;
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, { token, args }) =>
      getKeyedSingletonCompositeKey(token, ...args),
  }),
});

export const computedInjectMaybeInjectable = getInjectable({
  id: 'computed-inject-maybe',
  instantiate:
    di =>
    (token, ...args) =>
      di.inject(_computedInjectMaybeInjectable, { token, args }),
  injectionToken: computedInjectMaybeInjectionToken,
});
