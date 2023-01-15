import curry from 'lodash/fp/curry';

export default curry((reducerFunction, seed, iterable) => {
  let acc = seed;

  return Symbol.asyncIterator in iterable
    ? (async () => {
        for await (const i of iterable) {
          acc = reducerFunction(acc, i);
        }

        return acc;
      })()
    : (() => {
        for (const i of iterable) {
          acc = reducerFunction(acc, i);
        }

        return acc;
      })();
});
