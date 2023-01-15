import { reduce } from 'lodash/fp';

const appendTo = values => value => [...values, value];

export default reduce(
  (accumulated, current) =>
    accumulated.flatMap(values => current.map(appendTo(values))),
  [[]],
);
