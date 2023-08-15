import getInjectable from '../getInjectable/getInjectable';

export const injectableBunchSymbol = 'injectable-bunch';

export default bunch => {
  const injectableTuples = Object.entries(bunch).map(([key, value]) => [
    key,
    getInjectable(value),
  ]);

  return Object.fromEntries([
    ['aliasType', injectableBunchSymbol],
    ...injectableTuples,
  ]);
};
