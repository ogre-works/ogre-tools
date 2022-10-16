import { curry, get } from 'lodash/fp';

export default curry((dictionary, propertyName) =>
  get(propertyName, dictionary),
);
