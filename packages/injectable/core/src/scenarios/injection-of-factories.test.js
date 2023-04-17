import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('injection-of-factories', () => {
  describe('given keyed singleton injectable', () => {
    let di;
    let someInjectable;
    let someInjectionToken;

    beforeEach(() => {
      di = createContainer('irrelevant');

      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: (di, key) => `some-instance-for-${key}`,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, key) => key,
        }),

        injectionToken: someInjectionToken,
      });

      di.register(someInjectable);
    });

    describe('given injecting a factory using injectable', () => {
      let factory;

      beforeEach(() => {
        factory = di.injectFactory(someInjectable);
      });

      it('when factory is used, returns instance', () => {
        const actualInstance = factory('some-key');

        expect(actualInstance).toBe('some-instance-for-some-key');
      });
    });

    describe('given injecting a factory using injection token', () => {
      let factory;

      beforeEach(() => {
        factory = di.injectFactory(someInjectionToken);
      });

      it('when factory is used, returns instance', () => {
        const actualInstance = factory('some-key');

        expect(actualInstance).toBe('some-instance-for-some-key');
      });
    });
  });
});
