import { injectionTokenTag } from './injectionTokenTag';

export const injectionTokenSymbol = 'injection-token';

export const getInjectionToken = ({
  specificInjectionTokenFactory: specificTokenFactory = getSpecificTokenById,

  target,

  tags,

  ...rest
}) => {
  const specificTokensBySpeciality = new Map();

  const generalToken = Object.assign(target ?? {}, {
    ...rest,

    tags: [injectionTokenTag, ...(tags ?? [])],

    aliasType: injectionTokenSymbol,

    for: (...specifiers) => {
      const specificTokenCandidate = specificTokenFactory(...specifiers);

      const existingSpecificToken = specificTokensBySpeciality.get(
        specificTokenCandidate.speciality,
      );

      if (existingSpecificToken) {
        return existingSpecificToken;
      }

      const specificToken = specificTokenCandidate;

      specificToken.id = `${generalToken.id}/${specificToken.id}`;
      specificToken.specificTokenOf = generalToken;
      specificToken.maxCacheSize = generalToken.maxCacheSize;
      specificToken.tags = generalToken.tags;

      specificTokensBySpeciality.set(specificToken.speciality, specificToken);

      return specificToken;
    },
  });

  return generalToken;
};

export const getSpecificInjectionToken = (...args) =>
  getInjectionToken(...args);

const getSpecificTokenById = id => getInjectionToken({ id, speciality: id });
