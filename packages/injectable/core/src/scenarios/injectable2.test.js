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

  describe('non-parametric singleton', () => {
    it('returns instance from public inject (factory called internally)', () => {
      const fooInjectable = getInjectable2({
        id: 'foo',
        instantiate: () => () => 42,
      });

      di.register(fooInjectable);

      const result = di.inject(fooInjectable);

      expect(result).toBe(42);
    });

    it('returns same instance on subsequent injections (singleton)', () => {
      const fooInjectable = getInjectable2({
        id: 'foo',
        instantiate: () => () => ({}),
      });

      di.register(fooInjectable);

      const result1 = di.inject(fooInjectable);
      const result2 = di.inject(fooInjectable);

      expect(result1).toBe(result2);
    });
  });

  describe('parametric keyed singleton', () => {
    it('returns instance with params passed to factory', () => {
      const greetInjectable = getInjectable2({
        id: 'greet',
        instantiate: () => (name, greeting) => `${greeting}, ${name}!`,
      });

      di.register(greetInjectable);

      const result = di.inject(greetInjectable, 'Alice', 'Hello');

      expect(result).toBe('Hello, Alice!');
    });

    it('caches by params (keyed singleton)', () => {
      const objInjectable = getInjectable2({
        id: 'obj',
        instantiate: () => key => ({ key }),
      });

      di.register(objInjectable);

      const result1 = di.inject(objInjectable, 'a');
      const result2 = di.inject(objInjectable, 'a');
      const result3 = di.inject(objInjectable, 'b');

      expect(result1).toBe(result2);
      expect(result1).not.toBe(result3);
      expect(result1).toEqual({ key: 'a' });
      expect(result3).toEqual({ key: 'b' });
    });
  });

  describe('transient', () => {
    it('creates new instance every time', () => {
      const requestInjectable = getInjectable2({
        id: 'request',
        instantiate: () => () => ({}),
        transient: true,
      });

      di.register(requestInjectable);

      const result1 = di.inject(requestInjectable);
      const result2 = di.inject(requestInjectable);

      expect(result1).not.toBe(result2);
    });
  });

  describe('factory-returning inject inside new-style instantiate', () => {
    it('di.inject returns factory for old-style deps', () => {
      const oldDep = getInjectable({
        id: 'old-dep',
        instantiate: () => 'old-value',
      });

      const newService = getInjectable2({
        id: 'new-service',
        instantiate: di => {
          const getOld = di.inject(oldDep);

          return () => `using-${getOld()}`;
        },
      });

      di.register(oldDep, newService);

      const result = di.inject(newService);

      expect(result).toBe('using-old-value');
    });

    it('di.inject returns factory for new-style deps', () => {
      const dep = getInjectable2({
        id: 'dep',
        instantiate: () => name => `hello-${name}`,
      });

      const service = getInjectable2({
        id: 'service',
        instantiate: di => {
          const getDep = di.inject(dep);

          return () => getDep('world');
        },
      });

      di.register(dep, service);

      const result = di.inject(service);

      expect(result).toBe('hello-world');
    });

    it('di.injectMany returns factory for instance array', () => {
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
          const getHandlers = di.injectMany(token);

          return () => getHandlers().join(',');
        },
      });

      di.register(handler1, handler2, service);

      const result = di.inject(service);

      expect(result).toBe('h1,h2');
    });
  });

  describe('injectionToken2', () => {
    it('works with inject and injectMany', () => {
      const token = getInjectionToken2({ id: 'service' });

      const impl = getInjectable2({
        id: 'impl',
        injectionToken: token,
        instantiate: () => () => 'impl-value',
      });

      di.register(impl);

      // Public inject returns instance
      const instance = di.inject(token);
      expect(instance).toBe('impl-value');

      // Public injectMany returns instance array
      const instances = di.injectMany(token);
      expect(instances).toEqual(['impl-value']);
    });
  });

  describe('mixed old and new style in same container', () => {
    it('old-style injectable works as before', () => {
      const oldInjectable = getInjectable({
        id: 'old',
        instantiate: (di, param) => `old-${param}`,
        lifecycle: lifecycleEnum.transient,
      });

      di.register(oldInjectable);

      expect(di.inject(oldInjectable, 'test')).toBe('old-test');
    });

    it('new-style injectable works alongside old-style', () => {
      const oldDep = getInjectable({
        id: 'old-dep',
        instantiate: () => 'from-old',
      });

      const newInjectable = getInjectable2({
        id: 'new',
        instantiate: di => {
          const getOld = di.inject(oldDep);
          return () => `new-with-${getOld()}`;
        },
      });

      di.register(oldDep, newInjectable);

      expect(di.inject(newInjectable)).toBe('new-with-from-old');
    });
  });

  describe('injectable whose instance is a function', () => {
    it('wrapping in zero-arg factory preserves function instance', () => {
      const doublerInjectable = getInjectable2({
        id: 'doubler',
        instantiate: () => () => x => x * 2,
      });

      di.register(doublerInjectable);

      const doubler = di.inject(doublerInjectable);

      expect(doubler(5)).toBe(10);
    });
  });

  describe('injectWithMeta', () => {
    it('returns instance with meta for non-parametric injectable2', () => {
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

    it('returns instance with meta for parametric injectable2', () => {
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

  describe('injectManyWithMeta', () => {
    it('returns instances with meta for token2', () => {
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

    it('returns instances with meta for parametric token2', () => {
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

  describe('override', () => {
    it('override with flat stub works for injectable2', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-foo',
        instantiate: () => () => 'original',
      });

      di.register(fooInjectable);

      di.override(fooInjectable, () => 'overridden');

      expect(di.inject(fooInjectable)).toBe('overridden');
    });

    it('override with parametric stub works for injectable2', () => {
      const fooInjectable = getInjectable2({
        id: 'overridable-param',
        instantiate: () => name => `original-${name}`,
      });

      di.register(fooInjectable);

      di.override(fooInjectable, (di, name) => `overridden-${name}`);

      expect(di.inject(fooInjectable, 'test')).toBe('overridden-test');
    });
  });

  describe('maxCacheSize (LRU)', () => {
    it('evicts LRU entry when parametric cache exceeds maxCacheSize', () => {
      const objInjectable = getInjectable2({
        id: 'lru-obj',
        maxCacheSize: 2,
        instantiate: () => key => ({ key }),
      });

      di.register(objInjectable);

      const a = di.inject(objInjectable, 'a');
      di.inject(objInjectable, 'b');
      di.inject(objInjectable, 'c'); // should evict 'a'

      const aAgain = di.inject(objInjectable, 'a');
      expect(aAgain).not.toBe(a); // new instance
      expect(aAgain).toEqual({ key: 'a' });
    });

    it('promotes entry on access so it is not evicted', () => {
      const objInjectable = getInjectable2({
        id: 'lru-promote',
        maxCacheSize: 2,
        instantiate: () => key => ({ key }),
      });

      di.register(objInjectable);

      const a = di.inject(objInjectable, 'a');
      di.inject(objInjectable, 'b');

      // Re-access 'a' to promote it
      di.inject(objInjectable, 'a');

      // Now 'b' is LRU
      di.inject(objInjectable, 'c');

      expect(di.inject(objInjectable, 'a')).toBe(a); // still cached
    });

    it('token2 maxCacheSize propagates to implementing injectables', () => {
      const token = getInjectionToken2({
        id: 'lru-token2',
        maxCacheSize: 2,
      });

      const impl = getInjectable2({
        id: 'lru-token2-impl',
        injectionToken: token,
        instantiate: () => key => ({ key }),
      });

      di.register(impl);

      const a = di.inject(impl, 'a');
      di.inject(impl, 'b');
      di.inject(impl, 'c'); // should evict 'a'

      const aAgain = di.inject(impl, 'a');
      expect(aAgain).not.toBe(a);
    });

    it('injectable2 maxCacheSize overrides token2 maxCacheSize', () => {
      const token = getInjectionToken2({
        id: 'lru-token2-override',
        maxCacheSize: 10,
      });

      const impl = getInjectable2({
        id: 'lru-override-impl',
        injectionToken: token,
        maxCacheSize: 2,
        instantiate: () => key => ({ key }),
      });

      di.register(impl);

      const a = di.inject(impl, 'a');
      di.inject(impl, 'b');
      di.inject(impl, 'c'); // should evict 'a' (maxCacheSize=2, not 10)

      const aAgain = di.inject(impl, 'a');
      expect(aAgain).not.toBe(a);
    });

    it('specific token2 inherits maxCacheSize from general token2', () => {
      const generalToken = getInjectionToken2({
        id: 'lru-general-token2',
        maxCacheSize: 2,
      });

      const specificToken = generalToken.for('specific');

      const impl = getInjectable2({
        id: 'lru-specific-impl',
        injectionToken: specificToken,
        instantiate: () => key => ({ key }),
      });

      di.register(impl);

      const a = di.inject(impl, 'a');
      di.inject(impl, 'b');
      di.inject(impl, 'c'); // should evict 'a'

      const aAgain = di.inject(impl, 'a');
      expect(aAgain).not.toBe(a);
    });

    it('non-parametric injectable2 with maxCacheSize works without issues', () => {
      const single = getInjectable2({
        id: 'lru-single',
        maxCacheSize: 5,
        instantiate: () => () => 42,
      });

      di.register(single);

      const result1 = di.inject(single);
      const result2 = di.inject(single);
      expect(result1).toBe(42);
      expect(result1).toBe(result2);
    });

    it('transient injectable2 with maxCacheSize is harmless', () => {
      const trans = getInjectable2({
        id: 'lru-transient',
        transient: true,
        maxCacheSize: 5,
        instantiate: () => () => ({}),
      });

      di.register(trans);

      const result1 = di.inject(trans);
      const result2 = di.inject(trans);
      expect(result1).not.toBe(result2);
    });
  });
});
