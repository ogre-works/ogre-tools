export const getFromClauseFor = namespacedIdByInjectableMap => injectingInjectable => {
  const injectorId = namespacedIdByInjectableMap.get(injectingInjectable);

  return injectorId ? ` from "${injectorId}"` : '';
};
