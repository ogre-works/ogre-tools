import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import {
  injectionDecoratorToken,
  preInjectCallbackToken,
} from '../dependency-injection-container/tokens';

// The container stands in as the injecting party for injects made directly
// on `di`, as opposed to injects made from within an instantiate.
const containerRoot = { id: 'some-container', aliasType: 'container' };

describe('createContainer.pre-inject-callbacks', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given a callback targeting a token with an implementation', () => {
    let callbackMock;
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someToken),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable, callbackInjectable);
    });

    it('when injecting via the token, the callback fires once with the alias and kind "inject"', () => {
      di.inject(someToken);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'inject', containerRoot],
      ]);
    });

    it('when injecting twice, the callback fires for the singleton cache hit too', () => {
      di.inject(someToken);
      di.inject(someToken);

      expect(callbackMock).toHaveBeenCalledTimes(2);
    });

    it('when injecting many via the token, the callback fires exactly once with kind "injectMany"', () => {
      di.injectMany(someToken);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'injectMany', containerRoot],
      ]);
    });

    it('when injecting many with meta, the callback fires once with kind "injectMany"', () => {
      di.injectManyWithMeta(someToken);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'injectMany', containerRoot],
      ]);
    });

    it('when injecting with meta, the callback fires once with kind "inject"', () => {
      di.injectWithMeta(someToken);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'inject', containerRoot],
      ]);
    });
  });

  describe('given a callback targeting a token with multiple implementations', () => {
    it('when injecting many, the callback fires exactly once and not per element', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const implementations = ['a', 'b', 'c'].map(x =>
        getInjectable2({
          id: `some-injectable-${x}`,
          injectionToken: someToken,
          instantiate: () => () => x,
        }),
      );

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someToken),
        instantiate: () => () => callbackMock,
      });

      di.register(...implementations, callbackInjectable);

      expect(di.injectMany(someToken)).toEqual(['a', 'b', 'c']);
      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'injectMany', containerRoot],
      ]);
    });
  });

  describe('given a callback targeting a token with no implementations', () => {
    it('when the callback registers an implementation on demand, injecting via the token returns the just-in-time instance', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const someLazyInjectable = getInjectable2({
        id: 'some-lazy-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-lazy-instance',
      });

      const registerOnDemandInjectable = getInjectable2({
        id: 'some-register-on-demand-callback',
        injectionToken: preInjectCallbackToken.for(someToken),
        instantiate: () => () => () => {
          di.register(someLazyInjectable);
        },
      });

      di.register(registerOnDemandInjectable);

      expect(di.inject(someToken)).toBe('some-lazy-instance');
    });

    it('without a callback, injecting via the unimplemented token throws', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      expect(() => di.inject(someToken)).toThrow();
    });

    it('when the callback registers nothing, injecting many fires the callback and returns empty without throwing', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someToken),
        instantiate: () => () => callbackMock,
      });

      di.register(callbackInjectable);

      expect(di.injectMany(someToken)).toEqual([]);
      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'injectMany', containerRoot],
      ]);
    });
  });

  describe('tag-keyed dispatch', () => {
    it('a callback targeting a custom tag of a token fires when injecting via the token', () => {
      const someToken = getInjectionToken({
        id: 'some-token',
        tags: ['some-tag'],
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-instance',
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-tag-callback',
        injectionToken: preInjectCallbackToken.for('some-tag'),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable, callbackInjectable);

      di.inject(someToken);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'inject', containerRoot],
      ]);
    });

    it('a callback targeting the injectionToken tag fires for token injects and not for token-less injectable injects', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      const someTokenlessInjectable = getInjectable2({
        id: 'some-tokenless-injectable',
        instantiate: () => () => 'some-tokenless-instance',
      });

      const callbackMock = jest.fn();

      const anyTokenCallbackInjectable = getInjectable2({
        id: 'any-token-callback',
        injectionToken: preInjectCallbackToken.for('injectionToken'),
        instantiate: () => () => callbackMock,
      });

      di.register(
        someInjectable,
        someTokenlessInjectable,
        anyTokenCallbackInjectable,
      );

      di.inject(someToken);
      di.inject(someTokenlessInjectable);

      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'inject', containerRoot],
      ]);
    });
  });

  describe('given a callback targeting an injectable directly', () => {
    it('when the injectable is injected, the callback fires with the injectable as the alias', () => {
      const someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: () => () => 'some-instance',
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someInjectable),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable, callbackInjectable);

      di.inject(someInjectable);

      expect(callbackMock.mock.calls).toEqual([
        [someInjectable, 'inject', containerRoot],
      ]);
    });
  });

  describe('given a nested inject inside an instantiate', () => {
    it('the callback fires for the nested alias with kind "inject"', () => {
      const someChildInjectable = getInjectable({
        id: 'some-child-injectable',
        instantiate: () => 'some-child-instance',
      });

      const someParentInjectable = getInjectable({
        id: 'some-parent-injectable',
        instantiate: someDi => `parent(${someDi.inject(someChildInjectable)})`,
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someChildInjectable),
        instantiate: () => () => callbackMock,
      });

      di.register(
        someParentInjectable,
        someChildInjectable,
        callbackInjectable,
      );

      expect(di.inject(someParentInjectable)).toBe(
        'parent(some-child-instance)',
      );

      // The injecting party is the parent, not the container root.
      expect(callbackMock.mock.calls).toEqual([
        [someChildInjectable, 'inject', someParentInjectable],
      ]);
    });

    it('given the same alias injected both from an instantiate and from the container, the callback reports each injecting party', () => {
      const someChildInjectable = getInjectable({
        id: 'some-child-injectable',
        instantiate: () => 'some-child-instance',
      });

      const someParentInjectable = getInjectable({
        id: 'some-parent-injectable',
        instantiate: someDi => `parent(${someDi.inject(someChildInjectable)})`,
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someChildInjectable),
        instantiate: () => () => callbackMock,
      });

      di.register(
        someParentInjectable,
        someChildInjectable,
        callbackInjectable,
      );

      di.inject(someParentInjectable);
      di.inject(someChildInjectable);

      expect(callbackMock.mock.calls).toEqual([
        [someChildInjectable, 'inject', someParentInjectable],
        [someChildInjectable, 'inject', containerRoot],
      ]);
    });
  });

  describe('registration lifecycle of callbacks', () => {
    it('deregistering the last callback stops firing on subsequent injects', () => {
      const someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: () => () => 'some-instance',
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someInjectable),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable, callbackInjectable);

      di.inject(someInjectable);
      expect(callbackMock).toHaveBeenCalledTimes(1);

      di.deregister(callbackInjectable);

      di.inject(someInjectable);
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('registering a callback after the first inject is reflected on the next inject', () => {
      const someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: () => () => 'some-instance',
      });

      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for(someInjectable),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable);

      di.inject(someInjectable);
      expect(callbackMock).not.toHaveBeenCalled();

      di.register(callbackInjectable);

      di.inject(someInjectable);
      expect(callbackMock.mock.calls).toEqual([
        [someInjectable, 'inject', containerRoot],
      ]);
    });
  });

  describe('machinery exemption', () => {
    it('a callback targeting the injectionToken tag does not fire for its own resolution', () => {
      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
      })();

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      const callbackMock = jest.fn();

      const anyTokenCallbackInjectable = getInjectable2({
        id: 'any-token-callback',
        injectionToken: preInjectCallbackToken.for('injectionToken'),
        instantiate: () => () => callbackMock,
      });

      di.register(someInjectable, anyTokenCallbackInjectable);

      expect(di.inject(someToken)).toBe('some-instance');

      // Exactly one call: only the user token — resolving the callback
      // itself, under the untagged machinery token, does not fire.
      expect(callbackMock.mock.calls).toEqual([
        [someToken, 'inject', containerRoot],
      ]);
    });
  });

  describe('coexistence with injection decorators', () => {
    it('the callback fires before the injection decorator wraps', () => {
      const order = [];

      const someToken = getInjectionToken2({
        cardinality: 'zero-or-many',
        id: 'some-token',
        tags: ['some-tag'],
      })();

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      const callbackInjectable = getInjectable2({
        id: 'some-pre-inject-callback',
        injectionToken: preInjectCallbackToken.for('some-tag'),
        instantiate: () => () => () => {
          order.push('callback');
        },
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-injection-decorator',
        injectionToken: injectionDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) => {
            order.push('decorator');
            return injectToBeDecorated(...params);
          },
      });

      di.register(someInjectable, callbackInjectable, decoratorInjectable);

      expect(di.inject(someToken)).toBe('some-instance');
      expect(order).toEqual(['callback', 'decorator']);
    });
  });
});
