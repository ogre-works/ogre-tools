import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('getInjectable2', () => {
  let di;

  beforeEach(() => {
    di = createContainer('test-container');
  });

  describe('given a non-parametric injectable2 is registered', () => {
    let fooInjectable;

    beforeEach(() => {
      fooInjectable = getInjectable2({
        id: 'foo',
        instantiate: () => () => ({}),
      });

      di.register(fooInjectable);
    });

    it('when injected, returns the instance produced by the factory', () => {
      const result = di.inject(fooInjectable);

      expect(result).toEqual({});
    });

    it('when injected twice, returns the same instance', () => {
      const result1 = di.inject(fooInjectable);
      const result2 = di.inject(fooInjectable);

      expect(result1).toBe(result2);
    });
  });

  describe('given a parametric keyed-singleton injectable2 is registered', () => {
    let objInjectable;

    beforeEach(() => {
      objInjectable = getInjectable2({
        id: 'obj',
        instantiate: () => key => ({ key }),
      });

      di.register(objInjectable);
    });

    it('when injected with params, returns an instance reflecting those params', () => {
      const greetInjectable = getInjectable2({
        id: 'greet',
        instantiate: () => (name, greeting) => `${greeting}, ${name}!`,
      });

      di.register(greetInjectable);

      const result = di.inject(greetInjectable, 'Alice', 'Hello');

      expect(result).toBe('Hello, Alice!');
    });

    describe('given injected twice with the same key and once with a different key', () => {
      let result1;
      let result2;
      let result3;

      beforeEach(() => {
        result1 = di.inject(objInjectable, 'a');
        result2 = di.inject(objInjectable, 'a');
        result3 = di.inject(objInjectable, 'b');
      });

      it('when comparing same-key injections, returns the same instance', () => {
        expect(result1).toBe(result2);
      });

      it('when comparing different-key injections, returns different instances', () => {
        expect(result1).not.toBe(result3);
      });
    });
  });

  describe('given a transient injectable2 is registered', () => {
    let requestInjectable;

    beforeEach(() => {
      requestInjectable = getInjectable2({
        id: 'request',
        instantiate: () => () => ({}),
        transient: true,
      });

      di.register(requestInjectable);
    });

    it('when injected twice, returns different instances', () => {
      const result1 = di.inject(requestInjectable);
      const result2 = di.inject(requestInjectable);

      expect(result1).not.toBe(result2);
    });
  });

  describe('given factory-returning inject2 is used inside new-style instantiate', () => {
    it('when old-style dep is injected via inject2, returns its value through the factory', () => {
      const oldDep = getInjectable({
        id: 'old-dep',
        instantiate: () => 'old-value',
      });

      const newService = getInjectable2({
        id: 'new-service',
        instantiate: di => {
          const getOld = di.inject2(oldDep);

          return () => `using-${getOld()}`;
        },
      });

      di.register(oldDep, newService);

      const result = di.inject(newService);

      expect(result).toBe('using-old-value');
    });

    it('when new-style dep is injected via inject2, returns its value through the factory', () => {
      const dep = getInjectable2({
        id: 'dep',
        instantiate: () => name => `hello-${name}`,
      });

      const service = getInjectable2({
        id: 'service',
        instantiate: di => {
          const getDep = di.inject2(dep);

          return () => getDep('world');
        },
      });

      di.register(dep, service);

      const result = di.inject(service);

      expect(result).toBe('hello-world');
    });

    it('when injectMany2 is used for a token, returns joined instances through the factory', () => {
      const token = getInjectionToken({ id: 'handler' });

      const handler1 = getInjectable({
        id: 'handler-1',
        injectionToken: token,
        instantiate: () => 'h1',
      });

      const handler2 = getInjectable({
        id: 'handler-2',
        injectionToken: token,
        instantiate: () => 'h2',
      });

      const service = getInjectable2({
        id: 'service',
        instantiate: di => {
          const getHandlers = di.injectMany2(token);

          return () => getHandlers().join(',');
        },
      });

      di.register(handler1, handler2, service);

      const result = di.inject(service);

      expect(result).toBe('h1,h2');
    });
  });

  describe('given an injectionToken2 with one implementation registered', () => {
    let token;

    beforeEach(() => {
      token = getInjectionToken2({ id: 'service' });

      const impl = getInjectable2({
        id: 'impl',
        injectionToken: token,
        instantiate: () => () => 'impl-value',
      });

      di.register(impl);
    });

    it('when injected via token, returns the instance', () => {
      const instance = di.inject(token);

      expect(instance).toBe('impl-value');
    });

    it('when injectMany is called via token, returns an array of instances', () => {
      const instances = di.injectMany(token);

      expect(instances).toEqual(['impl-value']);
    });
  });

  describe('given old and new style injectables coexist in the same container', () => {
    it('when an old-style injectable is injected, returns its value as before', () => {
      const oldInjectable = getInjectable({
        id: 'old',
        instantiate: (di, param) => `old-${param}`,
        lifecycle: lifecycleEnum.transient,
      });

      di.register(oldInjectable);

      expect(di.inject(oldInjectable, 'test')).toBe('old-test');
    });

    it('when a new-style injectable depends on an old-style one, returns the combined value', () => {
      const oldDep = getInjectable({
        id: 'old-dep',
        instantiate: () => 'from-old',
      });

      const newInjectable = getInjectable2({
        id: 'new',
        instantiate: di => {
          const getOld = di.inject2(oldDep);
          return () => `new-with-${getOld()}`;
        },
      });

      di.register(oldDep, newInjectable);

      expect(di.inject(newInjectable)).toBe('new-with-from-old');
    });
  });

  describe('given an injectable2 whose instance is a function', () => {
    it('when injected, returns the function as the instance', () => {
      const doublerInjectable = getInjectable2({
        id: 'doubler',
        instantiate: () => () => x => x * 2,
      });

      di.register(doublerInjectable);

      const doubler = di.inject(doublerInjectable);

      expect(doubler(5)).toBe(10);
    });
  });

  describe('given injectWithMeta is used', () => {
    it('when a non-parametric injectable2 is injected, returns instance with meta', () => {
      const fooInjectable = getInjectable2({
        id: 'foo-with-meta',
        instantiate: () => () => 42,
      });

      di.register(fooInjectable);

      const result = di.injectWithMeta(fooInjectable);

      expect(result).toEqual({
        instance: 42,
        meta: { id: 'foo-with-meta' },
      });
    });

    it('when a parametric injectable2 is injected, returns instance with meta', () => {
      const greetInjectable = getInjectable2({
        id: 'greet-with-meta',
        instantiate: () => name => `hello-${name}`,
      });

      di.register(greetInjectable);

      const result = di.injectWithMeta(greetInjectable, 'world');

      expect(result).toEqual({
        instance: 'hello-world',
        meta: { id: 'greet-with-meta' },
      });
    });
  });

  describe('given injectManyWithMeta is used', () => {
    it('when a token2 with implementations is injected, returns instances with meta', () => {
      const token = getInjectionToken2({ id: 'meta-token' });

      const impl1 = getInjectable2({
        id: 'meta-impl-1',
        injectionToken: token,
        instantiate: () => () => 'a',
      });

      const impl2 = getInjectable2({
        id: 'meta-impl-2',
        injectionToken: token,
        instantiate: () => () => 'b',
      });

      di.register(impl1, impl2);

      const result = di.injectManyWithMeta(token);

      expect(result).toEqual([
        { instance: 'a', meta: { id: 'meta-impl-1' } },
        { instance: 'b', meta: { id: 'meta-impl-2' } },
      ]);
    });

    it('when a parametric token2 is injected with a key, returns instances with meta', () => {
      const token = getInjectionToken2({ id: 'param-meta-token' });

      const impl = getInjectable2({
        id: 'param-meta-impl',
        injectionToken: token,
        instantiate: () => key => `value-${key}`,
      });

      di.register(impl);

      const result = di.injectManyWithMeta(token, 'x');

      expect(result).toEqual([
        { instance: 'value-x', meta: { id: 'param-meta-impl' } },
      ]);
    });
  });

  describe('given override is used', () => {
    it('when override2 is called with a curried stub, returns the overridden value', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-foo',
        instantiate: () => () => 'original',
      });

      di.register(fooInjectable);

      di.override2(fooInjectable, () => () => 'overridden');

      expect(di.inject(fooInjectable)).toBe('overridden');
    });

    it('when override2 is called with a parametric curried stub, returns the overridden value with params', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-param',
        instantiate: () => name => `original-${name}`,
      });

      di.register(fooInjectable);

      di.override2(fooInjectable, () => name => `overridden-${name}`);

      expect(di.inject(fooInjectable, 'test')).toBe('overridden-test');
    });

    it('when override is called with a v1-shape stub, returns the overridden value', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-foo-v1-shape',
        instantiate: () => () => 'original',
      });

      di.register(fooInjectable);

      di.override(fooInjectable, () => 'overridden');

      expect(di.inject(fooInjectable)).toBe('overridden');
    });

    it('when override is called with a parametric v1-shape stub, returns the overridden value with params', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-param-v1-shape',
        instantiate: () => name => `original-${name}`,
      });

      di.register(fooInjectable);

      di.override(fooInjectable, (di, name) => `overridden-${name}`);

      expect(di.inject(fooInjectable, 'test')).toBe('overridden-test');
    });
  });

  describe('given maxCacheSize (LRU) is configured', () => {
    describe('given a parametric injectable2 with maxCacheSize 2 is registered', () => {
      let objInjectable;

      beforeEach(() => {
        objInjectable = getInjectable2({
          id: 'lru-obj',
          maxCacheSize: 2,
          instantiate: () => key => ({ key }),
        });

        di.register(objInjectable);
      });

      describe('given keys a, b, and c are injected in order', () => {
        let a;

        beforeEach(() => {
          a = di.inject(objInjectable, 'a');
          di.inject(objInjectable, 'b');
          di.inject(objInjectable, 'c');
        });

        it('when key a is injected again, returns a new instance because a was evicted', () => {
          const aAgain = di.inject(objInjectable, 'a');

          expect(aAgain).not.toBe(a);
        });

        it('when key a is injected again, returns an instance with the correct value', () => {
          const aAgain = di.inject(objInjectable, 'a');

          expect(aAgain).toEqual({ key: 'a' });
        });
      });

      describe('given keys a and b are injected, then a is re-accessed, then c is injected', () => {
        let a;

        beforeEach(() => {
          a = di.inject(objInjectable, 'a');
          di.inject(objInjectable, 'b');
          di.inject(objInjectable, 'a');
          di.inject(objInjectable, 'c');
        });

        it('when key a is injected again, returns the same instance because a was promoted', () => {
          expect(di.inject(objInjectable, 'a')).toBe(a);
        });
      });
    });

    describe('given a token2 with maxCacheSize 2 and an implementing injectable2', () => {
      let impl;

      beforeEach(() => {
        const token = getInjectionToken2({
          id: 'lru-token2',
          maxCacheSize: 2,
        });

        impl = getInjectable2({
          id: 'lru-token2-impl',
          injectionToken: token,
          instantiate: () => key => ({ key }),
        });

        di.register(impl);
      });

      it('when cache exceeds maxCacheSize, evicts the LRU entry', () => {
        const a = di.inject(impl, 'a');
        di.inject(impl, 'b');
        di.inject(impl, 'c');

        const aAgain = di.inject(impl, 'a');

        expect(aAgain).not.toBe(a);
      });
    });

    describe('given a token2 with maxCacheSize 10 and an implementing injectable2 with maxCacheSize 2', () => {
      let impl;

      beforeEach(() => {
        const token = getInjectionToken2({
          id: 'lru-token2-override',
          maxCacheSize: 10,
        });

        impl = getInjectable2({
          id: 'lru-override-impl',
          injectionToken: token,
          maxCacheSize: 2,
          instantiate: () => key => ({ key }),
        });

        di.register(impl);
      });

      it('when cache exceeds the injectable maxCacheSize, evicts using the injectable limit not the token limit', () => {
        const a = di.inject(impl, 'a');
        di.inject(impl, 'b');
        di.inject(impl, 'c');

        const aAgain = di.inject(impl, 'a');

        expect(aAgain).not.toBe(a);
      });
    });

    describe('given a general token2 with maxCacheSize 2 and a specific token derived from it', () => {
      let impl;

      beforeEach(() => {
        const generalToken = getInjectionToken2({
          id: 'lru-general-token2',
          maxCacheSize: 2,
        });

        const specificToken = generalToken.for('specific');

        impl = getInjectable2({
          id: 'lru-specific-impl',
          injectionToken: specificToken,
          instantiate: () => key => ({ key }),
        });

        di.register(impl);
      });

      it('when cache exceeds maxCacheSize, evicts using the inherited limit', () => {
        const a = di.inject(impl, 'a');
        di.inject(impl, 'b');
        di.inject(impl, 'c');

        const aAgain = di.inject(impl, 'a');

        expect(aAgain).not.toBe(a);
      });
    });

    describe('given a non-parametric injectable2 with maxCacheSize is registered', () => {
      let single;

      beforeEach(() => {
        single = getInjectable2({
          id: 'lru-single',
          maxCacheSize: 5,
          instantiate: () => () => 42,
        });

        di.register(single);
      });

      it('when injected, returns the correct value', () => {
        const result = di.inject(single);

        expect(result).toBe(42);
      });

      it('when injected twice, returns the same instance', () => {
        const result1 = di.inject(single);
        const result2 = di.inject(single);

        expect(result1).toBe(result2);
      });
    });

    describe('given a transient injectable2 with maxCacheSize is registered', () => {
      let trans;

      beforeEach(() => {
        trans = getInjectable2({
          id: 'lru-transient',
          transient: true,
          maxCacheSize: 5,
          instantiate: () => () => ({}),
        });

        di.register(trans);
      });

      it('when injected twice, returns different instances', () => {
        const result1 = di.inject(trans);
        const result2 = di.inject(trans);

        expect(result1).not.toBe(result2);
      });
    });
  });

  describe('given purge by key is used', () => {
    describe('given a parametric injectable2 with two cached keys', () => {
      let obj;
      let a;
      let b;

      beforeEach(() => {
        obj = getInjectable2({
          id: 'purge-key-obj',
          instantiate: () => key => ({ key }),
        });

        di.register(obj);

        a = di.inject(obj, 'a');
        b = di.inject(obj, 'b');
      });

      describe('when key a is purged', () => {
        beforeEach(() => {
          di.purge(obj, 'a');
        });

        it('when key a is injected again, returns a new instance', () => {
          expect(di.inject(obj, 'a')).not.toBe(a);
        });

        it('when key b is injected again, returns the same cached instance', () => {
          expect(di.inject(obj, 'b')).toBe(b);
        });
      });
    });

    describe('given a multi-param injectable2 with three cached entries', () => {
      let obj;
      let ab;
      let ac;
      let xz;

      beforeEach(() => {
        obj = getInjectable2({
          id: 'purge-prefix-obj',
          instantiate: () => (cat, id) => ({ cat, id }),
        });

        di.register(obj);

        ab = di.inject(obj, 'a', 'b');
        ac = di.inject(obj, 'a', 'c');
        xz = di.inject(obj, 'x', 'z');
      });

      describe('when purged by prefix a', () => {
        beforeEach(() => {
          di.purge(obj, 'a');
        });

        it('when key (a, b) is injected again, returns a new instance', () => {
          expect(di.inject(obj, 'a', 'b')).not.toBe(ab);
        });

        it('when key (a, c) is injected again, returns a new instance', () => {
          expect(di.inject(obj, 'a', 'c')).not.toBe(ac);
        });

        it('when key (x, z) is injected again, returns the same cached instance', () => {
          expect(di.inject(obj, 'x', 'z')).toBe(xz);
        });
      });
    });

    describe('given a token2 with two implementing injectable2s each with a cached key', () => {
      let token;
      let impl1;
      let impl2;
      let i1;
      let i2;

      beforeEach(() => {
        token = getInjectionToken2({ id: 'purge-token2' });

        impl1 = getInjectable2({
          id: 'purge-token2-impl-1',
          injectionToken: token,
          instantiate: () => key => ({ key, src: 1 }),
        });

        impl2 = getInjectable2({
          id: 'purge-token2-impl-2',
          injectionToken: token,
          instantiate: () => key => ({ key, src: 2 }),
        });

        di.register(impl1, impl2);

        i1 = di.inject(impl1, 'k');
        i2 = di.inject(impl2, 'k');
      });

      describe('when purged by token', () => {
        beforeEach(() => {
          di.purge(token);
        });

        it('when impl1 is injected again with key k, returns a new instance', () => {
          expect(di.inject(impl1, 'k')).not.toBe(i1);
        });

        it('when impl2 is injected again with key k, returns a new instance', () => {
          expect(di.inject(impl2, 'k')).not.toBe(i2);
        });
      });
    });

    describe('given a token2 with two implementing injectable2s each with keys a and b cached', () => {
      let token;
      let impl1;
      let impl2;
      let i1a;
      let i1b;
      let i2a;
      let i2b;

      beforeEach(() => {
        token = getInjectionToken2({ id: 'purge-token2-key' });

        impl1 = getInjectable2({
          id: 'purge-token2-key-impl-1',
          injectionToken: token,
          instantiate: () => key => ({ key, src: 1 }),
        });

        impl2 = getInjectable2({
          id: 'purge-token2-key-impl-2',
          injectionToken: token,
          instantiate: () => key => ({ key, src: 2 }),
        });

        di.register(impl1, impl2);

        i1a = di.inject(impl1, 'a');
        i1b = di.inject(impl1, 'b');
        i2a = di.inject(impl2, 'a');
        i2b = di.inject(impl2, 'b');
      });

      describe('when purged by token with key a', () => {
        beforeEach(() => {
          di.purge(token, 'a');
        });

        it('when impl1 is injected with key a, returns a new instance', () => {
          expect(di.inject(impl1, 'a')).not.toBe(i1a);
        });

        it('when impl1 is injected with key b, returns the same cached instance', () => {
          expect(di.inject(impl1, 'b')).toBe(i1b);
        });

        it('when impl2 is injected with key a, returns a new instance', () => {
          expect(di.inject(impl2, 'a')).not.toBe(i2a);
        });

        it('when impl2 is injected with key b, returns the same cached instance', () => {
          expect(di.inject(impl2, 'b')).toBe(i2b);
        });
      });
    });
  });

  describe('given scoped purge from within instantiate', () => {
    it('when purging a child injectable registered in its own context, returns a new instance', () => {
      const childInjectable = getInjectable2({
        id: 'child2',
        instantiate: () => key => ({ key }),
      });

      const parentInjectable = getInjectable2({
        id: 'parent2',
        instantiate: minimalDi => {
          minimalDi.register(childInjectable);
          const getChild = minimalDi.inject2(childInjectable);

          return () => ({
            getChild,
            purgeChild: key => minimalDi.purge(childInjectable, key),
          });
        },
      });

      di.register(parentInjectable);

      const parent = di.inject(parentInjectable);
      const child1 = parent.getChild('k');

      parent.purgeChild('k');

      const child2 = parent.getChild('k');
      expect(child2).not.toBe(child1);
    });

    it('when trying to purge an unrelated injectable outside its context tree, throws', () => {
      const unrelatedInjectable = getInjectable2({
        id: 'unrelated2',
        instantiate: () => key => ({ key }),
      });

      const parentInjectable = getInjectable2({
        id: 'parent-scoped2',
        instantiate: minimalDi => {
          minimalDi.purge(unrelatedInjectable);
          return () => 'done';
        },
      });

      di.register(unrelatedInjectable, parentInjectable);

      expect(() => di.inject(parentInjectable)).toThrow(
        'not within its registration context tree',
      );
    });
  });
});
