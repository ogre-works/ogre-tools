import { injectionTokenTag } from '../getInjectionToken/injectionTokenTag';

export const injectionTokenSymbol2 = 'injection-token2';

const cardinalities = ['one', 'zero-or-one', 'zero-or-many', 'one-or-many'];

const buildToken = ({
  specificInjectionTokenFactory,
  target,
  tags,
  ...rest
}) => {
  // A specific token may declare its own cardinality — its family's general
  // token often has a different one — and inherits when it does not, which
  // is why only general tokens are required to declare.
  if (rest.cardinality === undefined) {
    if (rest.speciality === undefined) {
      throw new Error(
        `Tried to create injection token "${rest.id}" without cardinality.`,
      );
    }
  } else if (!cardinalities.includes(rest.cardinality)) {
    throw new Error(
      `Tried to create injection token "${rest.id}" with unknown cardinality "${rest.cardinality}".`,
    );
  }

  const specificTokensBySpeciality = new Map();

  // The factory is assumed pure and deterministic: a specifier always maps
  // to the same token, so single-specifier calls are memoized by specifier
  // to skip constructing a throwaway candidate on repeat `.for()` calls.
  const specificTokensBySpecifier = new Map();

  const generalToken = Object.assign(target ?? {}, {
    ...rest,

    tags: [injectionTokenTag, ...(tags ?? [])],

    aliasType: injectionTokenSymbol2,

    // No factory means no `.for()` at all, matching the type: a token isn't
    // required to be part of a family. A factory also makes the token
    // abstract: it's only ever useful resolved via a real `.for()`, so it
    // cannot be injected/registered directly — see checkForAbstractTokenFor
    // and register.js's `injectionToken?.abstract` check.
    ...(specificInjectionTokenFactory && {
      abstract: true,

      for: (...specifiers) => {
        const memoizedToken =
          specifiers.length === 1
            ? specificTokensBySpecifier.get(specifiers[0])
            : undefined;

        if (memoizedToken) {
          return memoizedToken;
        }

        const specificTokenCandidate = specificInjectionTokenFactory(
          ...specifiers,
        );

        const existingSpecificToken = specificTokensBySpeciality.get(
          specificTokenCandidate.speciality,
        );

        if (existingSpecificToken) {
          if (specifiers.length === 1) {
            specificTokensBySpecifier.set(specifiers[0], existingSpecificToken);
          }

          return existingSpecificToken;
        }

        const specificToken = specificTokenCandidate;

        specificToken.id = `${generalToken.id}/${specificToken.id}`;
        specificToken.specificTokenOf = generalToken;
        specificToken.maxCacheSize = generalToken.maxCacheSize;
        specificToken.tags = generalToken.tags;
        specificToken.cardinality =
          specificToken.cardinality ?? generalToken.cardinality;

        specificTokensBySpeciality.set(specificToken.speciality, specificToken);

        if (specifiers.length === 1) {
          specificTokensBySpecifier.set(specifiers[0], specificToken);
        }

        return specificToken;
      },
    }),
  });

  return generalToken;
};

export const getInjectionToken2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getInjectionToken2(options)(factory), or
  // getInjectionToken2(options)() for a concrete token with no `.for()` at
  // all. Passing a factory also makes the token abstract — see buildToken.
  // The explicit-SF escape hatch (getInjectionToken2<F, MF, SF>(options))
  // uses this exact same shape, factory just optional on the trailing call
  // instead of required — nothing distinguishes them at runtime, since SF
  // being spelled out explicitly vs inferred from the factory value is
  // erased by the time this code runs.
  if (args.length !== 1) {
    throw new Error(
      `Tried to create injection token${
        args[0]?.id ? ` "${args[0].id}"` : ''
      } with ${
        args.length
      } arguments; getInjectionToken2 takes exactly one (options).`,
    );
  }

  const [options] = args;

  return specificInjectionTokenFactory =>
    buildToken({ ...options, specificInjectionTokenFactory });
};

export const getSpecificInjectionToken2 = (...unexpectedArgs) => {
  if (unexpectedArgs.length > 0) {
    throw new Error(
      `Tried to create specific injection token "${unexpectedArgs[0]?.id}" by passing options to the first call, but getSpecificInjectionToken2 is curried: use getSpecificInjectionToken2()(options).`,
    );
  }

  // No factory: a specific token created this way is always a concrete leaf,
  // directly injectable/registerable. Passing a factory here would make it
  // abstract instead, so this is left for callers to opt into explicitly.
  return options => getInjectionToken2(options)();
};
