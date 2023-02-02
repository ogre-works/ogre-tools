import curry from 'lodash/fp/curry';
import isFunction from 'lodash/fp/isFunction';

export default curry((mapper, iterable) => {
  const mapperIsFunction = isFunction(mapper);
  const mapperIsAsync = isAsyncFunction(mapper);
  const iterableIsAsync = Symbol.asyncIterator in iterable;

  return iterableIsAsync || mapperIsAsync
    ? (async function* () {
        for await (const i of iterable) {
          yield mapperIsFunction ? mapper(i) : mapper;
        }
      })()
    : (function* () {
        for (const i of iterable) {
          yield mapperIsFunction ? mapper(i) : mapper;
        }
      })();
});

const isAsyncFunction = f => f.constructor.name === 'AsyncFunction';
