import take from './take';

describe('take', () => {
  it('given a number of items to take and synchronous iterable, returns new synchronous iterable for taken values', () => {
    const synchronousIterable = [1, 2, 3];

    const iterableForTakenValues = take(2, synchronousIterable);

    const iterator = iterableForTakenValues[Symbol.iterator]();

    const iterations = [iterator.next(), iterator.next(), iterator.next()];

    expect(iterations).toEqual([
      { value: 1, done: false },
      { value: 2, done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given a number of items to take and asynchronous iterable, returns new asynchronous iterable for taken values', async () => {
    const asynchronousIterable = (async function*() {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const iterableForTakenValues = take(2)(asynchronousIterable);

    const iterator = iterableForTakenValues[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 1, done: false },
      { value: 2, done: false },
      { value: undefined, done: true },
    ]);
  });
});
