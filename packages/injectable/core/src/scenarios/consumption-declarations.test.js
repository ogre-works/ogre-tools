import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  getInjectionToken2,
  getSpecificInjectionToken2,
} from '../getInjectionToken2/getInjectionToken2';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import {
  injectionDecoratorToken,
  preInjectCallbackToken,
} from '../dependency-injection-container/tokens';

describe('createContainer.consumption-declarations', () => {
  let di;
  let someToken;
  let someImplementation;

  beforeEach(() => {
    di = createContainer('some-container');

    someToken = getInjectionToken2()({
      id: 'some-token',
      cardinality: 'one',
    });

    someImplementation = getInjectable2({
      id: 'some-implementation',
      injectionToken: someToken,
      instantiate: () => () => 'some-instance',
    });

    di.register(someImplementation);
  });

  describe('given an injectable2 declaring the token it injects', () => {
    it('when injected, the declared token is injectable', () => {
      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someToken],

        instantiate: di => {
          const getSome = di.inject(someToken);

          return () => `consumed: ${getSome()}`;
        },
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toBe('consumed: some-instance');
    });
  });

  describe('given an injectable2 declaring an empty list of consumptions', () => {
    it('when injected, injecting a token throws', () => {
      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [],
        instantiate: di => di.inject(someToken),
      });

      di.register(someConsumer);

      expect(() => di.inject(someConsumer)).toThrow(
        'Tried to inject "some-token" from "some-consumer", but it is not a declared consumption.',
      );
    });
  });

  describe('given an injectable2 declaring no consumptions at all', () => {
    it('when injected, injecting a token throws', () => {
      const someConsumer = getInjectable2({
        id: 'some-consumer',
        instantiate: di => di.inject(someToken),
      });

      di.register(someConsumer);

      expect(() => di.inject(someConsumer)).toThrow(
        'Tried to inject "some-token" from "some-consumer", but it is not a declared consumption.',
      );
    });

    it('when injected, and it injects nothing, works', () => {
      const someConsumer = getInjectable2({
        id: 'some-consumer',
        instantiate: () => () => 'some-instance',
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toBe('some-instance');
    });

    it('when injected, and it injects another injectable by reference, works', () => {
      const someDependency = getInjectable2({
        id: 'some-dependency',
        instantiate: () => () => 'dependency-instance',
      });

      const someConsumer = getInjectable2({
        id: 'some-consumer',

        instantiate: di => {
          const getDependency = di.inject(someDependency);

          return () => `consumed: ${getDependency()}`;
        },
      });

      di.register(someDependency, someConsumer);

      expect(di.inject(someConsumer)).toBe('consumed: dependency-instance');
    });

    it('when injected, and it injects a v1 injectable by reference, works', () => {
      const someV1Dependency = getInjectable({
        id: 'some-v1-dependency',
        instantiate: () => 'v1-instance',
      });

      const someConsumer = getInjectable2({
        id: 'some-consumer',

        instantiate: di => {
          const getDependency = di.inject(someV1Dependency);

          return () => `consumed: ${getDependency()}`;
        },
      });

      di.register(someV1Dependency, someConsumer);

      expect(di.inject(someConsumer)).toBe('consumed: v1-instance');
    });
  });

  describe('exemptions', () => {
    it('given injects made directly on the container, never throws', () => {
      expect(di.inject(someToken)).toBe('some-instance');
      expect(di.injectMany(someToken)).toEqual(['some-instance']);
    });

    it('given a v1 injectable injecting a token, never throws', () => {
      const someV1Consumer = getInjectable({
        id: 'some-v1-consumer',
        instantiate: di => `consumed: ${di.inject(someToken)}`,
        lifecycle: lifecycleEnum.transient,
      });

      di.register(someV1Consumer);

      expect(di.inject(someV1Consumer)).toBe('consumed: some-instance');
    });

    it('given a declared token with several implementations, injecting many instantiates every element', () => {
      const someManyToken = getInjectionToken2()({
        id: 'some-many-token',
        cardinality: 'zero-or-many',
      });

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someManyToken],

        instantiate: di => {
          const getAll = di.injectMany(someManyToken);

          return () => getAll().join(',');
        },
      });

      di.register(
        getInjectable2({
          id: 'first-implementation',
          injectionToken: someManyToken,
          instantiate: () => () => 'first',
        }),

        getInjectable2({
          id: 'second-implementation',
          injectionToken: someManyToken,
          instantiate: () => () => 'second',
        }),

        someConsumer,
      );

      expect(di.inject(someConsumer)).toBe('first,second');
    });

    it('given an injection decorator and a pre-inject callback are registered, a declaring injectable does not trip on the machinery', () => {
      di.register(
        getInjectable2({
          id: 'some-injection-decorator',
          injectionToken: injectionDecoratorToken.for(someToken),
          instantiate: () => () => inject => alias => inject(alias),
        }),

        getInjectable2({
          id: 'some-pre-inject-callback',
          injectionToken: preInjectCallbackToken.for(someToken),
          instantiate: () => () => () => {},
        }),
      );

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someToken],

        instantiate: di => {
          const getSome = di.inject(someToken);

          return () => getSome();
        },
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toBe('some-instance');
    });
  });

  describe('given a general token is declared', () => {
    let someGeneralToken;
    let someConsumer;

    beforeEach(() => {
      someGeneralToken = getInjectionToken2()({
        id: 'some-general-token',
        cardinality: 'zero-or-many',
        specificInjectionTokenFactory: specifier =>
          getSpecificInjectionToken2()({
            id: specifier,
            speciality: specifier,
            cardinality: 'one',
          }),
      });

      someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someGeneralToken],

        instantiate: di => specifier => {
          const getSpecific = di.inject(someGeneralToken.for(specifier));

          return getSpecific();
        },
      });

      di.register(
        someConsumer,

        getInjectable2({
          id: 'specific-implementation',
          injectionToken: someGeneralToken.for('some-specifier'),
          instantiate: () => () => 'specific-instance',
        }),
      );
    });

    it('when injecting a .for() child of it, works', () => {
      expect(di.inject(someConsumer, 'some-specifier')).toBe(
        'specific-instance',
      );
    });

    it('when injecting a .for() child whose specifier is only known at runtime, works', () => {
      const specifierFromRuntime = ['some', 'specifier'].join('-');

      expect(di.inject(someConsumer, specifierFromRuntime)).toBe(
        'specific-instance',
      );
    });

    it('when injecting a grandchild of it, works', () => {
      const grandchildConsumer = getInjectable2({
        id: 'grandchild-consumer',
        consumptions: [someGeneralToken],

        instantiate: di => {
          const getGrandchild = di.inject(someGeneralToken.for('a').for('b'));

          return () => getGrandchild();
        },
      });

      di.register(
        getInjectable2({
          id: 'grandchild-implementation',
          injectionToken: someGeneralToken.for('a').for('b'),
          instantiate: () => () => 'grandchild-instance',
        }),

        grandchildConsumer,
      );

      expect(di.inject(grandchildConsumer)).toBe('grandchild-instance');
    });
  });

  describe('given only a specific token is declared', () => {
    it('when injecting the general token it came from, throws', () => {
      const someGeneralToken = getInjectionToken2()({
        id: 'some-general-token',
        cardinality: 'zero-or-many',
      });

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someGeneralToken.for('some-specifier')],
        instantiate: di => di.injectMany(someGeneralToken),
      });

      di.register(someConsumer);

      expect(() => di.inject(someConsumer)).toThrow(
        'Tried to inject "some-general-token" from "some-consumer", but it is not a declared consumption.',
      );
    });
  });

  describe('given a namespaced injectable', () => {
    it('when injecting an undeclared token, the error names it with its namespace', () => {
      const someNestedConsumer = getInjectable2({
        id: 'some-nested-consumer',
        instantiate: di => di.inject(someToken),
      });

      const someScope = getInjectable2({
        id: 'some-scope',

        instantiate: di => {
          di.register(someNestedConsumer);

          return () => di.inject(someNestedConsumer);
        },
      });

      di.register(someScope);

      expect(() => di.inject(someScope)()).toThrow(
        'Tried to inject "some-token" from "some-scope:some-nested-consumer", but it is not a declared consumption.',
      );
    });
  });

  describe('given a declared v1 token', () => {
    it('when injecting it, works', () => {
      const someV1Token = getInjectionToken({ id: 'some-v1-token' });

      di.register(
        getInjectable({
          id: 'some-v1-implementation',
          injectionToken: someV1Token,
          instantiate: () => 'v1-instance',
          lifecycle: lifecycleEnum.transient,
        }),
      );

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someV1Token],

        instantiate: di => {
          const getV1 = di.inject(someV1Token);

          return () => `consumed: ${getV1()}`;
        },
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toBe('consumed: v1-instance');
    });
  });
});
