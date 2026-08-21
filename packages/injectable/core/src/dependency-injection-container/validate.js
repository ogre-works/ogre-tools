import { injectableSymbol2 } from '../getInjectable2/getInjectable2';

const isToken2 = alias => alias.aliasType === 'injection-token2';

// Read-only: reads the registration state directly and holds nothing of its
// own, so registering after validating works and validating again reflects it.
export const validateFor =
  ({
    containerId,
    injectableSet,
    injectablesByInjectionToken,
    namespacedIdByInjectableMap,
    overridingInjectables,
  }) =>
  () => {
    const verifiedIds = [];
    const unverifiedIds = [];
    const unverifiableConsumptions = [];
    const violations = [];

    for (const injectable of injectableSet) {
      const namespacedId = namespacedIdByInjectableMap.get(injectable);

      // Only injectable2 declares consumptions; v1 injectables are beyond
      // what this can check.
      if (injectable.aliasType !== injectableSymbol2) {
        unverifiedIds.push(namespacedId);
        continue;
      }

      verifiedIds.push(namespacedId);

      // An overridden injectable's own instantiate never runs, so its
      // declarations say nothing about what this container needs.
      if (overridingInjectables.has(injectable)) {
        continue;
      }

      for (const consumption of injectable.consumptions ?? []) {
        if (!isToken2(consumption)) {
          // A v1 token carries no cardinality, so there is no arity to check.
          unverifiableConsumptions.push({
            injectableId: namespacedId,
            consumptionId: consumption.id,
          });

          continue;
        }

        const { cardinality } = consumption;

        if (cardinality !== 'one' && cardinality !== 'one-or-many') {
          continue;
        }

        // The index holds every registration made against the token or any of
        // its `.for()` derivatives, which is how a general-token declaration
        // is satisfied by an implementation of one of its specific tokens.
        const registered = injectablesByInjectionToken.get(consumption);

        // Only the lower bound is checked here: the upper bound cannot be
        // exceeded, since registering rejects the second implementation.
        if (registered === undefined || registered.size === 0) {
          violations.push(
            `Injectable "${namespacedId}" consumes injection token "${consumption.id}" with cardinality "${cardinality}", but it has no registrations.`,
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Tried to validate container "${containerId}", but found violations:\n${violations
          .map(violation => ` - ${violation}`)
          .join('\n')}`,
      );
    }

    const sorted = ids => [...ids].sort();

    return {
      verifiedInjectables: {
        count: verifiedIds.length,
        ids: sorted(verifiedIds),
      },

      unverifiedInjectables: {
        count: unverifiedIds.length,
        ids: sorted(unverifiedIds),
      },

      unverifiableConsumptions,
    };
  };
