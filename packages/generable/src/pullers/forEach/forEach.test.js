import forEach from './forEach';
import { pipeline } from '@ogre-tools/fp';
import delay from '../../shared/delay/delay';
import { advanceFakeTimeSlow } from '@ogre-tools/test-utils';

describe('forEach', () => {
  it('given sync forEach function and sync iterable, calls the function for each iterated value', () => {
    const func = jest.fn();

    const synchronousIterable = [1, 2, 3];

    pipeline(synchronousIterable, forEach(func));

    expect(func.mock.calls).toEqual([[1], [2], [3]]);
  });

  it('given sync forEach function and asynchronous iterable, calls the function for each iterated value', async () => {
    const func = jest.fn();

    const asynchronousIterable = (async function* () {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    await pipeline(asynchronousIterable, forEach(func));

    expect(func.mock.calls).toEqual([[1], [2], [3]]);
  });

  it('given async forEach function and asynchronous iterable, calls the function serially for each iterated value', async () => {
    jest.useFakeTimers();

    const func = jest.fn();
    const asyncForEachFunctionMock = async x => func(x);

    const asynchronousIterable = (async function* () {
      yield delay(1, 'some-first-value');
      yield delay(3, 'some-second-value');
      yield delay(2, 'some-third-value');
    })();

    pipeline(asynchronousIterable, forEach(asyncForEachFunctionMock));

    await advanceFakeTimeSlow(6);

    expect(func.mock.calls).toEqual([
      ['some-first-value'],
      ['some-second-value'],
      ['some-third-value'],
    ]);
  });
});
