export const purgeInstancesFor =
  ({ getRelatedInjectables, instancesByInjectableMap }) =>
  alias => {
    const injectable = getRelatedInjectables(alias)[0];

    instancesByInjectableMap.get(injectable.id).clear();
  };
