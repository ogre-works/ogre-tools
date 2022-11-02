import getPromiseStatus from './getPromiseStatus';

describe('getPromiseStatus', () => {
  it('given an unfulfilled promise, status is not fulfilled', async () => {
    const status = await getPromiseStatus(new Promise(() => {}));

    expect(status.fulfilled).toBe(false);
  });

  it('given an already resolved promise, status is fulfilled', async () => {
    const status = await getPromiseStatus(Promise.resolve());

    expect(status.fulfilled).toBe(true);
  });
});
