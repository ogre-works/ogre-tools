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
  //
  // A `speciality` in options builds a specific token directly — this is how
  // getSpecificInjectionToken2 used to be its own function; folded in here
  // since buildToken already threads `speciality` through via `...rest`
  // regardless of which creator is called. Unlike the old
  // getSpecificInjectionToken2, this also accepts a factory, so a specific
  // token can itself be a family root for nested specificity — see the
  // comment on buildToken for why that makes it abstract too.
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
