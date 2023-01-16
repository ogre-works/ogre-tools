import asArray from '../../pullers/asArray/asArray';
import scan from './scan';
import { pipeline } from '@ogre-tools/fp';

describe('scan', () => {
  it('given a scanning function, seed and synchronous iterable, returns new synchronous iterable for scanned values', () => {
    const synchronousIterable = [1, 2, 3];

    const result = pipeline(
      synchronousIterable,
      scan((acc, i) => acc + i, 0),
      asArray,
    );

    expect(result).toEqual([1, 3, 6]);
  });

  it('given a scanning function, seed and asynchronous iterable, returns new asynchronous iterable for scanned values', async () => {
    const asynchronousIterable = (async function* () {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const result = await pipeline(
      asynchronousIterable,
      scan((acc, i) => acc + i, 0),
      asArray,
    );

    expect(result).toEqual([1, 3, 6]);
  });
});
