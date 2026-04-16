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
});
