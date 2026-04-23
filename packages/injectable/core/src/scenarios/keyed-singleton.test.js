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

    it('when cache exceeds maxCacheSize, the oldest entry is evicted', () => {
      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c');

      const aAgain = di.inject(injectable, 'key-a');

      expect(aAgain).not.toBe(a);
    });

    it('when an entry is re-accessed before eviction, it survives', () => {
      const a = di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');

      di.inject(injectable, 'key-a');

      di.inject(injectable, 'key-c');

      const aStill = di.inject(injectable, 'key-a');
      expect(aStill).toBe(a);
    });

    it('getNumberOfInstances returns count of surviving entries only', () => {
      di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');
      di.inject(injectable, 'key-c');

      expect(di.getNumberOfInstances()).toEqual({
        'lru-injectable': 2,
      });
    });

    it('when purged, getNumberOfInstances returns empty', () => {
      di.inject(injectable, 'key-a');
      di.inject(injectable, 'key-b');

      di.purge(injectable);

      expect(di.getNumberOfInstances()).toEqual({});
    });
  });

  describe('given maxCacheSize on injection token', () => {
    it('given token with maxCacheSize, when cache exceeds size, the oldest entry is evicted', () => {
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
      di.inject(injectable, 'key-c');

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });

    it('given injectable maxCacheSize overriding token maxCacheSize, when cache exceeds injectable size, the oldest entry is evicted', () => {
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
      di.inject(injectable, 'key-c');

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });

    it('given specific token inheriting maxCacheSize from general token, when cache exceeds size, the oldest entry is evicted', () => {
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
      di.inject(injectable, 'key-c');

      const aAgain = di.inject(injectable, 'key-a');
      expect(aAgain).not.toBe(a);
    });
  });

  describe('given purge by key', () => {
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

    describe('given two entries injected, when purging by a specific key', () => {
      let a;
      let b;

      beforeEach(() => {
        a = di.inject(injectable, 'key-a');
        b = di.inject(injectable, 'key-b');

        di.purge(injectable, 'key-a');
      });

      it('the purged key yields a new instance', () => {
        expect(di.inject(injectable, 'key-a')).not.toBe(a);
      });

      it('the non-purged key yields the same instance', () => {
        expect(di.inject(injectable, 'key-b')).toBe(b);
      });
    });

    it('when purging a non-existent key, existing entries are not affected', () => {
      const a = di.inject(injectable, 'key-a');

      di.purge(injectable, 'key-nonexistent');

      expect(di.inject(injectable, 'key-a')).toBe(a);
    });
  });

  describe('given purge by composite key prefix', () => {
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

    describe('given entries with composite keys, when purging by single-level prefix', () => {
      let ab;
      let ac;
      let x;

      beforeEach(() => {
        ab = di.inject(injectable, getCompositeKey('a', 'b'));
        ac = di.inject(injectable, getCompositeKey('a', 'c'));
        x = di.inject(injectable, getCompositeKey('x', 'y'));

        di.purge(injectable, 'a');
      });

      it('the first matching entry yields a new instance', () => {
        expect(di.inject(injectable, getCompositeKey('a', 'b'))).not.toBe(ab);
      });

      it('the second matching entry yields a new instance', () => {
        expect(di.inject(injectable, getCompositeKey('a', 'c'))).not.toBe(ac);
      });

      it('the non-matching entry yields the same instance', () => {
        expect(di.inject(injectable, getCompositeKey('x', 'y'))).toBe(x);
      });
    });

    describe('given entries with composite keys, when purging by multi-level prefix', () => {
      let abc;
      let abd;
      let ax;

      beforeEach(() => {
        abc = di.inject(injectable, getCompositeKey('a', 'b', 'c'));
        abd = di.inject(injectable, getCompositeKey('a', 'b', 'd'));
        ax = di.inject(injectable, getCompositeKey('a', 'x'));

        di.purge(injectable, 'a', 'b');
      });

      it('the first matching entry yields a new instance', () => {
        expect(di.inject(injectable, getCompositeKey('a', 'b', 'c'))).not.toBe(
          abc,
        );
      });

      it('the second matching entry yields a new instance', () => {
        expect(di.inject(injectable, getCompositeKey('a', 'b', 'd'))).not.toBe(
          abd,
        );
      });

      it('the non-matching entry yields the same instance', () => {
        expect(di.inject(injectable, getCompositeKey('a', 'x'))).toBe(ax);
      });
    });
  });

  describe('given purge by injection token', () => {
    describe('given two injectables implementing a token, when purging by token', () => {
      let di;
      let injectable1;
      let injectable2;
      let inst1;
      let inst2;

      beforeEach(() => {
        const {
          getInjectionToken,
        } = require('../getInjectionToken/getInjectionToken');

        const token = getInjectionToken({ id: 'purge-token' });

        injectable1 = getInjectable({
          id: 'purge-token-impl-1',
          injectionToken: token,
          instantiate: () => ({}),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (_, param) => param,
          }),
        });

        injectable2 = getInjectable({
          id: 'purge-token-impl-2',
          injectionToken: token,
          instantiate: () => ({}),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (_, param) => param,
          }),
        });

        di = createContainer('some-container');
        di.register(injectable1, injectable2);

        inst1 = di.inject(injectable1, 'key');
        inst2 = di.inject(injectable2, 'key');

        di.purge(token);
      });

      it('the first injectable yields a new instance', () => {
        expect(di.inject(injectable1, 'key')).not.toBe(inst1);
      });

      it('the second injectable yields a new instance', () => {
        expect(di.inject(injectable2, 'key')).not.toBe(inst2);
      });
    });

    describe('given two injectables with two keys each, when purging by token and specific key', () => {
      let di;
      let injectable1;
      let injectable2;
      let inst1a;
      let inst1b;
      let inst2a;
      let inst2b;

      beforeEach(() => {
        const {
          getInjectionToken,
        } = require('../getInjectionToken/getInjectionToken');

        const token = getInjectionToken({ id: 'purge-token-key' });

        injectable1 = getInjectable({
          id: 'purge-token-key-impl-1',
          injectionToken: token,
          instantiate: () => ({}),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (_, param) => param,
          }),
        });

        injectable2 = getInjectable({
          id: 'purge-token-key-impl-2',
          injectionToken: token,
          instantiate: () => ({}),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (_, param) => param,
          }),
        });

        di = createContainer('some-container');
        di.register(injectable1, injectable2);

        inst1a = di.inject(injectable1, 'a');
        inst1b = di.inject(injectable1, 'b');
        inst2a = di.inject(injectable2, 'a');
        inst2b = di.inject(injectable2, 'b');

        di.purge(token, 'a');
      });

      it('the first injectable purged key yields a new instance', () => {
        expect(di.inject(injectable1, 'a')).not.toBe(inst1a);
      });

      it('the first injectable non-purged key yields the same instance', () => {
        expect(di.inject(injectable1, 'b')).toBe(inst1b);
      });

      it('the second injectable purged key yields a new instance', () => {
        expect(di.inject(injectable2, 'a')).not.toBe(inst2a);
      });

      it('the second injectable non-purged key yields the same instance', () => {
        expect(di.inject(injectable2, 'b')).toBe(inst2b);
      });
    });
  });

  describe('scoped purge from within instantiate', () => {
    it('given a child injectable registered in scope, when purging it by key, yields a new instance on next inject', () => {
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

    it('when trying to purge an unrelated injectable outside its context tree, throws', () => {
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

    it('when purging itself by key, yields a new instance on next inject', () => {
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

    describe('given children registered in scope, when purging with no alias', () => {
      let di;
      let child1;
      let child2;
      let c1;
      let c2;

      beforeEach(() => {
        di = createContainer('some-container');

        child1 = getInjectable({
          id: 'branch-child-1',
          instantiate: () => ({}),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (_, param) => param,
          }),
        });

        child2 = getInjectable({
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

        c1 = di.inject(child1, 'a');
        c2 = di.inject(child2, 'b');

        purgeAll();
      });

      it('the first child yields a new instance', () => {
        expect(di.inject(child1, 'a')).not.toBe(c1);
      });

      it('the second child yields a new instance', () => {
        expect(di.inject(child2, 'b')).not.toBe(c2);
      });
    });

    it('given injectables outside the branch, when purging with no alias, the outside injectable yields the same instance', () => {
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
