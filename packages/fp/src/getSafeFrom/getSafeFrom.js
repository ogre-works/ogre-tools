import { curry, get, has } from 'lodash/fp';

export default curry((dictionary, propertyName) => {
  if (!has(propertyName, dictionary)) {
    throw new Error(`Tried to get unknown property "${propertyName}"`);
  }

  return get(propertyName, dictionary);
});
