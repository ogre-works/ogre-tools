import flushPromises from './flushPromises';
import util from 'util';

describe('flushPromises', () => {
  it('given a pending promise, when promises are flushed, the promise becomes resolved', async () => {
    const promise = new Promise(resolve =>
      setImmediate(() => resolve('some-value')),
    );

    await flushPromises();

    const promiseIsPending = util.inspect(promise).includes('pending');

    expect(promiseIsPending).toBe(false);
  });
});
