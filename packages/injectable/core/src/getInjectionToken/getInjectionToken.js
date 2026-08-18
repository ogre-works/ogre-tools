import { injectionTokenTag } from './injectionTokenTag';

export const injectionTokenSymbol = 'injection-token';

export const getInjectionToken = ({
  specificInjectionTokenFactory: specificTokenFactory = getSpecificTokenById,

  target,

  tags,

  ...rest
}) => {
  const specificTokensBySpeciality = new Map();

  // The factory is assumed pure and deterministic: a specifier always maps
  // to the same token, so single-specifier calls are memoized by specifier
  // to skip constructing a throwaway candidate on repeat `.for()` calls.
  const specificTokensBySpecifier = new Map();

  const generalToken = Object.assign(target ?? {}, {
    ...rest,

    tags: [injectionTokenTag, ...(tags ?? [])],

    aliasType: injectionTokenSymbol,

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

      specificTokensBySpeciality.set(specificToken.speciality, specificToken);

      if (specifiers.length === 1) {
        specificTokensBySpecifier.set(specifiers[0], specificToken);
      }

      return specificToken;
    },
  });

  return generalToken;
};

export const getSpecificInjectionToken = (...args) =>
  getInjectionToken(...args);

const getSpecificTokenById = id => getInjectionToken({ id, speciality: id });
