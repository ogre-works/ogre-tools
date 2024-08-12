import { getNamespacedIdFor } from './getNamespacedIdFor';
import { registrationCallbackToken } from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { DeepMap } from '@lensapp/fp';
import { getRelatedTokens } from './getRelatedTokens';

export const registerFor = ({
  registerSingle,
  injectMany,
  hasRegistrations,
  injectablesByBoundTargetMap,
  getBoundInjectableRegistrations,
  registeredBoundInjectablesSet,
}) => {
  const registerRecursed = ({ injectables, context, source }) => {
    injectables.forEach(injectable => {
      registeredBoundInjectablesSet.add(injectable);
    });

    const boundAliasesAreRegistered = alias =>
      !alias.registersWith ? true : alias.registersWith.every(hasRegistrations);

    const { registrables, nonRegistrables } = toFlatInjectables(
      injectables,
    ).reduce(
      (acc, curr) => {
        if (boundAliasesAreRegistered(curr)) {
          acc.registrables.push(curr);
        } else {
          acc.nonRegistrables.push(curr);
        }

        return acc;
      },

      {
        registrables: [],
        nonRegistrables: [],
      },
    );

    nonRegistrables.forEach(nonRegistrable => {
      nonRegistrable.registersWith.forEach(bindTarget => {
        if (!injectablesByBoundTargetMap.has(bindTarget)) {
          injectablesByBoundTargetMap.set(bindTarget, new Set());
        }

        injectablesByBoundTargetMap
          .get(bindTarget)
          .add({ injectables: [nonRegistrable], context, source });
      });
    });

    registrables.forEach(injectable => {
      registerSingle(injectable, context);
    });

    const callbacks = injectMany(
      registrationCallbackToken,
      undefined,
      context,
      source,
    );

    registrables.forEach(injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    });

    registrables.forEach(registered => {
      getBoundInjectableRegistrations(registered)
        .filter(boundRegistrations =>
          boundRegistrations.injectables
            .flatMap(injectable => injectable.registersWith)
            .every(hasRegistrations),
        )
        .filter(
          registration => !registration.injectables.every(hasRegistrations),
        )
        .forEach(registerRecursed);
    });
  };

  return registerRecursed;
};

export const registerSingleFor =
  ({
    injectableSet,
    injectableIdSet,
    instancesByInjectableMap,
    namespacedIdByInjectableMap,
    injectablesByInjectionToken,
    injectableAndRegistrationContext,
  }) =>
  (injectable, injectionContext) => {
    const injectableId = injectable.id;

    if (!injectableId) {
      throw new Error('Tried to register injectable without ID.');
    }

    injectableAndRegistrationContext.set(injectable, injectionContext);

    const getNamespacedId = getNamespacedIdFor(
      injectableAndRegistrationContext,
    );

    const namespacedId = getNamespacedId(injectable);

    if (namespacedIdByInjectableMap.has(injectable)) {
      throw new Error(
        `Tried to register same injectable multiple times: "${injectable.id}"`,
      );
    }

    if (injectableIdSet.has(namespacedId)) {
      throw new Error(
        `Tried to register multiple injectables for ID "${namespacedId}"`,
      );
    }

    injectableIdSet.add(namespacedId);
    injectableSet.add(injectable);
    namespacedIdByInjectableMap.set(injectable, namespacedId);
    instancesByInjectableMap.set(injectable, new DeepMap());

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      const injectablesSet =
        injectablesByInjectionToken.get(token) || new Set();

      injectablesSet.add(injectable);

      injectablesByInjectionToken.set(token, injectablesSet);
    });
  };
