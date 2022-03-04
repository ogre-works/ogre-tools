import curry from 'lodash/fp/curry';
import get from 'lodash/fp/get';
import has from 'lodash/fp/has';

export default curry((dictionary, propertyName) => {
  if (!has(propertyName, dictionary)) {
    throw new Error(`Tried to get unknown property "${propertyName}"`);
  }

  return get(propertyName, dictionary);
});
