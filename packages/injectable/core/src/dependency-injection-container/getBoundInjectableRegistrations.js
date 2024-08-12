export const getBoundInjectableRegistrationsFor =
  ({ injectablesByBoundTargetMap }) =>
  injectable => {
    const tokenSpecificRegistrations =
      injectablesByBoundTargetMap.get(injectable.injectionToken) || [];

    const injectableSpecificRegistrations =
      injectablesByBoundTargetMap.get(injectable) || [];

    return [...tokenSpecificRegistrations, ...injectableSpecificRegistrations];
  };
