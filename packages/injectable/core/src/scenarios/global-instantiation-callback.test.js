import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { instantiationDecoratorToken } from '../dependency-injection-container/tokens';

describe('global-instantiation-callback', () => {
  let di;

  beforeEach(() => {
    di = createContainer('test-container');
  });

  describe('given a global instantiation callback has been added', () => {
    let callbackSpy;

    beforeEach(() => {
      callbackSpy = jest.fn().mockImplementation((id, proceed) => proceed());

      di.addGlobalInstantiationCallback(callbackSpy);
    });

    describe('given some injectable1 has been registered', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-id',
          instantiate: () => 10,
        });

        di.register(someInjectable);
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the callback with the expected arguments', () => {
          expect(callbackSpy).toHaveBeenCalledWith(
            'some-id',
            expect.any(Function),
          );
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again, does not call the callback again', () => {
          callbackSpy.mockClear();

          di.inject(someInjectable);

          expect(callbackSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('given some injectable2 has been registered', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable2({
          id: 'some-id',
          instantiate: () => () => 10,
        });

        di.register(someInjectable);
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the callback with the expected arguments', () => {
          expect(callbackSpy).toHaveBeenCalledWith(
            'some-id',
            expect.any(Function),
          );
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again, does not call the callback again', () => {
          callbackSpy.mockClear();

          di.inject(someInjectable);

          expect(callbackSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('given some injectable1 has been registered in some namespace', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-id',
          instantiate: () => 10,
        });

        const someNamespaceInjectable = getInjectable2({
          id: 'some-namespace',
          instantiate: di => () => di.register(someInjectable),
        });

        di.register(someNamespaceInjectable);
        di.inject(someNamespaceInjectable);
        callbackSpy.mockClear();
      });

      it('when injecting that injectable, calls the callback with the namespaced id', () => {
        expect(di.inject(someInjectable)).toBe(10);

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-namespace:some-id',
          expect.any(Function),
        );
      });

      it('given the injectable is overridden, when injecting it, still calls the callback with the namespaced id', () => {
        di.override(someInjectable, () => 20);

        expect(di.inject(someInjectable)).toBe(20);

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-namespace:some-id',
          expect.any(Function),
        );
      });
    });

    describe('given some injectable2 has been registered in some namespace', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable2({
          id: 'some-id',
          instantiate: () => () => 10,
        });

        const someNamespaceInjectable = getInjectable2({
          id: 'some-namespace',
          instantiate: di => () => di.register(someInjectable),
        });

        di.register(someNamespaceInjectable);
        di.inject(someNamespaceInjectable);
        callbackSpy.mockClear();
      });

      it('when injecting that injectable, calls the callback with the namespaced id', () => {
        expect(di.inject(someInjectable)).toBe(10);

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-namespace:some-id',
          expect.any(Function),
        );
      });

      it('given the injectable is overridden, when injecting it, still calls the callback with the namespaced id', () => {
        di.override2(someInjectable, () => () => 20);

        expect(di.inject(someInjectable)).toBe(20);

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-namespace:some-id',
          expect.any(Function),
        );
      });
    });

    describe('given an injectable taking instantiation parameters', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-id',

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (di, key) => key,
          }),

          instantiate: (di, key) => `instance-for-${key}`,
        });

        di.register(someInjectable);
      });

      it('when injecting with a parameter, does not pass the parameter to the callback', () => {
        expect(di.inject(someInjectable, 'some-key')).toBe(
          'instance-for-some-key',
        );

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-id',
          expect.any(Function),
        );
      });

      it('when injecting with different parameters, calls the callback once per instance', () => {
        di.inject(someInjectable, 'a');
        di.inject(someInjectable, 'b');
        di.inject(someInjectable, 'a');

        expect(callbackSpy).toHaveBeenCalledTimes(2);
      });
    });

    it('given an injectable injecting a dependency, calls the callback for both, the injectable first', () => {
      const someDependency = getInjectable({
        id: 'some-dependency',
        instantiate: () => 10,
      });

      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: di => di.inject(someDependency) + 1,
      });

      di.register(someInjectable, someDependency);

      di.inject(someInjectable);

      expect(callbackSpy.mock.calls.map(call => call[0])).toEqual([
        'some-id',
        'some-dependency',
      ]);
    });

    describe('given an injectable2 with a param and a dependency', () => {
      let someInjectable;

      beforeEach(() => {
        const someDependency = getInjectable2({
          id: 'some-dependency',
          instantiate: () => () => 'some-dependency-value',
        });

        someInjectable = getInjectable2({
          id: 'some-id',
          lifecycle: lifecycleEnum.transient,

          instantiate: di => param => `${di.inject(someDependency)()}-${param}`,
        });

        di.register(someInjectable, someDependency);
      });

      it('when injecting, instantiates with the dependency and the param', () => {
        expect(di.inject(someInjectable, 'some-param')).toBe(
          'some-dependency-value-some-param',
        );
      });

      it('when injecting, does not pass the param to the callback', () => {
        di.inject(someInjectable, 'some-param');

        expect(callbackSpy).toHaveBeenCalledWith(
          'some-id',
          expect.any(Function),
        );
      });
    });

    it('given a transient injectable, calls the callback for every injection', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        lifecycle: lifecycleEnum.transient,
        instantiate: () => ({}),
      });

      di.register(someInjectable);

      di.inject(someInjectable);
      di.inject(someInjectable);

      expect(callbackSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('given no global instantiation callback has been added', () => {
    it('when injecting an injectable1, instantiates normally', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        lifecycle: lifecycleEnum.transient,
        instantiate: (di, param) => `instance-${param}`,
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable, 'some-param')).toBe(
        'instance-some-param',
      );
    });

    it('when injecting an injectable2, instantiates normally', () => {
      const someInjectable = getInjectable2({
        id: 'some-id',
        instantiate: () => param => `instance-${param}`,
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable, 'some-param')).toBe(
        'instance-some-param',
      );
    });
  });

  describe('given a callback wrapping thrown errors with context', () => {
    beforeEach(() => {
      di.addGlobalInstantiationCallback((id, proceed) => {
        try {
          proceed();
        } catch (error) {
          throw new Error(
            `Error while instantiating "${id}": ${error.message}`,
          );
        }
      });
    });

    it('when injecting an injectable that throws, throws with the context', () => {
      const someInjectable = getInjectable({
        id: 'some-id',

        instantiate: () => {
          throw new Error('some-error');
        },
      });

      di.register(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow(
        'Error while instantiating "some-id": some-error',
      );
    });

    it('when injecting an injectable whose dependency throws, throws with the context of each', () => {
      const someDependency = getInjectable({
        id: 'some-dependency',

        instantiate: () => {
          throw new Error('some-error');
        },
      });

      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: di => di.inject(someDependency),
      });

      di.register(someInjectable, someDependency);

      expect(() => di.inject(someInjectable)).toThrow(
        'Error while instantiating "some-id": Error while instantiating "some-dependency": some-error',
      );
    });

    it('when injecting an injectable that does not throw, does not interfere', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: () => 10,
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable)).toBe(10);
    });
  });

  describe('given multiple global instantiation callbacks', () => {
    let callOrder;

    beforeEach(() => {
      callOrder = [];

      const callbackFor = name => (id, proceed) => {
        callOrder.push(`${name}-before`);

        proceed();

        callOrder.push(`${name}-after`);
      };

      di.addGlobalInstantiationCallback(callbackFor('first'));
      di.addGlobalInstantiationCallback(callbackFor('second'));
    });

    it('when injecting, calls them with the first added outermost', () => {
      const someInjectable = getInjectable({
        id: 'some-id',

        instantiate: () => {
          callOrder.push('instantiate');

          return 10;
        },
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable)).toBe(10);

      expect(callOrder).toEqual([
        'first-before',
        'second-before',
        'instantiate',
        'second-after',
        'first-after',
      ]);
    });
  });

  describe('given a callback added both before and after another', () => {
    let callOrder;
    let someInjectable;
    let disposeLastAdd;

    beforeEach(() => {
      callOrder = [];

      const callbackFor = name => (id, proceed) => {
        callOrder.push(`${name}-before`);

        proceed();

        callOrder.push(`${name}-after`);
      };

      const repeatedCallback = callbackFor('repeated');

      di.addGlobalInstantiationCallback(repeatedCallback);
      di.addGlobalInstantiationCallback(callbackFor('other'));
      disposeLastAdd = di.addGlobalInstantiationCallback(repeatedCallback);

      someInjectable = getInjectable({
        id: 'some-id',
        lifecycle: lifecycleEnum.transient,

        instantiate: () => {
          callOrder.push('instantiate');

          return 10;
        },
      });

      di.register(someInjectable);
    });

    it('when disposing the last add, keeps the first add outermost', () => {
      disposeLastAdd();

      di.inject(someInjectable);

      expect(callOrder).toEqual([
        'repeated-before',
        'other-before',
        'instantiate',
        'other-after',
        'repeated-after',
      ]);
    });
  });

  describe('given a callback that does not proceed', () => {
    beforeEach(() => {
      di.addGlobalInstantiationCallback(() => {});
    });

    it('when injecting, throws', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: () => 10,
      });

      di.register(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow(
        'A global instantiation callback returned without "some-id" having been instantiated.',
      );
    });
  });

  describe('given a callback that swallows an error thrown by the instantiation', () => {
    beforeEach(() => {
      di.addGlobalInstantiationCallback((id, proceed) => {
        try {
          proceed();
        } catch (error) {
          // swallowed
        }
      });
    });

    it('when injecting an injectable that throws, throws', () => {
      const someInjectable = getInjectable({
        id: 'some-id',

        instantiate: () => {
          throw new Error('some-error');
        },
      });

      di.register(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow(
        'A global instantiation callback returned without "some-id" having been instantiated.',
      );
    });
  });

  describe('given a callback that proceeds twice', () => {
    beforeEach(() => {
      di.addGlobalInstantiationCallback((id, proceed) => {
        proceed();
        proceed();
      });
    });

    it('when injecting, throws', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: () => 10,
      });

      di.register(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow(
        'Tried to proceed with the instantiation of "some-id" more than once.',
      );
    });
  });

  describe('given a callback trying to get hold of the instance', () => {
    let proceedResults;

    beforeEach(() => {
      proceedResults = [];

      di.addGlobalInstantiationCallback((id, proceed) => {
        proceedResults.push(proceed());

        return 'some-replacement';
      });
    });

    it('when injecting an injectable1, proceeding yields nothing and the instance is not replaced', () => {
      const someInjectable = getInjectable({
        id: 'some-id',
        instantiate: () => 'some-secret',
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable)).toBe('some-secret');
      expect(proceedResults).toEqual([undefined]);
    });

    it('when injecting an injectable2, proceeding yields nothing and the instance is not replaced', () => {
      const someInjectable = getInjectable2({
        id: 'some-id',
        instantiate: () => () => 'some-secret',
      });

      di.register(someInjectable);

      expect(di.inject(someInjectable)).toBe('some-secret');
      expect(proceedResults).toEqual([undefined]);
    });
  });

  describe('given a callback and its disposer', () => {
    let callbackSpy;
    let dispose;
    let someInjectable;

    beforeEach(() => {
      callbackSpy = jest.fn().mockImplementation((id, proceed) => proceed());

      dispose = di.addGlobalInstantiationCallback(callbackSpy);

      someInjectable = getInjectable({
        id: 'some-id',
        lifecycle: lifecycleEnum.transient,
        instantiate: () => 10,
      });

      di.register(someInjectable);
    });

    it('when disposed, no longer calls the callback', () => {
      dispose();

      expect(di.inject(someInjectable)).toBe(10);
      expect(callbackSpy).not.toHaveBeenCalled();
    });

    it('given the same callback added twice, when disposing one twice, still calls it for the other', () => {
      di.addGlobalInstantiationCallback(callbackSpy);

      dispose();
      dispose();

      di.inject(someInjectable);

      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });

    it('given the same callback added twice, when disposing one, still calls it for the other', () => {
      di.addGlobalInstantiationCallback(callbackSpy);

      dispose();

      di.inject(someInjectable);

      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('given an instantiation decorator', () => {
    let callbackSpy;
    let someInjectable;

    beforeEach(() => {
      callbackSpy = jest.fn().mockImplementation((id, proceed) => proceed());

      someInjectable = getInjectable({
        id: 'some-id',
        instantiate: () => 10,
      });

      const someDecorator = getInjectable2({
        id: 'some-decorator',
        injectionToken: instantiationDecoratorToken.for(someInjectable),

        instantiate:
          () =>
          () =>
          instantiate =>
          (di, ...params) =>
            instantiate(di, ...params) + 1,
      });

      di.register(someDecorator, someInjectable);
      di.addGlobalInstantiationCallback(callbackSpy);
    });

    it('when injecting, the instance is the decorated one', () => {
      expect(di.inject(someInjectable)).toBe(11);
    });

    it('when injecting, the callback also fires for the decorator itself', () => {
      di.inject(someInjectable);

      expect(callbackSpy.mock.calls.map(call => call[0])).toEqual([
        'some-decorator',
        'some-id',
      ]);
    });
  });
});
