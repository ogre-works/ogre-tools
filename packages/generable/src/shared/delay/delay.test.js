import delay from './delay';
import { getPromiseStatus } from '@ogre-tools/test-utils';

describe('delay', () => {
  describe('given a delay in milliseconds and a return value', () => {
    let actualPromise;

    beforeEach(() => {
      jest.useFakeTimers();
      actualPromise = delay(1000)('some-return-value');
    });

    it('when time of delay almost passes, promise remains unfulfilled', async () => {
      jest.advanceTimersByTime(999);
      const { fulfilled } = await getPromiseStatus(actualPromise);

      expect(fulfilled).toBe(false);
    });

    it('when time of delay passes, promise resolves with return value', async () => {
      jest.advanceTimersByTime(1000);
      const actual = await actualPromise;

      expect(actual).toBe('some-return-value');
    });
  });
});
