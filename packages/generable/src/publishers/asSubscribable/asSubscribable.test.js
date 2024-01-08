import take from '../../slackers/take/take';
import asSubscribable from './asSubscribable';
import forEach from '../../pullers/forEach/forEach';
import { flow, pipeline } from '@lensapp/fp';
import { flushPromises } from '@lensapp/ogre-test-utils';

describe('asSubscribable', () => {
  it('given iterable, when subscribed, the subscriber can iterate the iterable', async () => {
    const iterable = [1, 2, 3];
    const actualSubscribable = pipeline(iterable, asSubscribable);
    const firstFunc = jest.fn();
    const firstSubscriber = forEach(firstFunc);

    actualSubscribable.subscribe(firstSubscriber);
    await flushPromises();

    expect(firstFunc.mock.calls).toEqual([[1], [2], [3]]);
  });

  it('given iterable, when not subscribed, the iterable is not iterated', async () => {
    const func = jest.fn();

    const iterable = (function* () {
      func();
      yield;
    })();

    pipeline(iterable, asSubscribable);

    await flushPromises();

    expect(func).not.toHaveBeenCalled();
  });

  it('given subscribed and partially iterated already, when a second subscriber joins in late, the second subscriber starts iterating from the current (not next) iteration)', async () => {
    const iterable = [1, 2, 3];
    const actualSubscribable = pipeline(iterable, asSubscribable);

    const firstFunc = () => {};
    const firstSubscriber = flow(take(2), forEach(firstFunc));

    actualSubscribable.subscribe(firstSubscriber);
    await flushPromises();

    const secondFunc = jest.fn();
    const secondSubscriber = forEach(secondFunc);
    actualSubscribable.subscribe(secondSubscriber);
    await flushPromises();

    expect(secondFunc.mock.calls).toEqual([[2], [3]]);
  });

  it('given subscribed and fully iterated already, when a second subscriber joins in late, the second subscriber gets no iterations', async () => {
    const iterable = [1, 2, 3];
    const actualSubscribable = pipeline(iterable, asSubscribable);

    const firstFunc = () => {};
    const firstSubscriber = forEach(firstFunc);
    actualSubscribable.subscribe(firstSubscriber);
    await flushPromises();

    const secondFunc = jest.fn();
    const secondSubscriber = forEach(secondFunc);
    actualSubscribable.subscribe(secondSubscriber);
    await flushPromises();

    expect(secondFunc).not.toHaveBeenCalled();
  });
});
