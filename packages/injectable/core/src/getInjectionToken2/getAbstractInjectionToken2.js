import { getInjectionToken2 } from './getInjectionToken2';

export const getAbstractInjectionToken2 = (...unexpectedArgs) => {
  // Loud failure for pre-curry call sites: without this, passing options to
  // the outer call would silently return the inner creator instead of a token.
  if (unexpectedArgs.length > 0) {
    throw new Error(
      `Tried to create abstract injection token "${unexpectedArgs[0]?.id}" by passing options to the first call, but getAbstractInjectionToken2 is curried: use getAbstractInjectionToken2()(options).`,
    );
  }

  return options => {
    const token = getInjectionToken2()(options);
    token.abstract = true;
    return token;
  };
};
