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
    describe('given a non-parametric singleton with a purge callback, when purged', () => {
      let outer;
      let inner;
      let instance;

      beforeEach(() => {
        const di = createContainer('some-container');
        outer = jest.fn();
        inner = jest.fn();

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

        instance = di.inject(someInjectable2);
        di.purge(someInjectable2);
      });

      it('the outer callback is called with the instance', () => {
        expect(outer).toHaveBeenCalledWith(instance);
      });

      it('the inner callback is called once', () => {
        expect(inner).toHaveBeenCalledTimes(1);
      });
    });

    describe('given a parametric factory with a purge callback and two cached entries, when purged', () => {
      let innerArgs;

      beforeEach(() => {
        const di = createContainer('some-container');
        innerArgs = jest.fn();

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
      });

      it('the inner callback is called once per cached entry', () => {
        expect(innerArgs).toHaveBeenCalledTimes(2);
      });

      it('the inner callback receives the instance and factory params for the first entry', () => {
        expect(innerArgs).toHaveBeenCalledWith(
          'Hello, Alice',
          'Alice',
          'Hello',
        );
      });

      it('the inner callback receives the instance and factory params for the second entry', () => {
        expect(innerArgs).toHaveBeenCalledWith('Hi, Bob', 'Bob', 'Hi');
      });
    });

    describe('given a purge callback targeted at an injection token with two implementations, when purged', () => {
      let innerArgs;

      beforeEach(() => {
        const di = createContainer('some-container');
        innerArgs = jest.fn();

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
      });

      it('the inner callback is called once per implementation', () => {
        expect(innerArgs).toHaveBeenCalledTimes(2);
      });

      it('the inner callback receives the instance and params for the first implementation', () => {
        expect(innerArgs).toHaveBeenCalledWith('a-x', 'x');
      });

      it('the inner callback receives the instance and params for the second implementation', () => {
        expect(innerArgs).toHaveBeenCalledWith('b-y', 'y');
      });
    });

    describe('given a purge callback targeting one injectable and a different injectable is purged', () => {
      let callbackMock;

      beforeEach(() => {
        const di = createContainer('some-container');
        callbackMock = jest.fn();

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
      });

      it('the callback is not called', () => {
        expect(callbackMock).not.toHaveBeenCalled();
      });
    });

    describe('given a keyed injectable with two cached entries, when purged with a specific key', () => {
      let innerArgs;
      let a;

      beforeEach(() => {
        const di = createContainer('some-container');
        innerArgs = jest.fn();

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

        a = di.inject(keyedInjectable, 'a');
        di.inject(keyedInjectable, 'b');

        di.purge(keyedInjectable, 'a');
      });

      it('the callback fires only once', () => {
        expect(innerArgs).toHaveBeenCalledTimes(1);
      });

      it('the callback receives the matched keyed instance and key', () => {
        expect(innerArgs).toHaveBeenCalledWith(a, 'a');
      });
    });

    describe('given an injectable2 with a purge callback, when deregistered', () => {
      let innerFire;
      let instance;

      beforeEach(() => {
        const di = createContainer('some-container');
        innerFire = jest.fn();

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

        instance = di.inject(someInjectable2);
        di.deregister(someInjectable2);
      });

      it('the purge callback fires once', () => {
        expect(innerFire).toHaveBeenCalledTimes(1);
      });

      it('the purge callback receives the instance', () => {
        expect(innerFire).toHaveBeenCalledWith(instance);
      });
    });
  });

  describe('LRU eviction', () => {
    describe('given an injectable with maxCacheSize of 2 and three injected keys', () => {
      let callbackMock;
      let a;

      beforeEach(() => {
        const di = createContainer('some-container');
        callbackMock = jest.fn();

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

        a = di.inject(lruInjectable, 'a');
        di.inject(lruInjectable, 'b');
        di.inject(lruInjectable, 'c'); // evicts 'a'
      });

      it('the purge callback fires once for the evicted entry', () => {
        expect(callbackMock).toHaveBeenCalledTimes(1);
      });

      it('the purge callback receives the evicted instance and key', () => {
        expect(callbackMock).toHaveBeenCalledWith(a, 'a');
      });
    });
  });

  describe('three-phase timing (gather, fire, evict)', () => {
    describe('given two peers with purge callbacks that cross-inject, when purged', () => {
      let observedBFromACallback;
      let observedAFromBCallback;
      let originalA;
      let originalB;

      beforeEach(() => {
        const di = createContainer('some-container');

        const peerA = getInjectable2({
          id: 'peer-a',
          instantiate: () => () => ({ name: 'a' }),
        });

        const peerB = getInjectable2({
          id: 'peer-b',
          instantiate: () => () => ({ name: 'b' }),
        });

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

        originalA = di.inject(peerA);
        originalB = di.inject(peerB);

        di.purge();
      });

      it('peer A callback still observes the original peer B instance', () => {
        expect(observedBFromACallback).toBe(originalB);
      });

      it('peer B callback still observes the original peer A instance', () => {
        expect(observedAFromBCallback).toBe(originalA);
      });
    });

    describe('given a purge callback that re-injects its own injectable, when purged', () => {
      let di;
      let someInjectable2;
      let callbackMock;
      let original;

      beforeEach(() => {
        di = createContainer('some-container');
        callbackMock = jest.fn();

        someInjectable2 = getInjectable2({
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

        original = di.inject(someInjectable2);
        di.purge();
      });

      it('a fresh instance is produced after the purge', () => {
        const afterPurge = di.inject(someInjectable2);
        expect(afterPurge).not.toBe(original);
      });

      it('the callback fires exactly once', () => {
        expect(callbackMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('given a purge callback that throws, when purged', () => {
      let di;
      let someInjectable2;
      let original;

      beforeEach(() => {
        di = createContainer('some-container');

        someInjectable2 = getInjectable2({
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

        original = di.inject(someInjectable2);
      });

      it('the purge throws the callback error', () => {
        expect(() => di.purge()).toThrow('nope');
      });

      it('the cached instance is preserved', () => {
        try {
          di.purge();
        } catch {
          // expected
        }

        expect(di.inject(someInjectable2)).toBe(original);
      });
    });
  });

  describe('callback cache', () => {
    describe('given a keyed injectable purged 50 times with distinct keys', () => {
      let di;

      beforeEach(() => {
        di = createContainer('some-container');

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
      });

      it('the callback instance count remains at 1', () => {
        const counts = di.getNumberOfInstances();
        expect(counts['purge-callback']).toBe(1);
      });
    });
  });

  describe('abstract base token', () => {
    describe('when injecting the base token directly', () => {
      it('throws an abstract error', () => {
        const di = createContainer('some-container');
        expect(() => di.inject(instancePurgeCallbackToken)).toThrow(
          /abstract/,
        );
      });
    });

    describe('when calling injectMany on the base token directly', () => {
      it('throws an abstract error', () => {
        const di = createContainer('some-container');
        expect(() => di.injectMany(instancePurgeCallbackToken)).toThrow(
          /abstract/,
        );
      });
    });

    describe('when registering an injectable against the base token', () => {
      it('throws an abstract error', () => {
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
});
