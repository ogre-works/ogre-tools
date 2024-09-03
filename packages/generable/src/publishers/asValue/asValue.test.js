import asArray from '../../pullers/asArray/asArray';
import range from '../../sources/range/range';
import take from '../../slackers/take/take';
import asValue from './asValue';
import { pipeline } from '@ogre-tools/fp';

describe('asValue', () => {
  it('given already iterated partially, when other iterators join in late, the new iterations start from current value', async () => {
    const iterable = range(1);

    const iterableWithMemory = pipeline(iterable, asValue);

    const firstPass = await pipeline(iterableWithMemory, take(2), asArray);
    expect(firstPass).toEqual([1, 2]);

    const secondPassPromise = pipeline(iterableWithMemory, take(2), asArray);
    const thirdPassPromise = pipeline(iterableWithMemory, take(2), asArray);

    expect(await secondPassPromise).toEqual([2, 3]);
    expect(await thirdPassPromise).toEqual([2, 3]);
  });

  it('given already iterated fully, when other iterators join in late, the new iterations are empty', async () => {
    const iterable = [1, 2, 3];

    const iterableWithMemory = pipeline(iterable, asValue);

    const firstPass = await pipeline(iterableWithMemory, asArray);
    expect(firstPass).toEqual([1, 2, 3]);

    const secondPassPromise = pipeline(iterableWithMemory, asArray);
    const thirdPassPromise = pipeline(iterableWithMemory, asArray);

    expect(await secondPassPromise).toEqual([]);
    expect(await thirdPassPromise).toEqual([]);
  });

  it('given multiple iteration passes, when iterating, iterates source iterable only once', async () => {
    let iterationPassCount = 0;

    const iterable = {
      *[Symbol.asyncIterator]() {
        iterationPassCount++;
        yield;
      },
    };

    const iterableWithMemory = pipeline(iterable, asValue);

    await pipeline(iterableWithMemory, asArray);
    await pipeline(iterableWithMemory, asArray);

    expect(iterationPassCount).toBe(1);
  });
});
