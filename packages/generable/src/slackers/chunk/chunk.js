import curry from 'lodash/fp/curry';

export default curry((chunkSize, iterable) => {
  let chunk = [];

  return Symbol.asyncIterator in iterable
    ? (async function* () {
        for await (const i of iterable) {
          chunk = [...chunk, i];

          if (chunk.length === chunkSize) {
            yield chunk;
            chunk = [];
          }
        }
      })()
    : (function* () {
        for (const i of iterable) {
          chunk = [...chunk, i];

          if (chunk.length === chunkSize) {
            yield chunk;
            chunk = [];
          }
        }
      })();
});
