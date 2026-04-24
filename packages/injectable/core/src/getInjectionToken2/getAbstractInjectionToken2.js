import { getInjectionToken2 } from './getInjectionToken2';

export const getAbstractInjectionToken2 = options => {
  const token = getInjectionToken2(options);
  token.abstract = true;
  return token;
};
