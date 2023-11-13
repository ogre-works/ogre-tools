import forEach from '../../pullers/forEach/forEach';
import regulate from './regulate';
import { pipeline } from '@lensapp/fp';
import { flushPromises } from '@lensapp/test-utils';
import { advanceFakeTimeSlow } from '@lensapp/test-utils';

describe('regulate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('given regulation milliseconds and sync iterable, when iterated and no time passes, first value is still iterated', async () => {
    const mockFunction = jest.fn();

    const asyncIterable = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();

    pipeline(asyncIterable, regulate(10), forEach(mockFunction));

    await flushPromises();

    expect(mockFunction.mock.calls).toEqual([[1]]);
  });

  it('given regulation milliseconds and sync iterable, when iterated and time passes, iterations are regulated', async () => {
    const mockFunction = jest.fn();

    const asyncIterable = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();

    pipeline(asyncIterable, regulate(10), forEach(mockFunction));

    await advanceFakeTimeSlow(11);

    expect(mockFunction.mock.calls).toEqual([[1], [2]]);
  });

  it('given regulation milliseconds and async iterable, when iterated and time passes, iterations are regulated', async () => {
    const mockFunction = jest.fn();

    const syncIterable = (function* () {
      yield 1;
      yield 2;
      yield 3;
    })();

    pipeline(syncIterable, regulate(10), forEach(mockFunction));

    await advanceFakeTimeSlow(11);

    expect(mockFunction.mock.calls).toEqual([[1], [2]]);
  });
});
