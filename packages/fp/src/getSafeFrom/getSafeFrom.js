import { curry, get, has, keys } from 'lodash/fp';

export default curry((dictionary, propertyName) => {
  if (!has(propertyName, dictionary)) {
    throw new Error(
      `Tried to get unknown property "${propertyName}" from an object. Available properties are:\n\n${keys(
        dictionary,
      ).join('\n')}`,
    );
  }

  return get(propertyName, dictionary);
});
