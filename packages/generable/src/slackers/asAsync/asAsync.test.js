import asAsync from './asAsync';

describe('asAsync', () => {
  it('given sync iterable, returns new async iterable', async () => {
    const syncIterable = [1, 2];

    const asyncIterable = asAsync(syncIterable);

    const iterator = asyncIterable[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      {
        value: 1,
        done: false,
      },
      {
        value: 2,
        done: false,
      },
      {
        value: undefined,
        done: true,
      },
    ]);
  });
});
