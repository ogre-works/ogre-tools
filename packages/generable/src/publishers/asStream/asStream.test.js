import asArray from '../../pullers/asArray/asArray';
import take from '../../slackers/take/take';
import asStream from './asStream';
import { pipeline } from '@lensapp/fp';

describe('asStream', () => {
  it('given source iterable is already partially iterated, when another iteration pass happens, iteration carries on from next iteration', async () => {
    const iterable = [1, 2, 3];

    const asStreamedIterable = pipeline(iterable, asStream);

    const firstPass = await pipeline(asStreamedIterable, take(2), asArray);
    expect(firstPass).toEqual([1, 2]);

    const secondPass = await pipeline(asStreamedIterable, asArray);
    expect(secondPass).toEqual([3]);
  });

  it('given source iterable has been fully iterated, when another iteration pass happens, iteration is empty', async () => {
    const iterable = [1, 2, 3];

    const asStreamedIterable = pipeline(iterable, asStream);

    const firstPass = await pipeline(asStreamedIterable, asArray);
    expect(firstPass).toEqual([1, 2, 3]);

    const secondPass = await pipeline(asStreamedIterable, asArray);
    expect(secondPass).toEqual([]);
  });

  it('when not iterated, does not iterate source', async () => {
    const func = jest.fn();

    const iterable = (function* () {
      func();
      yield 1;
    })();

    pipeline(iterable, asStream);

    expect(func).not.toHaveBeenCalled();
  });
});
