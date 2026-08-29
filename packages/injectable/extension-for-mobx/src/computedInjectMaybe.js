import { computed } from 'mobx';
import {
  getInjectable,
  getInjectable2,
  getInjectionToken,
  getInjectionToken2,
  getKeyedSingletonCompositeKey,
  lifecycleEnum,
} from '@ogre-tools/injectable';
import { computedInjectManyWithMetaInjectionToken } from './computedInjectMany';

export const computedInjectMaybeInjectionToken = getInjectionToken({
  id: 'computed-inject-maybe',
});

export const computedInjectMaybe2InjectionToken = getInjectionToken2({
  id: 'computed-inject-maybe-2',
  cardinality: 'one',
})();

export const computedInjectMaybeWithMetaInjectionToken = getInjectionToken({
  id: 'computed-inject-maybe-with-meta',
});

export const computedInjectMaybeWithMeta2InjectionToken = getInjectionToken2({
  id: 'computed-inject-maybe-with-meta-2',
  cardinality: 'one',
})();

// Both maybe-flavors resolve through computedInjectManyWithMeta — the metas
// name the offending contributions when there are too many — and differ only
// in what they unwrap the single result to: the instance, or the meta-wrapped
// entry. Separate injectables so each flavor keeps its own keyed cache.
const _computedInjectMaybeInjectableFor = ({ id, label, pickResult }) =>
  getInjectable({
    id,

    instantiate: (di, { token, args }) => {
      const computedInjectManyWithMeta = di.inject(
        computedInjectManyWithMetaInjectionToken,
      );
      const computedMany = computedInjectManyWithMeta(token, ...args);

      return computed(() => {
        const values = computedMany.get();

        if (values.length > 1) {
          throw new Error(
            `Tried to ${label} "${
              token.id
            }", but more than one contribution was encountered: "${values
              .map(x => x.meta.id)
              .join('", "')}"`,
          );
        }

        return values.length === 0 ? undefined : pickResult(values[0]);
      });
    },

    lifecycle: lifecycleEnum.keyedSingleton({
      getInstanceKey: (_, { token, args }) =>
        getKeyedSingletonCompositeKey(token, ...args),
    }),
  });

export const _computedInjectMaybeInjectable = _computedInjectMaybeInjectableFor(
  {
    id: 'computed-inject-maybe-internal',
    label: 'computedInjectMaybe',
    pickResult: value => value.instance,
  },
);

export const _computedInjectMaybeWithMetaInjectable =
  _computedInjectMaybeInjectableFor({
    id: 'computed-inject-maybe-with-meta-internal',
    label: 'computedInjectMaybeWithMeta',
    pickResult: value => value,
  });

// v2 tokens declare their arity, so a token given here must be
// 'zero-or-one'; v1 tokens have no cardinality and stay accepted.
const checkForNonMaybeCardinalityFor = label => token => {
  if (
    token.aliasType === 'injection-token2' &&
    token.cardinality !== 'zero-or-one'
  ) {
    throw new Error(
      `Tried to ${label} "${token.id}", but its cardinality is "${token.cardinality}" instead of "zero-or-one".`,
    );
  }
};

const computedInjectMaybeInjectableFor = ({
  id,
  label,
  internalInjectable,
  injectionToken,
}) => {
  const checkForNonMaybeCardinality = checkForNonMaybeCardinalityFor(label);

  return getInjectable({
    id,

    instantiate:
      di =>
      (token, ...args) => {
        checkForNonMaybeCardinality(token);

        return di.inject(internalInjectable, { token, args });
      },

    injectionToken,
  });
};

const computedInjectMaybe2InjectableFor = ({
  id,
  label,
  internalInjectable,
  injectionToken,
}) => {
  const checkForNonMaybeCardinality = checkForNonMaybeCardinalityFor(label);

  return getInjectable2({
    id,

    instantiate: di => token => {
      checkForNonMaybeCardinality(token);

      return (...args) => di.inject(internalInjectable)({ token, args }).get();
    },

    injectionToken,
  });
};

export const computedInjectMaybeInjectable = computedInjectMaybeInjectableFor({
  id: 'computed-inject-maybe',
  label: 'computedInjectMaybe',
  internalInjectable: _computedInjectMaybeInjectable,
  injectionToken: computedInjectMaybeInjectionToken,
});

export const computedInjectMaybe2Injectable = computedInjectMaybe2InjectableFor(
  {
    id: 'computed-inject-maybe-2',
    label: 'computedInjectMaybe',
    internalInjectable: _computedInjectMaybeInjectable,
    injectionToken: computedInjectMaybe2InjectionToken,
  },
);

export const computedInjectMaybeWithMetaInjectable =
  computedInjectMaybeInjectableFor({
    id: 'computed-inject-maybe-with-meta',
    label: 'computedInjectMaybeWithMeta',
    internalInjectable: _computedInjectMaybeWithMetaInjectable,
    injectionToken: computedInjectMaybeWithMetaInjectionToken,
  });

export const computedInjectMaybeWithMeta2Injectable =
  computedInjectMaybe2InjectableFor({
    id: 'computed-inject-maybe-with-meta-2',
    label: 'computedInjectMaybeWithMeta',
    internalInjectable: _computedInjectMaybeWithMetaInjectable,
    injectionToken: computedInjectMaybeWithMeta2InjectionToken,
  });
