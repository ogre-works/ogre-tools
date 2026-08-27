import { getInjectionToken2 } from './getInjectionToken2';

const buildAbstractToken = ({ specificInjectionTokenFactory, ...options }) => {
  const token = getInjectionToken2(options)(specificInjectionTokenFactory);
  token.abstract = true;
  return token;
};

export const getAbstractInjectionToken2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getAbstractInjectionToken2(options)(factory),
  // or getAbstractInjectionToken2(options)() for the default factory. The
  // explicit-SF escape hatch (getAbstractInjectionToken2<F, MF, SF>(options))
  // uses this exact same shape — see the comment on getInjectionToken2.
  if (args.length !== 1) {
    throw new Error(
      `Tried to create abstract injection token${
        args[0]?.id ? ` "${args[0].id}"` : ''
      } with ${
        args.length
      } arguments; getAbstractInjectionToken2 takes exactly one (options).`,
    );
  }

  const [options] = args;

  return specificInjectionTokenFactory =>
    buildAbstractToken({ ...options, specificInjectionTokenFactory });
};
