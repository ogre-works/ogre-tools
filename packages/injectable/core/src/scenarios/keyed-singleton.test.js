import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getCompositeKey } from '../getCompositeKey/getCompositeKey';

describe('createContainer.keyed-singleton', () => {
  describe('given key from instantiation parameter', () => {
    let di;
    let injectable;

    beforeEach(() => {
      injectable = getInjectable({
        id: 'irrelevant',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, instantiationParameter) => instantiationParameter,
        }),
      });

      di = createContainer('some-container');

      di.register(injectable);
    });

    it('when injected multiple times with same key, injects same instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      const actual2 = di.inject(injectable, 'some-key');

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with same composite key, injects same instance', () => {
      const someReferenceKey1 = {};
      const someReferenceKey2 = {};

      const actual1 = di.inject(
        injectable,

        getCompositeKey(
          someReferenceKey1,
          'some-primitive-key',
          someReferenceKey2,
        ),
      );

      const actual2 = di.inject(
        injectable,

        getCompositeKey(
          someReferenceKey1,
          'some-primitive-key',
          someReferenceKey2,
        ),
      );

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with different key, injects different instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      const actual2 = di.inject(injectable, 'some-other-key');

      expect(actual1).not.toBe(actual2);
    });

    it('given injected multiple times with different key, when injected again with same key, injects same instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      di.inject(injectable, 'some-other-key');

      const actual2 = di.inject(injectable, 'some-key');

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with different length of composite key, injects different instances', () => {
      const actual1 = di.inject(
        injectable,
        getCompositeKey(
          'some-string',
          'some-other-string',
          'some-primitive-key',
        ),
      );

      const actual2 = di.inject(
        injectable,
        getCompositeKey('some-string', 'some-other-string'),
      );

      expect(actual1).not.toBe(actual2);
      expect(actual1).toEqual({});
      expect(actual2).toEqual({});
    });
  });

  it('given keyed singleton and keyed by another injected value, when injected multiple times with same resulting key, injects same instance', () => {
    const mainInjectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, instantiationParameter) =>
          di.inject(keyInjectable, instantiationParameter),
      }),
    });

    const keyInjectable = getInjectable({
      id: 'some-other-injectable-id',

      instantiate: (di, instantiationParameter) =>
        `some-injected-key: ${instantiationParameter}`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(mainInjectable, keyInjectable);

    const actual1 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    const actual2 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    expect(actual1).toBe(actual2);
  });

  it('given keyed singleton and keyed by another injected value, when injected multiple times with different resulting key, injects different instance', () => {
    const mainInjectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, instantiationParameter) =>
          di.inject(keyInjectable, instantiationParameter),
      }),
    });

    const keyInjectable = getInjectable({
      id: 'some-other-injectable-id',

      instantiate: (di, instantiationParameter) =>
        `some-injected-key: ${instantiationParameter}`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(mainInjectable, keyInjectable);

    const actual1 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    const actual2 = di.inject(
      mainInjectable,
      'some-other-instantiation-parameter-for-injected-key',
    );

    expect(actual1).not.toBe(actual2);
  });

  it('given multiple keyed singletons, when injected with same key, injects different instances', () => {
    const injectable1 = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (_, instantiationParameter) => instantiationParameter,
      }),
    });

    const injectable2 = getInjectable({
      id: 'some-other-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (_, instantiationParameter) => instantiationParameter,
      }),
    });

    const di = createContainer('some-container');

    di.register(injectable1, injectable2);

    const actual1 = di.inject(injectable1, 'some-instance-key');
    const actual2 = di.inject(injectable2, 'some-instance-key');

    expect(actual1).not.toBe(actual2);
  });

  describe('given maxCacheSize on injectable', () => {
    let di;
    let injectable;

    beforeEach(() => {
      injectable = getInjectable({
        id: 'lru-injectable',
        instantiate: () => ({}),
        maxCacheSize: 2,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, instantiationParameter) => instantiationParameter,
        }),
      });

      di = createContainer('some-container');
      di.register(injectable);
    });

    it('evicts LRU entry when cache exceeds maxCacheSize', () => {
      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c'); // should evict 'key-a'

      const aAgain = di.inject(injectable, 'key-a');

      expect(aAgain).not.toBe(a); // new instance, not cached
    });

    it('promotes entry on access so it is not evicted', () => {
      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');

      // Re-access 'key-a' to promote it
      di.inject(injectable, 'key-a');

      // Now 'key-b' is LRU, should be evicted
      di.inject(injectable, 'key-c');

      const aStill = di.inject(injectable, 'key-a');
      expect(aStill).toBe(a); // same instance, was promoted
    });

    it('getInstances returns only surviving entries', () => {
      di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c'); // evicts 'key-a'

      const instances = di.getInstances(injectable);
      expect(instances).toHaveLength(2);
    });

    it('purge clears all entries including LRU state', () => {
      di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');

      di.purge(injectable);

      const instances = di.getInstances(injectable);
      expect(instances).toHaveLength(0);
    });
  });

  describe('given maxCacheSize on injection token', () => {
    it('applies token maxCacheSize as default for implementing injectable', () => {
      const {
        getInjectionToken,
      } = require('../getInjectionToken/getInjectionToken');

      const token = getInjectionToken({
        id: 'lru-token',
        maxCacheSize: 2,
      });

      const injectable = getInjectable({
        id: 'lru-token-injectable',
        injectionToken: token,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const di = createContainer('some-container');
      di.register(injectable);

      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c'); // should evict 'key-a'

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });

    it('injectable maxCacheSize overrides token maxCacheSize', () => {
      const {
        getInjectionToken,
      } = require('../getInjectionToken/getInjectionToken');

      const token = getInjectionToken({
        id: 'lru-token-override',
        maxCacheSize: 10,
      });

      const injectable = getInjectable({
        id: 'lru-override-injectable',
        injectionToken: token,
        maxCacheSize: 2,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const di = createContainer('some-container');
      di.register(injectable);

      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c'); // should evict 'key-a' (maxCacheSize=2, not 10)

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });

    it('specific token inherits maxCacheSize from general token', () => {
      const {
        getInjectionToken,
      } = require('../getInjectionToken/getInjectionToken');

      const generalToken = getInjectionToken({
        id: 'lru-general-token',
        maxCacheSize: 2,
      });

      const specificToken = generalToken.for('specific');

      const injectable = getInjectable({
        id: 'lru-specific-injectable',
        injectionToken: specificToken,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const di = createContainer('some-container');
      di.register(injectable);

      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c'); // should evict 'key-a'

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });
  });

  describe('purge by key', () => {
    let di;
    let injectable;

    beforeEach(() => {
      injectable = getInjectable({
        id: 'purge-key-injectable',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, instantiationParameter) => instantiationParameter,
        }),
      });

      di = createContainer('some-container');
      di.register(injectable);
    });

    it('purges specific key, leaving other entries intact', () => {
      const a = di.inject(injectable, 'key-a');
      const b = di.inject(injectable, 'key-b');

      di.purge(injectable, 'key-a');

      const aAgain = di.inject(injectable, 'key-a');
      const bAgain = di.inject(injectable, 'key-b');

      expect(aAgain).not.toBe(a);
      expect(bAgain).toBe(b);
    });

    it('purging non-existent key does not affect existing entries', () => {
      const a = di.inject(injectable, 'key-a');

      di.purge(injectable, 'key-nonexistent');

      expect(di.inject(injectable, 'key-a')).toBe(a);
    });
  });

  describe('purge by composite key prefix', () => {
    let di;
    let injectable;

    beforeEach(() => {
      injectable = getInjectable({
        id: 'purge-composite-injectable',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, instantiationParameter) => instantiationParameter,
        }),
      });

      di = createContainer('some-container');
      di.register(injectable);
    });

    it('purges all entries matching composite key prefix', () => {
      const ab = di.inject(injectable, getCompositeKey('a', 'b'));
      const ac = di.inject(injectable, getCompositeKey('a', 'c'));
      const x = di.inject(injectable, getCompositeKey('x', 'y'));

      di.purge(injectable, 'a');

      const abAgain = di.inject(injectable, getCompositeKey('a', 'b'));
      const acAgain = di.inject(injectable, getCompositeKey('a', 'c'));
      const xAgain = di.inject(injectable, getCompositeKey('x', 'y'));

      expect(abAgain).not.toBe(ab);
      expect(acAgain).not.toBe(ac);
      expect(xAgain).toBe(x);
    });

    it('purges with multi-level prefix', () => {
      const abc = di.inject(injectable, getCompositeKey('a', 'b', 'c'));
      const abd = di.inject(injectable, getCompositeKey('a', 'b', 'd'));
      const ax = di.inject(injectable, getCompositeKey('a', 'x'));

      di.purge(injectable, 'a', 'b');

      const abcAgain = di.inject(injectable, getCompositeKey('a', 'b', 'c'));
      const abdAgain = di.inject(injectable, getCompositeKey('a', 'b', 'd'));
      const axAgain = di.inject(injectable, getCompositeKey('a', 'x'));

      expect(abcAgain).not.toBe(abc);
      expect(abdAgain).not.toBe(abd);
      expect(axAgain).toBe(ax);
    });
  });

  describe('purge by injection token', () => {
    it('purges all injectables implementing the token', () => {
      const {
        getInjectionToken,
      } = require('../getInjectionToken/getInjectionToken');

      const token = getInjectionToken({ id: 'purge-token' });

      const injectable1 = getInjectable({
        id: 'purge-token-impl-1',
        injectionToken: token,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const injectable2 = getInjectable({
        id: 'purge-token-impl-2',
        injectionToken: token,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const di = createContainer('some-container');
      di.register(injectable1, injectable2);

      const inst1 = di.inject(injectable1, 'key');
      const inst2 = di.inject(injectable2, 'key');

      di.purge(token);

      expect(di.inject(injectable1, 'key')).not.toBe(inst1);
      expect(di.inject(injectable2, 'key')).not.toBe(inst2);
    });

    it('purges by key across all injectables implementing the token', () => {
      const {
        getInjectionToken,
      } = require('../getInjectionToken/getInjectionToken');

      const token = getInjectionToken({ id: 'purge-token-key' });

      const injectable1 = getInjectable({
        id: 'purge-token-key-impl-1',
        injectionToken: token,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const injectable2 = getInjectable({
        id: 'purge-token-key-impl-2',
        injectionToken: token,
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const di = createContainer('some-container');
      di.register(injectable1, injectable2);

      const inst1a = di.inject(injectable1, 'a');
      const inst1b = di.inject(injectable1, 'b');
      const inst2a = di.inject(injectable2, 'a');
      const inst2b = di.inject(injectable2, 'b');

      di.purge(token, 'a');

      expect(di.inject(injectable1, 'a')).not.toBe(inst1a);
      expect(di.inject(injectable1, 'b')).toBe(inst1b);
      expect(di.inject(injectable2, 'a')).not.toBe(inst2a);
      expect(di.inject(injectable2, 'b')).toBe(inst2b);
    });
  });

  describe('scoped purge from within instantiate', () => {
    it('can purge a child injectable registered in its own context', () => {
      const di = createContainer('some-container');

      const childInjectable = getInjectable({
        id: 'child',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const parentInjectable = getInjectable({
        id: 'parent',
        instantiate: minimalDi => {
          minimalDi.register(childInjectable);

          return {
            getChild: key => minimalDi.inject(childInjectable, key),
            purgeChild: key => minimalDi.purge(childInjectable, key),
          };
        },

        lifecycle: lifecycleEnum.singleton,
      });

      di.register(parentInjectable);

      const parent = di.inject(parentInjectable);
      const child1 = parent.getChild('k');

      parent.purgeChild('k');

      const child2 = parent.getChild('k');
      expect(child2).not.toBe(child1);
    });

    it('throws when trying to purge an unrelated injectable outside its context tree', () => {
      const di = createContainer('some-container');

      const unrelatedInjectable = getInjectable({
        id: 'unrelated',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const parentInjectable = getInjectable({
        id: 'parent-scoped',
        instantiate: minimalDi => {
          minimalDi.purge(unrelatedInjectable);
          return 'done';
        },

        lifecycle: lifecycleEnum.singleton,
      });

      di.register(unrelatedInjectable, parentInjectable);

      expect(() => di.inject(parentInjectable)).toThrow(
        'not within its registration context tree',
      );
    });

    it('can purge itself', () => {
      const di = createContainer('some-container');
      let purgeSelf;

      const selfPurgingInjectable = getInjectable({
        id: 'self-purging',
        instantiate: minimalDi => {
          purgeSelf = () => minimalDi.purge(selfPurgingInjectable, 'k');
          return {};
        },

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      di.register(selfPurgingInjectable);

      const instance1 = di.inject(selfPurgingInjectable, 'k');
      purgeSelf();

      const instance2 = di.inject(selfPurgingInjectable, 'k');
      expect(instance2).not.toBe(instance1);
    });

    it('purge with no alias purges entire registration context branch', () => {
      const di = createContainer('some-container');

      const child1 = getInjectable({
        id: 'branch-child-1',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const child2 = getInjectable({
        id: 'branch-child-2',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      let purgeAll;

      const parentInjectable = getInjectable({
        id: 'branch-parent',
        instantiate: minimalDi => {
          minimalDi.register(child1, child2);
          purgeAll = () => minimalDi.purge();
          return {};
        },

        lifecycle: lifecycleEnum.singleton,
      });

      di.register(parentInjectable);
      di.inject(parentInjectable);

      const c1 = di.inject(child1, 'a');
      const c2 = di.inject(child2, 'b');

      purgeAll();

      expect(di.inject(child1, 'a')).not.toBe(c1);
      expect(di.inject(child2, 'b')).not.toBe(c2);
    });

    it('purge with no alias does not affect injectables outside the branch', () => {
      const di = createContainer('some-container');

      const outsideInjectable = getInjectable({
        id: 'outside',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      const child = getInjectable({
        id: 'inside-child',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, param) => param,
        }),
      });

      let purgeAll;

      const parentInjectable = getInjectable({
        id: 'inside-parent',
        instantiate: minimalDi => {
          minimalDi.register(child);
          purgeAll = () => minimalDi.purge();
          return {};
        },

        lifecycle: lifecycleEnum.singleton,
      });

      di.register(outsideInjectable, parentInjectable);
      di.inject(parentInjectable);

      const outside = di.inject(outsideInjectable, 'x');
      di.inject(child, 'y');

      purgeAll();

      expect(di.inject(outsideInjectable, 'x')).toBe(outside);
    });
  });
});
