import curry from 'lodash/fp/curry';

export default curry((tappingFunction, iterable) =>
  Symbol.asyncIterator in iterable
    ? (async function*() {
        for await (const i of iterable) {
          tappingFunction(i);
          yield i;
        }
      })()
    : (function*() {
        for (const i of iterable) {
          tappingFunction(i);
          yield i;
        }
      })(),
);
