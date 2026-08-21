import { injectionTokenTag } from '../getInjectionToken/injectionTokenTag';

export const injectionTokenSymbol2 = 'injection-token2';

const cardinalities = ['one', 'zero-or-one', 'zero-or-many', 'one-or-many'];

export const getInjectionToken2 = (...unexpectedArgs) => {
  // Loud failure for pre-curry call sites: without this, passing options to
  // the outer call would silently return the inner creator instead of a token.
  if (unexpectedArgs.length > 0) {
    throw new Error(
      `Tried to create injection token "${unexpectedArgs[0]?.id}" by passing options to the first call, but getInjectionToken2 is curried: use getInjectionToken2()(options).`,
    );
  }

  return ({
    specificInjectionTokenFactory: specificTokenFactory = getSpecificToken2ById,

    target,

    tags,

    ...rest
  }) => {
    // Specific tokens (marked by a speciality) get their cardinality assigned
    // by the parent's `.for()`; only general tokens must declare one.
    if (rest.speciality === undefined) {
      if (rest.cardinality === undefined) {
        throw new Error(
          `Tried to create injection token "${rest.id}" without cardinality.`,
        );
      }

      if (!cardinalities.includes(rest.cardinality)) {
        throw new Error(
          `Tried to create injection token "${rest.id}" with unknown cardinality "${rest.cardinality}".`,
        );
      }

      if (
        rest.specificCardinality !== undefined &&
        !cardinalities.includes(rest.specificCardinality)
      ) {
        throw new Error(
          `Tried to create injection token "${rest.id}" with unknown specific cardinality "${rest.specificCardinality}".`,
        );
      }
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

      for: (...specifiers) => {
        const memoizedToken =
          specifiers.length === 1
            ? specificTokensBySpecifier.get(specifiers[0])
            : undefined;

        if (memoizedToken) {
          return memoizedToken;
        }

        const specificTokenCandidate = specificTokenFactory(...specifiers);

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
          generalToken.specificCardinality ?? generalToken.cardinality;

        specificTokensBySpeciality.set(specificToken.speciality, specificToken);

        if (specifiers.length === 1) {
          specificTokensBySpecifier.set(specifiers[0], specificToken);
        }

        return specificToken;
      },
    });

    return generalToken;
  };
};

export const getSpecificInjectionToken2 = (...unexpectedArgs) => {
  if (unexpectedArgs.length > 0) {
    throw new Error(
      `Tried to create specific injection token "${unexpectedArgs[0]?.id}" by passing options to the first call, but getSpecificInjectionToken2 is curried: use getSpecificInjectionToken2()(options).`,
    );
  }

  return options => getInjectionToken2()(options);
};

const getSpecificToken2ById = id =>
  getInjectionToken2()({ id, speciality: id });
