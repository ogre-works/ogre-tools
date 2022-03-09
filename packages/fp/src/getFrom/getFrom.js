import curry from 'lodash/fp/curry';
import get from 'lodash/fp/get';

export default curry((dictionary, propertyName) =>
  get(propertyName, dictionary),
);
