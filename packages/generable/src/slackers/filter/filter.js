import curry from 'lodash/fp/curry';

export default curry((filteringFunction, iterable) =>
  Symbol.asyncIterator in iterable
    ? (async function* () {
        for await (const i of iterable) {
          if (filteringFunction(i)) {
            yield i;
          }
        }
      })()
    : (function* () {
        for (const i of iterable) {
          if (filteringFunction(i)) {
            yield i;
          }
        }
      })(),
);
