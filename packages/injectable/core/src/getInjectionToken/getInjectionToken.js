export const injectionTokenSymbol = 'injection-token';

const tokenReferenceByDomainAndId = new Map();

export const getInjectionToken = ({
  decorable = true,

  specificInjectionTokenFactory: specificTokenFactory = getSpecificTokenById,

  ...rest
}) => {
  const domainAndId = `${rest.domain}:${rest.id}`;

  if (rest.domain && tokenReferenceByDomainAndId.has(domainAndId)) {
    return tokenReferenceByDomainAndId.get(domainAndId);
  }

  const specificTokensBySpeciality = new Map();

  const generalToken = {
    ...rest,

    decorable,

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
      specificToken.decorable = generalToken.decorable;

      specificTokensBySpeciality.set(specificToken.speciality, specificToken);

      return specificToken;
    },
  };

  tokenReferenceByDomainAndId.set(domainAndId, generalToken);

  return generalToken;
};

export const getSpecificInjectionToken = (...args) =>
  getInjectionToken(...args);

const getSpecificTokenById = id => getInjectionToken({ id, speciality: id });
