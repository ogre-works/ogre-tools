import every from 'lodash/fp/every';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import getIterator from '../../shared/getIterator/getIterator';
import { flow } from '@ogre-tools/fp';

export default (...iterables) => {
  const iterators = getIterators(iterables);
  const iteratorSet = new Set(iterators);

  return allAreSync(iterables)
    ? (function* () {
        while (!isEmpty(iteratorSet)) {
          for (const iterator of iteratorSet) {
            const { value, done } = iterator.next();

            if (done) {
              iteratorSet.delete(iterator);
            } else {
              yield value;
            }
          }
        }
      })()
    : (async function* () {
        const nextPromises = getNextPromiseSet(iterators);

        while (!isEmpty(nextPromises)) {
          const { value, done, promise, iterator } = await Promise.race(
            nextPromises,
          );

          nextPromises.delete(promise);

          if (!done) {
            const nextPromise = getNextPromiseFrom(iterator);

            nextPromises.add(nextPromise);

            yield value;
          }
        }
      })();
};

const getIterators = map(getIterator);

const allAreSync = every(iterable => Symbol.iterator in iterable);

const getNextPromiseFrom = iterator => {
  const nextPromise = Promise.resolve(iterator.next());

  const wrappedPromise = nextPromise.then(({ value, done }) => ({
    value,
    done,
    promise: wrappedPromise,
    iterator,
  }));

  return wrappedPromise;
};

const getNextPromiseSet = flow(
  map(getNextPromiseFrom),
  promises => new Set(promises),
);
