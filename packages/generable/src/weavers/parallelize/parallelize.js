import flow from 'lodash/fp/flow';
import every from 'lodash/fp/every';
import invokeMap from 'lodash/fp/invokeMap';
import map from 'lodash/fp/map';
import some from 'lodash/fp/some';
import negate from 'lodash/fp/negate';
import getIterator from '../../shared/getIterator/getIterator';

export default (...iterables) => {
  const iterators = getIterators(iterables);

  return allAreSync(iterables)
    ? (function* () {
        for (
          let nextArray = getNextArraySync(iterators);
          none('done', nextArray);
          nextArray = getNextArraySync(iterators)
        ) {
          yield map('value', nextArray);
        }
      })()
    : (async function* () {
        for (
          let nextArray = await getNextArrayAsync(iterators);
          none('done', nextArray);
          nextArray = await getNextArrayAsync(iterators)
        ) {
          yield map('value', nextArray);
        }
      })();
};

const none = negate(some);

const getIterators = map(getIterator);

const allAreSync = every(iterable => Symbol.iterator in iterable);

const getNextArraySync = invokeMap('next');

const getNextArrayAsync = flow(invokeMap('next'), nextPromises =>
  Promise.all(nextPromises),
);
