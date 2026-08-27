import { getInjectionToken2 } from './getInjectionToken2';

const buildAbstractToken = ({ specificInjectionTokenFactory, ...options }) => {
  const token = getInjectionToken2(options)(specificInjectionTokenFactory);
  token.abstract = true;
  return token;
};

export const getAbstractInjectionToken2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getAbstractInjectionToken2(options)(factory). The
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

  return specificInjectionTokenFactory => {
    // Abstract tokens make the factory mandatory: a family is only ever
    // useful resolved via a real `.for()`, unlike a plain injection token,
    // which may legitimately have no `.for()` at all.
    if (specificInjectionTokenFactory === undefined) {
      throw new Error(
        `Tried to create abstract injection token${
          options?.id ? ` "${options.id}"` : ''
        } without a specificInjectionTokenFactory; abstract tokens require one.`,
      );
    }

    return buildAbstractToken({ ...options, specificInjectionTokenFactory });
  };
};
