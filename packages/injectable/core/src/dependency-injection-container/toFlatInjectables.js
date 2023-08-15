import isInjectableBunch from '../getInjectableBunch/isInjectableBunch';

export default injectables =>
  injectables.flatMap(injectable =>
    isInjectableBunch(injectable)
      ? Object.entries(injectable)
          .filter(([key]) => key !== 'aliasType')
          .map(([, value]) => value)
      : [injectable],
  );
