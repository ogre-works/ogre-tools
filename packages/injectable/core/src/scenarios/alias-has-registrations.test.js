import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('alias-has-registrations', () => {
  let di;

  beforeEach(() => {
    di = createContainer('irrelevant');
  });

  describe('given an injectable with or without an injection token', () => {
    let someInjectable;
    let someInjectionToken;

    beforeEach(() => {
      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });
    });

    it('given registered, when checking if the token has registrations, it does', () => {
      di.register(someInjectable);

      const tokenHasRegistrations = di.hasRegistrations(someInjectionToken);

      expect(tokenHasRegistrations).toBe(true);
    });

    it('but not registered, when checking if the token has registrations, it does not', () => {
      // Note: no registration.
      // di.register(someInjectable);

      const injectableHasRegistrations =
        di.hasRegistrations(someInjectionToken);

      expect(injectableHasRegistrations).toBe(false);
    });

    it('given registered, when checking if the injectable has registrations, it does', () => {
      di.register(someInjectable);

      const injectableHasRegistrations = di.hasRegistrations(someInjectable);

      expect(injectableHasRegistrations).toBe(true);
    });

    it('but not registered, when checking if the injectable has registrations, it does not', () => {
      // Note: no registration.
      // di.register(someInjectable);

      const injectableHasRegistrations = di.hasRegistrations(someInjectable);

      expect(injectableHasRegistrations).toBe(false);
    });

    it('given registered, but deregistered, when checking if the token has registrations, it does not', () => {
      di.register(someInjectable);
      di.deregister(someInjectable);

      const injectableHasRegistrations =
        di.hasRegistrations(someInjectionToken);

      expect(injectableHasRegistrations).toBe(false);
    });

    it('but not registered, when checking if the injectable has registrations, it does not', () => {
      // Note: no registration.
      // di.register(someInjectable);

      const injectableHasRegistrations = di.hasRegistrations(someInjectable);

      expect(injectableHasRegistrations).toBe(false);
    });

    it('given registered, but deregistered, when checking if the injectable has registrations, it does not', () => {
      di.register(someInjectable);
      di.deregister(someInjectable);

      const injectableHasRegistrations = di.hasRegistrations(someInjectable);

      expect(injectableHasRegistrations).toBe(false);
    });
  });

  it('hasRegistrations of root di and child di are the same thing', () => {
    const rootDi = di;

    let childDi;

    const someInjectable = getInjectable({
      id: 'some-injectable-to-manifest-a-child-di',

      instantiate: di => {
        childDi = di;
      },
    });

    di.register(someInjectable);
    di.inject(someInjectable);

    expect(rootDi.hasRegistrations).toBe(childDi.hasRegistrations);
  });
});
