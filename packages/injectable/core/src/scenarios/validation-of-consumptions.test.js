import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import getInjectableBunch from '../getInjectableBunch/getInjectableBunch';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { idBasedSpecificToken2 } from '../test-utils/idBasedSpecificToken2';

describe('createContainer.validate', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given a consumption of a token with cardinality "one"', () => {
    let someToken;
    let someConsumer;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'one',
      })(idBasedSpecificToken2);

      someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someToken],
        instantiate: di => di.inject(someToken),
      });

      di.register(someConsumer);
    });

    it('when nothing implements it, validating throws', () => {
      expect(() => di.validate()).toThrow(
        'Tried to validate container "some-container", but found violations:\n' +
          ' - Injectable "some-consumer" consumes injection token "some-token" with cardinality "one", but it has no registrations.',
      );
    });

    it('when an implementation is registered, validating passes', () => {
      di.register(
        getInjectable2({
          id: 'some-implementation',
          injectionToken: someToken,
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(di.validate().verifiedInjectables.count).toBe(2);
    });

    it('when only a .for() child of it is implemented, validating passes', () => {
      di.register(
        getInjectable2({
          id: 'specific-implementation',
          injectionToken: someToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(() => di.validate()).not.toThrow();
    });

    it('when the consuming injectable is overridden, validating passes', () => {
      di.override(someConsumer, () => () => 'overridden');

      expect(() => di.validate()).not.toThrow();
    });
  });

  describe('given a consumption of a token with cardinality "one-or-many"', () => {
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'one-or-many',
      })();

      di.register(
        getInjectable2({
          id: 'some-consumer',
          consumptions: [someToken],
          instantiate: di => di.injectMany(someToken),
        }),
      );
    });

    it('when nothing implements it, validating throws', () => {
      expect(() => di.validate()).toThrow(
        'Tried to validate container "some-container", but found violations:\n' +
          ' - Injectable "some-consumer" consumes injection token "some-token" with cardinality "one-or-many", but it has no registrations.',
      );
    });

    it('when several implementations are registered, validating passes', () => {
      di.register(
        getInjectable2({
          id: 'first-implementation',
          injectionToken: someToken,
          instantiate: () => () => 'first',
        }),

        getInjectable2({
          id: 'second-implementation',
          injectionToken: someToken,
          instantiate: () => () => 'second',
        }),
      );

      expect(() => di.validate()).not.toThrow();
    });
  });

  describe.each(['zero-or-one', 'zero-or-many'])(
    'given a consumption of a token with cardinality "%s"',
    cardinality => {
      it('when nothing implements it, validating passes', () => {
        const someToken = getInjectionToken2({
          id: 'some-token',
          cardinality,
        })();

        di.register(
          getInjectable2({
            id: 'some-consumer',
            consumptions: [someToken],
            instantiate: () => () => 'irrelevant',
          }),
        );

        expect(() => di.validate()).not.toThrow();
      });
    },
  );

  describe('given several unsatisfied consumptions across injectables', () => {
    it('when validating, throws once listing every violation', () => {
      const someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'one',
      })();

      const someOtherToken = getInjectionToken2({
        id: 'some-other-token',
        cardinality: 'one-or-many',
      })();

      di.register(
        getInjectable2({
          id: 'some-consumer',
          consumptions: [someToken, someOtherToken],
          instantiate: () => () => 'irrelevant',
        }),

        getInjectable2({
          id: 'some-other-consumer',
          consumptions: [someToken],
          instantiate: () => () => 'irrelevant',
        }),
      );

      expect(() => di.validate()).toThrow(
        'Tried to validate container "some-container", but found violations:\n' +
          ' - Injectable "some-consumer" consumes injection token "some-token" with cardinality "one", but it has no registrations.\n' +
          ' - Injectable "some-consumer" consumes injection token "some-other-token" with cardinality "one-or-many", but it has no registrations.\n' +
          ' - Injectable "some-other-consumer" consumes injection token "some-token" with cardinality "one", but it has no registrations.',
      );
    });
  });

  describe('given a consumption of a v1 token, which carries no cardinality', () => {
    it('when validating, passes and reports the consumption as unverifiable', () => {
      const someV1Token = getInjectionToken({ id: 'some-v1-token' });

      di.register(
        getInjectable2({
          id: 'some-consumer',
          consumptions: [someV1Token],
          instantiate: di => di.inject(someV1Token),
        }),
      );

      expect(di.validate().unverifiableConsumptions).toEqual([
        { injectableId: 'some-consumer', consumptionId: 'some-v1-token' },
      ]);
    });
  });

  describe('given a mix of injectable2 and v1 injectables', () => {
    it('when validating, reports coverage with sorted ids', () => {
      di.register(
        getInjectable2({
          id: 'some-v2-injectable',
          instantiate: () => () => 'irrelevant',
        }),

        getInjectable2({
          id: 'another-v2-injectable',
          instantiate: () => () => 'irrelevant',
        }),

        getInjectable({
          id: 'some-v1-injectable',
          instantiate: () => 'irrelevant',
          lifecycle: lifecycleEnum.transient,
        }),
      );

      expect(di.validate()).toEqual({
        verifiedInjectables: {
          count: 2,
          ids: ['another-v2-injectable', 'some-v2-injectable'],
        },

        unverifiedInjectables: {
          count: 1,
          ids: ['some-v1-injectable'],
        },

        unverifiableConsumptions: [],
      });
    });
  });

  it('holds no state: registering after validating works, and validating again reflects it', () => {
    const someToken = getInjectionToken2({
      id: 'some-token',
      cardinality: 'one',
    })();

    di.register(
      getInjectable2({
        id: 'some-consumer',
        consumptions: [someToken],

        instantiate: di => {
          const getSome = di.inject(someToken);

          return () => getSome();
        },
      }),
    );

    expect(() => di.validate()).toThrow('but it has no registrations');

    di.register(
      getInjectable2({
        id: 'some-implementation',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      }),
    );

    expect(() => di.validate()).not.toThrow();
    expect(di.inject(someToken)).toBe('some-instance');
  });

  describe('given a composition root wiring a token package to an implementation package', () => {
    let someToken;
    let tokenPackage;
    let implementationPackage;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-service-token',
        cardinality: 'one',
      })();

      tokenPackage = getInjectableBunch({
        someConsumer: getInjectable2({
          id: 'some-consumer',
          consumptions: [someToken],

          instantiate: di => {
            const getService = di.inject(someToken);

            return () => `consumed: ${getService()}`;
          },
        }),
      });

      implementationPackage = getInjectableBunch({
        someImplementation: getInjectable2({
          id: 'some-implementation',
          injectionToken: someToken,
          instantiate: () => () => 'service-instance',
        }),
      });
    });

    it('when both are registered, validating passes and reports the coverage', () => {
      di.register(tokenPackage, implementationPackage);

      expect(di.validate()).toEqual({
        verifiedInjectables: {
          count: 2,
          ids: ['some-consumer', 'some-implementation'],
        },

        unverifiedInjectables: { count: 0, ids: [] },
        unverifiableConsumptions: [],
      });

      expect(di.inject(tokenPackage.someConsumer)).toBe(
        'consumed: service-instance',
      );
    });

    it('when the implementation package is forgotten, validating names the gap before anything is injected', () => {
      di.register(tokenPackage);

      expect(() => di.validate()).toThrow(
        'Tried to validate container "some-container", but found violations:\n' +
          ' - Injectable "some-consumer" consumes injection token "some-service-token" with cardinality "one", but it has no registrations.',
      );
    });

    it('when the implementation is deregistered afterwards, validating names exactly that gap', () => {
      di.register(tokenPackage, implementationPackage);
      di.deregister(implementationPackage);

      expect(() => di.validate()).toThrow(
        ' - Injectable "some-consumer" consumes injection token "some-service-token" with cardinality "one", but it has no registrations.',
      );
    });
  });
});
