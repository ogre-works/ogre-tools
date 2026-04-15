import getInjectable from '../getInjectable/getInjectable';
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
      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate:
            registerToBeDecorated =>
            injectable => {
              registerToBeDecorated(injectable);
            },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a registration decorator that prevents registration, when an injectable is registered, injecting it throws', () => {
      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate: () => () => {
            // Don't call registerToBeDecorated — prevent registration
          },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a targeted registration decorator, when a matching injectable is registered, the decorator is applied', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          target: someInjectable,
          decorate: () => () => {
            // Prevent registration
          },
        }),
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

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          target: targetInjectable,
          decorate: () => () => {
            // Prevent registration
          },
        }),
      });

      di.register(decoratorInjectable, targetInjectable, otherInjectable);

      // targetInjectable was blocked
      expect(() => di.inject(targetInjectable)).toThrow();

      // otherInjectable was not affected
      expect(di.inject(otherInjectable)).toBe('other-value');
    });

    it('given a registration decorator targeting an injection token, when an injectable with that token is registered, the decorator is applied', () => {
      const someToken = getInjectionToken({ id: 'some-token' });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          target: someToken,
          decorate: () => () => {
            // Prevent registration
          },
        }),
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

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate: () => () => {
            // Would prevent registration, but target is not decorable
          },
        }),
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a registration decorator that defers, when toBeDecorated is called later, the injectable is registered in the original context', () => {
      let deferredRegister;

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate:
            registerToBeDecorated =>
            injectable => {
              // Store for later
              deferredRegister = () => registerToBeDecorated(injectable);
            },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      di.register(decoratorInjectable, someInjectable);

      // Not registered yet
      expect(() => di.inject(someInjectable)).toThrow();

      // Now release the deferred registration
      deferredRegister();

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given decorator and target registered in same call with target first, the decorator still applies', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          target: someInjectable,
          decorate: () => () => {
            // Prevent registration
          },
        }),
      });

      // Target listed before decorator — decorator should still apply
      di.register(someInjectable, decoratorInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a prevented registration, registration callbacks do not fire for the prevented injectable', () => {
      const callbackMock = jest.fn();

      const callbackInjectable = getInjectable({
        id: 'some-callback',
        injectionToken: registrationCallbackToken,
        instantiate: () => callbackMock,
      });

      const decoratorInjectable = getInjectable({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate: () => () => {
            // Prevent registration
          },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
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
      const decoratorInjectable = getInjectable({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate:
            deregisterToBeDecorated =>
            injectable => {
              deregisterToBeDecorated(injectable);
            },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');

      di.deregister(someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a deregistration decorator that prevents deregistration, when deregister is called, the injectable remains injectable', () => {
      const decoratorInjectable = getInjectable({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          decorate: () => () => {
            // Don't call deregisterToBeDecorated — prevent deregistration
          },
        }),
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      di.register(decoratorInjectable, someInjectable);

      di.deregister(someInjectable);

      // Still registered because decorator prevented deregistration
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

      const decoratorInjectable = getInjectable({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken,
        decorable: false,

        instantiate: () => ({
          target: targetInjectable,
          decorate: () => () => {
            // Would prevent deregistration
          },
        }),
      });

      di.register(decoratorInjectable, targetInjectable, otherInjectable);

      di.deregister(targetInjectable, otherInjectable);

      // targetInjectable deregistration was blocked
      expect(di.inject(targetInjectable)).toBe('target-value');

      // otherInjectable was deregistered normally
      expect(() => di.inject(otherInjectable)).toThrow();
    });
  });
});
