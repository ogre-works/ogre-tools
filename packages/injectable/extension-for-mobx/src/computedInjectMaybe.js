import { computed } from 'mobx';
import {
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from '@lensapp/injectable';
import { computedInjectManyWithMetaInjectionToken } from './computedInjectMany';

export const computedInjectMaybeInjectionToken = getInjectionToken({
  id: 'computed-inject-maybe',
});

export const _computedInjectMaybeInjectable = getInjectable({
  id: 'computed-inject-maybe-internal',

  instantiate: (di, token) =>
    computed(() => {
      const [value = undefined, ...collidingValues] = di
        .inject(computedInjectManyWithMetaInjectionToken)(token)
        .get();

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
    }),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectionToken) => injectionToken,
  }),
});

export const computedInjectMaybeInjectable = getInjectable({
  id: 'computed-inject-maybe',
  instantiate: di => token => di.inject(_computedInjectMaybeInjectable, token),
  injectionToken: computedInjectMaybeInjectionToken,
});
