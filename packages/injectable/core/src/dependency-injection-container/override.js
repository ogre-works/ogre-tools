import { earlyOverrideFor } from './early-override';

export const overrideFor =
  ({ getRelatedInjectables, earlyOverride }) =>
  (alias, instantiateStub) => {
    const relatedInjectables = getRelatedInjectables(alias);

    if (relatedInjectables.length === 0) {
      if (alias.aliasType === 'injection-token') {
        throw new Error(
          `Tried to override single implementation of injection token "${alias.id}", but found no registered implementations.`,
        );
      }

      throw new Error(
        `Tried to override "${alias.id}" which is not registered.`,
      );
    }

    earlyOverride(alias, instantiateStub);
  };

export const unoverrideFor =
  ({ overridingInjectables, getRelatedInjectables }) =>
  alias => {
    const [injectable] = getRelatedInjectables(alias);

    if (!injectable) {
      throw new Error(
        `Tried to unoverride "${alias.id}", but it was not registered.`,
      );
    }

    if (!overridingInjectables.has(injectable)) {
      throw new Error(
        `Tried to unoverride "${alias.id}", but it was not overridden.`,
      );
    }

    overridingInjectables.delete(injectable);
  };
