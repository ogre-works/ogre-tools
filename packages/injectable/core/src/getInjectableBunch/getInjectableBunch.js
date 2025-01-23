import getInjectable from '../getInjectable/getInjectable';

export const injectableBunchSymbol = 'injectable-bunch';

export default function (bunch) {
  return {
    aliasType: injectableBunchSymbol,
    ...bunch,
  };
}
