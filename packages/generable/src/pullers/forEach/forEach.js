import curry from 'lodash/fp/curry';

export default curry(async (forEachFunction, iterable) => {
  if (Symbol.asyncIterator in iterable) {
    for await (const i of iterable) {
      await forEachFunction(i);
    }
  } else {
    for (const i of iterable) {
      forEachFunction(i);
    }
  }
});
