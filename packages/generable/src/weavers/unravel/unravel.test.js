import asArray from '../../pullers/asArray/asArray';
import tap from '../../slackers/tap/tap';
import unravel from './unravel';
import noop from 'lodash/fp/noop';
import { pipeline } from '@lensapp/fp';

describe('unravel', () => {
  it('given multiple output generators, when iterating sync iterable, broadcasts iterations to all outputs', async () => {
    const syncIterable = [1, 2, 3];

    const resultPromise = pipeline(
      syncIterable,
      unravel(asArray, asArray, asArray),
      promises => Promise.all(promises),
    );

    const result = await resultPromise;

    expect(result).toEqual([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });

  it('given multiple output generators, when iterating async iterable, broadcasts iterations to all outputs', async () => {
    const asyncIterable = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();

    const resultPromise = pipeline(
      asyncIterable,
      unravel(asArray, asArray, asArray),
      promises => Promise.all(promises),
    );

    const result = await resultPromise;

    expect(result).toEqual([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });

  it('given multiple outputs, when iterating, iterates source iterable only once', async () => {
    let iterationPassCount = 0;

    const asyncIterable = {
      *[Symbol.asyncIterator]() {
        iterationPassCount++;
        yield;
      },
    };

    await pipeline(
      asyncIterable,
      unravel(asArray, asArray, asArray),
      promises => Promise.all(promises),
    );

    expect(iterationPassCount).toBe(1);
  });

  it('given only outputs which are not iterated yet, does not iterate source', async () => {
    let iterationPassCount = 0;

    const asyncIterable = {
      *[Symbol.asyncIterator]() {
        iterationPassCount++;
        yield;
      },
    };

    await pipeline(
      asyncIterable,
      unravel(tap(noop), tap(noop), tap(noop)),
      promises => Promise.all(promises),
    );

    expect(iterationPassCount).toBe(0);
  });
});
