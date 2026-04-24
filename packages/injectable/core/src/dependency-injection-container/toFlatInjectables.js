import isInjectableBunch from '../getInjectableBunch/isInjectableBunch';
import isInjectable from '../getInjectable/isInjectable';

const collectDeepBunchValues = (bunch, out) => {
  const values = Object.values(bunch);

  for (let i = 0; i < values.length; i++) {
    const thing = values[i];

    if (isInjectableBunch(thing)) {
      collectDeepBunchValues(thing, out);
    } else if (isInjectable(thing)) {
      out.push(thing);
    }
  }
};

export default injectables => {
  const result = [];

  for (let i = 0; i < injectables.length; i++) {
    const injectable = injectables[i];

    if (isInjectableBunch(injectable)) {
      collectDeepBunchValues(injectable, result);
    } else {
      result.push(injectable);
    }
  }

  return result;
};
