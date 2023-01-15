import filter from './filter';

describe('filter', () => {
  it('given a filtering function and synchronous iterable, returns new synchronous iterable for filtered values', () => {
    const filteringFunction = x => x < 3;

    const synchronousIterable = [1, 2, 3];

    const iterableForMappedValues = filter(
      filteringFunction,
      synchronousIterable,
    );

    const iterator = iterableForMappedValues[Symbol.iterator]();

    const iterations = [iterator.next(), iterator.next(), iterator.next()];

    expect(iterations).toEqual([
      { value: 1, done: false },
      { value: 2, done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given a filtering function and asynchronous iterable, returns new asynchronous iterable for filtered values', async () => {
    const filteringFunction = x => x < 3;

    const asynchronousIterable = (async function*() {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const iterableForMappedValues = filter(filteringFunction)(
      asynchronousIterable,
    );

    const iterator = iterableForMappedValues[Symbol.asyncIterator]();

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
