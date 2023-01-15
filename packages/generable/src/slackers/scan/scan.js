import curry from 'lodash/fp/curry';

export default curry((scanningFunction, seed, iterable) => {
  let acc = seed;

  return Symbol.asyncIterator in iterable
    ? (async function*() {
        for await (const i of iterable) {
          acc = scanningFunction(acc, i);
          yield acc;
        }
      })()
    : (function*() {
        for (const i of iterable) {
          acc = scanningFunction(acc, i);
          yield acc;
        }
      })();
});
