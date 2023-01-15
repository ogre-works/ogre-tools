import reduce from './reduce';

describe('reduce', () => {
  it('given a reducer function, seed and synchronous iterable, returns reduced value', () => {
    const reducerFunction = (acc, i) => acc + i;

    const seed = 0;

    const synchronousIterable = [1, 2, 3];

    const actual = reduce(reducerFunction)(seed)(synchronousIterable);

    expect(actual).toBe(6);
  });

  it('given a reducer function, seed and asynchronous iterable, returns promise for reduced value', async () => {
    const reducerFunction = (acc, i) => acc + i;

    const seed = 0;

    const asynchronousIterable = (async function*() {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const actual = await reduce(reducerFunction)(seed)(asynchronousIterable);

    expect(actual).toBe(6);
  });
});
