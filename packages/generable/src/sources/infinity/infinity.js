import constant from 'lodash/fp/constant';

const infinity = function*(seed = undefined, reducer = constant(seed)) {
  let acc = seed;

  while (true) {
    yield acc;

    acc = reducer(acc);
  }
};

infinity[Symbol.iterator] = infinity;

export default infinity;
