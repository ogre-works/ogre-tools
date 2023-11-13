import asArray from '../../pullers/asArray/asArray';
import debounce from './debounce';
import delay from '../../shared/delay/delay';
import { pipeline } from '@lensapp/fp';
import { advanceFakeTimeSlow } from '@lensapp/test-utils';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('given slow debounce period and an iterable with fast delays, when iterated, the later values supercede older ones', async () => {
    const asyncIterable = (async function* () {
      yield delay(10, 1);
      yield delay(10, 2);
      yield delay(10, 3);
    })();

    const actualPromise = pipeline(asyncIterable, debounce(100), asArray);

    await advanceFakeTimeSlow(130);

    const actual = await actualPromise;

    expect(actual).toEqual([3]);
  });

  it('given a debounce period and an iterable with varying delays, when iterated, the values that remain latest for at least the debounce period get iterated', async () => {
    const asyncIterable = (async function* () {
      yield delay(1, 1);
      yield delay(1, 2);
      yield delay(100, 3);
      yield delay(100, 4);
      yield delay(1, 5);
    })();

    const actualPromise = pipeline(asyncIterable, debounce(10), asArray);

    await advanceFakeTimeSlow(213);

    const actual = await actualPromise;

    expect(actual).toEqual([2, 3, 5]);
  });

  it('given empty iterable, when iterated, iteration is empty', async () => {
    const asyncIterable = (async function* () {})();

    const actual = await pipeline(asyncIterable, debounce(1), asArray);

    expect(actual).toEqual([]);
  });
});
