import isInjectableBunch from '../getInjectableBunch/isInjectableBunch';
import isInjectable from '../getInjectable/isInjectable';

const getDeepBunchValuesFlat = injectable =>
  Object.values(injectable).flatMap(thing =>
    isInjectableBunch(thing) ? getDeepBunchValuesFlat(thing) : [thing],
  );

export default injectables =>
  injectables.flatMap(injectable =>
    isInjectableBunch(injectable)
      ? getDeepBunchValuesFlat(injectable).filter(isInjectable)
      : [injectable],
  );
