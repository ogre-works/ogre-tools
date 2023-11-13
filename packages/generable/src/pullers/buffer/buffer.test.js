import asArray from '../asArray/asArray';
import asAsync from '../../slackers/asAsync/asAsync';
import forEach from '../forEach/forEach';
import range from '../../sources/range/range';
import regulate from '../../slackers/regulate/regulate';
import take from '../../slackers/take/take';
import buffer from './buffer';
import { pipeline } from '@lensapp/fp';
import { advanceFakeTimeSlow } from '@lensapp/test-utils';

describe('buffer', () => {
  it('given finite sync iterable, when iterated, yields values and return from iterable', async () => {
    const finiteSyncIterable = ['some-first-value', 'some-second-value'];

    const bufferInstance = buffer(42, finiteSyncIterable);

    const iterator = bufferInstance[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 'some-first-value', done: false },
      { value: 'some-second-value', done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given infinite sync iterable, when iterated, yields values from iterable', async () => {
    const infiniteSyncIterable = range;

    const bufferInstance = buffer(42, infiniteSyncIterable);

    const iterator = bufferInstance[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 0, done: false },
      { value: 1, done: false },
      { value: 2, done: false },
    ]);
  });

  it('given finite async iterable to yield and return, when iterated, yields values and return from iterable', async () => {
    const asyncIterable = asAsync(['some-first-value', 'some-second-value']);

    const bufferInstance = buffer(42, asyncIterable);

    const iterator = bufferInstance[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 'some-first-value', done: false },
      { value: 'some-second-value', done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given infinite async iterable, when iterated, yields values from iterable', async () => {
    const infiniteAsyncIterable = asAsync(range);

    const bufferInstance = buffer(42, infiniteAsyncIterable);

    const iterator = bufferInstance[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 0, done: false },
      { value: 1, done: false },
      { value: 2, done: false },
    ]);
  });

  it('given a slow iterable and a long time to populate the buffer, when iterated for only a short time, iterates values for size of buffer plus one queued value', async () => {
    jest.useFakeTimers();

    const slowIterable = pipeline(range, regulate(10));
    const bufferedSlowIterable = pipeline(slowIterable, buffer(3));

    const longTime = 100;
    await advanceFakeTimeSlow(longTime);

    const func = jest.fn();
    pipeline(bufferedSlowIterable, forEach(func));

    const shortTime = 1;
    await advanceFakeTimeSlow(shortTime);

    expect(func.mock.calls).toEqual([[0], [1], [2], [3]]);
  });

  it('given buffer has exhausted its source iterable and is already partially iterated, when another iteration pass happens, iteration carries on from next iteration (like a stream)', async () => {
    const iterable = [1, 2, 3, false, undefined, null];

    const bufferedIterable = pipeline(iterable, buffer(1));

    const firstPass = await pipeline(bufferedIterable, take(2), asArray);
    expect(firstPass).toEqual([1, 2]);

    const secondPass = await pipeline(bufferedIterable, asArray);
    expect(secondPass).toEqual([3, false, undefined, null]);
  });

  it('given buffer has exhausted its source iterable and is already fully iterated once, when another iteration pass happens, iteration is empty', async () => {
    const iterable = [1, 2, 3, false, undefined, null];

    const bufferedIterable = pipeline(iterable, buffer(1));

    const firstPass = await pipeline(bufferedIterable, asArray);
    expect(firstPass).toEqual([1, 2, 3, false, undefined, null]);

    const secondPass = await pipeline(bufferedIterable, asArray);
    expect(secondPass).toEqual([]);
  });
});
