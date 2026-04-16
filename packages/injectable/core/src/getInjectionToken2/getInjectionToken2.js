export const injectionTokenSymbol2 = 'injection-token2';

export const getInjectionToken2 = ({
  decorable = true,

  specificInjectionTokenFactory: specificTokenFactory = getSpecificToken2ById,

  target,

  ...rest
}) => {
  const specificTokensBySpeciality = new Map();

  const generalToken = Object.assign(target ?? {}, {
    ...rest,

    decorable,

    aliasType: injectionTokenSymbol2,

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
  });

  return generalToken;
};

export const getSpecificInjectionToken2 = (...args) =>
  getInjectionToken2(...args);

const getSpecificToken2ById = id => getInjectionToken2({ id, speciality: id });
