import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  registrationDecoratorToken,
  deregistrationDecoratorToken,
  registrationCallbackToken,
} from '../dependency-injection-container/tokens';

describe('createContainer.registration-decoration', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('registration decorators', () => {
    it('given a registration decorator that proceeds, when an injectable is registered, it is injectable', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => registerToBeDecorated => injectable => {
          registerToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a registration decorator that prevents registration, when an injectable is registered, injecting it throws', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Don't call registerToBeDecorated — prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a targeted registration decorator, when a matching injectable is registered, the decorator is applied', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a targeted registration decorator, when a non-matching injectable is registered, the decorator is not applied', () => {
      const targetInjectable = getInjectable({
        id: 'target-injectable',
        instantiate: () => 'target-value',
      });

      const otherInjectable = getInjectable({
        id: 'other-injectable',
        instantiate: () => 'other-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(targetInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Prevent registration
        },
      });

      di.register(decoratorInjectable, targetInjectable, otherInjectable);

      expect(() => di.inject(targetInjectable)).toThrow();
      expect(di.inject(otherInjectable)).toBe('other-value');
    });

    it('given a registration decorator targeting an injection token, when an injectable with that token is registered, the decorator is applied', () => {
      const someToken = getInjectionToken({ id: 'some-token' });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        decorable: false,

        instantiate: () => () => () => () => {
          // Prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.injectMany(someToken)).toEqual([]);
    });

    it('given a registration decorator with decorable: false on the target injectable, the decorator is not applied', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
        decorable: false,
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Would prevent registration, but target is not decorable
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a registration decorator that defers, when toBeDecorated is called later, the injectable is registered in the original context', () => {
      let deferredRegister;

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => registerToBeDecorated => injectable => {
          deferredRegister = () => registerToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();

      deferredRegister();

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given decorator and target registered in same call with target first, the decorator still applies', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Prevent registration
        },
      });

      di.register(someInjectable, decoratorInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a token-targeted decorator and an injectable whose id matches the token id, the decorator fires exactly once', () => {
      const someToken = getInjectionToken({ id: 'shared-id' });

      const someInjectable = getInjectable({
        id: 'shared-id',
        injectionToken: someToken,
        instantiate: () => 'some-value',
      });

      const decorateMock = jest.fn();

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        decorable: false,

        instantiate: () => () => registerToBeDecorated => injectable => {
          decorateMock(injectable);
          registerToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      const callsForInjectable = decorateMock.mock.calls.filter(
        call => call[0] === someInjectable,
      );

      expect(callsForInjectable).toHaveLength(1);
    });

    it('given a prevented registration, registration callbacks do not fire for the prevented injectable', () => {
      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable({
        id: 'some-callback',
        injectionToken: registrationCallbackToken,
        instantiate: () => callbackMock,
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Prevent registration
        },
      });

      di.register(callbackInjectable);
      di.register(decoratorInjectable, someInjectable);

      const registeredIds = callbackMock.mock.calls.map(call => call[0].id);

      expect(registeredIds).toContain('some-registration-decorator');
      expect(registeredIds).not.toContain('some-injectable');
    });
  });

  describe('deregistration decorators', () => {
    it('given a deregistration decorator that proceeds, when an injectable is deregistered, it is no longer injectable', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => deregisterToBeDecorated => injectable => {
          deregisterToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');

      di.deregister(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a deregistration decorator that prevents deregistration, when deregister is called, the injectable remains injectable', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken.for(someInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Don't call deregisterToBeDecorated — prevent deregistration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      di.deregister(someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a targeted deregistration decorator, when a non-matching injectable is deregistered, the decorator is not applied', () => {
      const targetInjectable = getInjectable({
        id: 'target-injectable',
        instantiate: () => 'target-value',
      });

      const otherInjectable = getInjectable({
        id: 'other-injectable',
        instantiate: () => 'other-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken.for(targetInjectable),
        decorable: false,

        instantiate: () => () => () => () => {
          // Would prevent deregistration
        },
      });

      di.register(decoratorInjectable, targetInjectable, otherInjectable);

      di.deregister(targetInjectable, otherInjectable);

      expect(di.inject(targetInjectable)).toBe('target-value');
      expect(() => di.inject(otherInjectable)).toThrow();
    });
  });
});
