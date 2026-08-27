import { getInjectionToken2 } from './getInjectionToken2';

const buildAbstractToken = options => {
  const token = getInjectionToken2()(options);
  token.abstract = true;
  return token;
};

export const getAbstractInjectionToken2 = (...args) => {
  // Non-curried form: options given directly, factory curried as the
  // required next call — getAbstractInjectionToken2(options)(factory).
  if (args.length === 1) {
    const [options] = args;

    return specificInjectionTokenFactory =>
      buildAbstractToken({ ...options, specificInjectionTokenFactory });
  }

  // Loud failure for other pre-curry mistakes: without this, passing more
  // than options to the outer call would silently be dropped.
  if (args.length > 1) {
    throw new Error(
      `Tried to create abstract injection token "${args[0]?.id}" with unexpected extra arguments.`,
    );
  }

  return options => buildAbstractToken(options);
};
