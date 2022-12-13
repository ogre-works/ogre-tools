export const isRelevantDecoratorFor = injectable => decorator =>
  !decorator.target || isRelatedTo(decorator.target)(injectable);

const isRelatedTo = alias => injectable =>
  injectable.id === alias.id ||
  (injectable.injectionToken && injectable.injectionToken.id === alias.id);
