import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('injection-of-factories', () => {
  describe('given keyed singleton injectable', () => {
    let di;
    let someInjectable;
    let someInjectionToken;

    beforeEach(() => {
      di = createContainer('some-container');

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

    describe('given injecting an injectable which uses a factory as part of instantiate', () => {
      let factory;

      beforeEach(() => {
        const someKeyedInjectable = getInjectable({
          id: 'some-keyed-injectable',

          instantiate: (di, key) => ({
            instance: `some-instance-for-${key}`,
            context: di.context,
          }),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (di, key) => key,
          }),
        });

        const injectableUsingFactory = getInjectable({
          id: 'some-injectable-using-factory',
          instantiate: di => di.injectFactory(someKeyedInjectable),
        });

        di.register(someKeyedInjectable, injectableUsingFactory);

        factory = di.inject(injectableUsingFactory);
      });

      describe('when factory is used', () => {
        let actual;

        beforeEach(() => {
          actual = factory('some-key');
        });

        it('instance is expected', () => {
          expect(actual.instance).toBe('some-instance-for-some-key');
        });

        it('context is expected', () => {
          expect(actual.context.map(x => x.injectable.id)).toEqual([
            'some-container',
            'some-injectable-using-factory',
            'some-keyed-injectable',
          ]);
        });
      });
    });

    describe('given injecting an injectable which uses a factory as part of instantiate which causes a cycle', () => {
      let factory;

      beforeEach(() => {
        const someKeyedInjectable = getInjectable({
          id: 'some-keyed-injectable',

          instantiate: (di, key) => di.inject(injectableUsingFactory)(key),

          lifecycle: lifecycleEnum.keyedSingleton({
            getInstanceKey: (di, key) => key,
          }),
        });

        const injectableUsingFactory = getInjectable({
          id: 'some-injectable-using-factory',
          instantiate: di => di.injectFactory(someKeyedInjectable),
        });

        di.register(someKeyedInjectable, injectableUsingFactory);

        factory = di.inject(injectableUsingFactory);
      });

      it('when factory is used, throws', () => {
        expect(() => {
          factory('some-key');
        }).toThrow(
          'Cycle of injectables encountered: "some-injectable-using-factory" -> "some-keyed-injectable" -> "some-injectable-using-factory"',
        );
      });
    });
  });
});
