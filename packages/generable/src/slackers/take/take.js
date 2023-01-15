import curry from 'lodash/fp/curry';

export default curry((numberOfItemsToTake, iterable) => {
  let counter = 0;

  return Symbol.asyncIterator in iterable
    ? (async function*() {
        for await (const i of iterable) {
          yield i;

          if (++counter === numberOfItemsToTake) {
            break;
          }
        }
      })()
    : (function*() {
        for (const i of iterable) {
          yield i;

          if (++counter === numberOfItemsToTake) {
            break;
          }
        }
      })();
});
