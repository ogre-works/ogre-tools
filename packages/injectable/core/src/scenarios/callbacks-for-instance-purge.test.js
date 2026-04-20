import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { createContainer } from '../../index';
import { instancePurgeCallbackToken } from '../dependency-injection-container/tokens';

const asPurgeCallbackInjectable = (id, target, callback) =>
  getInjectable2({
    id,
    injectionToken: instancePurgeCallbackToken.for(target),
    instantiate: () => () => callback,
  });

describe('callbacks-for-instance-purge', () => {
  describe('injectable2 targets', () => {
    it('callback fires with { instance } on non-parametric singleton purge', () => {
      const di = createContainer('some-container');
      const outer = jest.fn();
      const inner = jest.fn();

      const someInjectable2 = getInjectable2({
        id: 'nonparametric',
        instantiate: () => () => ({ value: 'singleton' }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          someInjectable2,
          ({ instance }) => {
            outer(instance);
            return () => {
              inner();
              return instance;
            };
          },
        ),
        someInjectable2,
      );

      const instance = di.inject(someInjectable2);
      di.purge(someInjectable2);

      expect(outer).toHaveBeenCalledWith(instance);
      expect(inner).toHaveBeenCalledTimes(1);
    });

    it('curried callback receives factory params on inner arrow for parametric factory', () => {
      const di = createContainer('some-container');
      const innerArgs = jest.fn();

      const greetInjectable2 = getInjectable2({
        id: 'parametric',
        instantiate: () => (name, greeting) => `${greeting}, ${name}`,
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          greetInjectable2,
          ({ instance }) => (name, greeting) => {
            innerArgs(instance, name, greeting);
            return instance;
          },
        ),
        greetInjectable2,
      );

      di.inject(greetInjectable2, 'Alice', 'Hello');
      di.inject(greetInjectable2, 'Bob', 'Hi');

      di.purge(greetInjectable2);

      expect(innerArgs).toHaveBeenCalledTimes(2);
      expect(innerArgs).toHaveBeenCalledWith('Hello, Alice', 'Alice', 'Hello');
      expect(innerArgs).toHaveBeenCalledWith('Hi, Bob', 'Bob', 'Hi');
    });

    it('callback targeted at injection token2 fires for every implementation', () => {
      const di = createContainer('some-container');
      const innerArgs = jest.fn();

      const handlerToken2 = getInjectionToken2({ id: 'handler-token-2' });

      const implA = getInjectable2({
        id: 'impl-a',
        injectionToken: handlerToken2,
        instantiate: () => name => `a-${name}`,
      });

      const implB = getInjectable2({
        id: 'impl-b',
        injectionToken: handlerToken2,
        instantiate: () => name => `b-${name}`,
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          handlerToken2,
          ({ instance }) => name => {
            innerArgs(instance, name);
            return instance;
          },
        ),
        implA,
        implB,
      );

      di.inject(implA, 'x');
      di.inject(implB, 'y');

      di.purge();

      expect(innerArgs).toHaveBeenCalledTimes(2);
      expect(innerArgs).toHaveBeenCalledWith('a-x', 'x');
      expect(innerArgs).toHaveBeenCalledWith('b-y', 'y');
    });

    it('callback does NOT fire for evictions of a different injectable2', () => {
      const di = createContainer('some-container');
      const callbackMock = jest.fn();

      const targetInjectable = getInjectable2({
        id: 'target',
        instantiate: () => () => 'target-instance',
      });

      const otherInjectable = getInjectable2({
        id: 'other',
        instantiate: () => () => 'other-instance',
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          targetInjectable,
          () => () => callbackMock(),
        ),
        targetInjectable,
        otherInjectable,
      );

      di.inject(otherInjectable);
      di.purge(otherInjectable);

      expect(callbackMock).not.toHaveBeenCalled();
    });

    it('di.purge(injectable, key) fires only for the matched keyed entry', () => {
      const di = createContainer('some-container');
      const innerArgs = jest.fn();

      const keyedInjectable = getInjectable2({
        id: 'keyed-partial',
        instantiate: () => key => ({ key }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          keyedInjectable,
          ({ instance }) => key => {
            innerArgs(instance, key);
            return instance;
          },
        ),
        keyedInjectable,
      );

      const a = di.inject(keyedInjectable, 'a');
      di.inject(keyedInjectable, 'b');

      di.purge(keyedInjectable, 'a');

      expect(innerArgs).toHaveBeenCalledTimes(1);
      expect(innerArgs).toHaveBeenCalledWith(a, 'a');
    });

    it('di.deregister(injectable2) fires the purge callback', () => {
      const di = createContainer('some-container');
      const innerFire = jest.fn();

      const someInjectable2 = getInjectable2({
        id: 'deregistered',
        instantiate: () => () => ({ v: 1 }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          someInjectable2,
          ({ instance }) =>
            () => {
              innerFire(instance);
              return instance;
            },
        ),
        someInjectable2,
      );

      const instance = di.inject(someInjectable2);
      di.deregister(someInjectable2);

      expect(innerFire).toHaveBeenCalledTimes(1);
      expect(innerFire).toHaveBeenCalledWith(instance);
    });
  });

  describe('LRU eviction', () => {
    it('fires the purge callback when a set() exceeds maxCacheSize', () => {
      const di = createContainer('some-container');
      const callbackMock = jest.fn();

      const lruInjectable = getInjectable2({
        id: 'lru-injectable',
        maxCacheSize: 2,
        instantiate: () => key => ({ key }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          lruInjectable,
          ({ instance }) =>
            key => {
              callbackMock(instance, key);
              return instance;
            },
        ),
        lruInjectable,
      );

      const a = di.inject(lruInjectable, 'a');
      di.inject(lruInjectable, 'b');
      di.inject(lruInjectable, 'c'); // evicts 'a'

      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(callbackMock).toHaveBeenCalledWith(a, 'a');
    });
  });

  describe('three-phase timing (gather → fire → evict)', () => {
    it('during phase 2, peers about to be purged are still injectable', () => {
      const di = createContainer('some-container');

      const peerA = getInjectable2({
        id: 'peer-a',
        instantiate: () => () => ({ name: 'a' }),
      });

      const peerB = getInjectable2({
        id: 'peer-b',
        instantiate: () => () => ({ name: 'b' }),
      });

      let observedBFromACallback;
      let observedAFromBCallback;

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback-for-a',
          peerA,
          () => () => {
            observedBFromACallback = di.inject(peerB);
          },
        ),
        asPurgeCallbackInjectable(
          'purge-callback-for-b',
          peerB,
          () => () => {
            observedAFromBCallback = di.inject(peerA);
          },
        ),
        peerA,
        peerB,
      );

      const originalA = di.inject(peerA);
      const originalB = di.inject(peerB);

      di.purge();

      expect(observedBFromACallback).toBe(originalB);
      expect(observedAFromBCallback).toBe(originalA);
    });

    it('instances re-injected during phase 2 are still purged by phase 3', () => {
      const di = createContainer('some-container');
      const callbackMock = jest.fn();

      const someInjectable2 = getInjectable2({
        id: 're-injected',
        instantiate: () => () => ({ t: Date.now() + Math.random() }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          someInjectable2,
          () => () => {
            di.inject(someInjectable2);
            callbackMock();
          },
        ),
        someInjectable2,
      );

      const original = di.inject(someInjectable2);
      di.purge();

      const afterPurge = di.inject(someInjectable2);
      expect(afterPurge).not.toBe(original);

      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('throwing callback aborts the purge before phase 3', () => {
      const di = createContainer('some-container');
      const someInjectable2 = getInjectable2({
        id: 'will-throw',
        instantiate: () => () => ({ id: 1 }),
      });

      di.register(
        asPurgeCallbackInjectable(
          'purge-callback',
          someInjectable2,
          () => () => {
            throw new Error('nope');
          },
        ),
        someInjectable2,
      );

      const original = di.inject(someInjectable2);

      expect(() => di.purge()).toThrow('nope');

      expect(di.inject(someInjectable2)).toBe(original);
    });
  });

  describe('callback cache does not accumulate per-instance', () => {
    it('firing many purges across distinct keyed-singleton instances keeps the callback entry count at 1', () => {
      const di = createContainer('some-container');

      const keyedInjectable = getInjectable2({
        id: 'keyed',
        instantiate: () => key => ({ key }),
      });

      const callbackInjectable = asPurgeCallbackInjectable(
        'purge-callback',
        keyedInjectable,
        () => () => {},
      );

      di.register(callbackInjectable, keyedInjectable);

      for (let i = 0; i < 50; i++) {
        di.inject(keyedInjectable, `key-${i}`);
        di.purge(keyedInjectable);
      }

      // The callback is parameterless at the token level, so it caches ONCE
      // under the singleton key — not once per (instance, param) pair.
      const counts = di.getNumberOfInstances();
      expect(counts['purge-callback']).toBe(1);
    });
  });

  describe('abstract base token', () => {
    it('direct inject of the base token throws', () => {
      const di = createContainer('some-container');
      expect(() => di.inject(instancePurgeCallbackToken)).toThrow(
        /abstract/,
      );
    });

    it('direct injectMany of the base token throws', () => {
      const di = createContainer('some-container');
      expect(() => di.injectMany(instancePurgeCallbackToken)).toThrow(
        /abstract/,
      );
    });

    it('registering against the base token throws', () => {
      const di = createContainer('some-container');
      const bad = getInjectable({
        id: 'bad',
        instantiate: () => () => {},
        injectionToken: instancePurgeCallbackToken,
      });
      expect(() => di.register(bad)).toThrow(/abstract/);
    });
  });
});
