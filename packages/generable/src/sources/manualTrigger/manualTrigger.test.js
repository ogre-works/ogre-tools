import getPromiseStatus from '../../../test-utils/getPromiseStatus/getPromiseStatus';
import manualTrigger from './manualTrigger';

describe('manualTrigger', () => {
  it('given manually entered values to yield and return, when iterated, yields and returns the values', async () => {
    const manualTriggerInstance = manualTrigger();

    manualTriggerInstance.yield('some-first-value');
    manualTriggerInstance.yield('some-second-value');
    manualTriggerInstance.return('some-return-value');

    const iterator = manualTriggerInstance[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 'some-first-value', done: false },
      { value: 'some-second-value', done: false },
      { value: 'some-return-value', done: true },
    ]);
  });

  it('given no values to yield and return, when iterated, returns unfulfilled promise', async () => {
    const manualTriggerInstance = manualTrigger();
    const iterator = manualTriggerInstance[Symbol.asyncIterator]();
    const iterationPromise = iterator.next();

    const { fulfilled } = await getPromiseStatus(iterationPromise);

    expect(fulfilled).toBe(false);
  });
});
