import advanceFakeTime from '../../../test-utils/advanceFakeTime/advanceFakeTime';
import flushPromises from '../../../test-utils/flushPromises';
import pipeline from '../../../doings/pipeline/pipeline';
import forEach from '../../pullers/forEach/forEach';
import regulate from './regulate';

describe('regulate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('given regulation milliseconds and sync iterable, when iterated and no time passes, first value is still iterated', async () => {
    const mockFunction = jest.fn();

    const asyncIterable = (async function*() {
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

    const asyncIterable = (async function*() {
      yield 1;
      yield 2;
      yield 3;
    })();

    pipeline(asyncIterable, regulate(10), forEach(mockFunction));

    await advanceFakeTime(11);

    expect(mockFunction.mock.calls).toEqual([[1], [2]]);
  });

  it('given regulation milliseconds and async iterable, when iterated and time passes, iterations are regulated', async () => {
    const mockFunction = jest.fn();

    const syncIterable = (function*() {
      yield 1;
      yield 2;
      yield 3;
    })();

    pipeline(syncIterable, regulate(10), forEach(mockFunction));

    await advanceFakeTime(11);

    expect(mockFunction.mock.calls).toEqual([[1], [2]]);
  });
});