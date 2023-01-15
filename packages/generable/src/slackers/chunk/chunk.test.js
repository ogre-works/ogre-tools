import chunk from './chunk';

describe('chunk', () => {
  it('given size for chunks and synchronous iterable, returns new synchronous iterable for chunked values', () => {
    const synchronousIterable = [1, 2, 3];

    const iterableForMappedValues = chunk(2, synchronousIterable);

    const iterator = iterableForMappedValues[Symbol.iterator]();

    const iterations = [iterator.next(), iterator.next()];

    expect(iterations).toEqual([
      { value: [1, 2], done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given size for chunks and asynchronous iterable, returns new asynchronous iterable for chunked values', async () => {
    const asynchronousIterable = (async function*() {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const iterableForMappedValues = chunk(2)(asynchronousIterable);

    const iterator = iterableForMappedValues[Symbol.asyncIterator]();

    const iterations = [await iterator.next(), await iterator.next()];

    expect(iterations).toEqual([
      { value: [1, 2], done: false },
      { value: undefined, done: true },
    ]);
  });
});
