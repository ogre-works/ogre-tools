export const injectionTokenSymbol = 'injection-token';

export const getInjectionToken = ({
  specificInjectionTokenFactory: specificTokenFactory = getSpecificTokenById,

  target,

  ...rest
}) => {
  const specificTokensBySpeciality = new Map();

  const generalToken = Object.assign(target ?? {}, {
    ...rest,

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

      specificTokensBySpeciality.set(specificToken.speciality, specificToken);

      return specificToken;
    },
  });

  return generalToken;
};

export const getSpecificInjectionToken = (...args) =>
  getInjectionToken(...args);

const getSpecificTokenById = id => getInjectionToken({ id, speciality: id });
