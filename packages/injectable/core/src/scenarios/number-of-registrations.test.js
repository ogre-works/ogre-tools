import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

describe('getNumberOfRegistrations', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given an injection token', () => {
    let someInjectionToken;

    beforeEach(() => {
      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });
    });

    it('given no registrations for the token, returns 0', () => {
      expect(di.getNumberOfRegistrations(someInjectionToken)).toBe(0);
    });

    it('given one registered implementation, returns 1', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });

      di.register(someInjectable);

      expect(di.getNumberOfRegistrations(someInjectionToken)).toBe(1);
    });

    it('given multiple registered implementations, returns their count', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });

      const someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });

      di.register(someInjectable, someOtherInjectable);

      expect(di.getNumberOfRegistrations(someInjectionToken)).toBe(2);
    });

    it('given multiple registered implementations, but one deregistered, returns the decremented count', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });

      const someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'irrelevant',
        injectionToken: someInjectionToken,
      });

      di.register(someInjectable, someOtherInjectable);
      di.deregister(someOtherInjectable);

      expect(di.getNumberOfRegistrations(someInjectionToken)).toBe(1);
    });
  });

  it('given an injectable as the alias, when registered, returns 1', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable);

    expect(di.getNumberOfRegistrations(someInjectable)).toBe(1);
  });

  it('given an injectable as the alias, but not registered, returns 0', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    expect(di.getNumberOfRegistrations(someInjectable)).toBe(0);
  });

  it('given implementations for a token, when an injectable calls getNumberOfRegistrations during instantiation, returns their count', () => {
    let capturedCount;

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: di => {
        capturedCount = di.getNumberOfRegistrations(someInjectionToken);
      },
    });

    di.register(someImplementation, someInjectable);
    di.inject(someInjectable);

    expect(capturedCount).toBe(1);
  });

  it('given implementations for a token, when an injectable2 calls getNumberOfRegistrations during instantiation, returns their count', () => {
    let capturedCount;

    const someInjectionToken2 = getInjectionToken2({
      id: 'some-injection-token-2',
    });

    const someImplementation = getInjectable2({
      id: 'some-implementation',
      instantiate: () => () => 'irrelevant',
      injectionToken: someInjectionToken2,
    });

    const someInjectable = getInjectable2({
      id: 'some-injectable',

      instantiate: di => () => {
        capturedCount = di.getNumberOfRegistrations(someInjectionToken2);
      },
    });

    di.register(someImplementation, someInjectable);
    di.inject2(someInjectable)();

    expect(capturedCount).toBe(1);
  });

  it('getNumberOfRegistrations of root di and child di are the same thing', () => {
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

    expect(rootDi.getNumberOfRegistrations).toBe(
      childDi.getNumberOfRegistrations,
    );
  });
});
