export const injectableBunchSymbol = 'injectable-bunch';

export default bunch =>
  Object.assign(bunch, {
    aliasType: injectableBunchSymbol,
  });
