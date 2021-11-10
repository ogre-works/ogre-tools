import createContainer from './createContainer';
import lifecycleEnum from './lifecycleEnum';
import castArray from 'lodash/fp/castArray';
import fromPairs from 'lodash/fp/fromPairs';
import keys from 'lodash/fp/keys';
import map from 'lodash/fp/map';
import { pipeline } from '@ogre-tools/fp';

const nonCappedMap = map.convert({ cap: false });

describe('createContainer', () => {
  it('injects auto-registered injectable without sub-injectables', () => {
    const injectableStub = {
      instantiate: () => 'some-injected-instance',
    };

    const di = getDi(injectableStub);

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given injectable does not specify aliases and manually registered, when injecting, does not throw', () => {
    const instantiateStub = () => 'some-instance';

    const di = getDi();

    di.register({
      id: 'irrelevant',
      instantiate: instantiateStub,
    });

    const actual = di.inject(instantiateStub);

    expect(actual).toBe('some-instance');
  });

  it('injects auto-registered injectable with a another auto-registered child-injectable', () => {
    const childInjectable = {
      instantiate: () => 'some-child-instance',
    };

    const parentInjectable = {
      instantiate: di => di.inject(childInjectable),
    };

    const di = getDi(childInjectable, parentInjectable);

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given async child-injectable as dependency, when injected, parent-injectable receives child as sync', async () => {
    const asyncChildInjectable = {
      instantiate: () =>
        Promise.resolve({
          someProperty: `some-child-instance`,
        }),
    };

    const parentInjectable = {
      getDependencies: di => ({
        syncChild: di.inject(asyncChildInjectable),
      }),

      instantiate: dependencies => dependencies.syncChild.someProperty,
    };

    const di = getDi(asyncChildInjectable, parentInjectable);

    const actual = await di.inject(
      parentInjectable,
      'some-instantiation-parameter',
    );

    expect(actual).toBe('some-child-instance');
  });

  it('given injectable with dependencies, when injected, injectable receives instantiation parameter for both getting dependencies and instantiation', async () => {
    const someInjectable = {
      getDependencies: (di, instantiationParameter) => ({
        someDependency: `some-instance/${instantiationParameter}-from-getDependencies`,
      }),

      instantiate: (dependencies, instantiationParameter) =>
        `${dependencies.someDependency}/${instantiationParameter}-from-instantiate`,
    };

    const di = getDi(someInjectable);

    const actual = await di.inject(
      someInjectable,
      'some-instantiation-parameter',
    );

    expect(actual).toBe(
      'some-instance/some-instantiation-parameter-from-getDependencies/some-instantiation-parameter-from-instantiate',
    );
  });

  it('given an alias for injectable, injects', () => {
    const someInjectable = {
      instantiate: () => 'some-instance',
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('some-instance');
  });

  it('given instantiate-function as alias for injectable, injects', () => {
    const someInstantiate = () => 'some-instance';

    const someInjectable = {
      instantiate: someInstantiate,
    };

    const di = getDi(someInjectable);

    const actual = di.inject(someInstantiate);

    expect(actual).toBe('some-instance');
  });

  it('when injecting with a parameter, injects using the parameter', () => {
    const someInjectable = {
      instantiate: (_, instantiationParameter) => instantiationParameter,
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    const actual = di.inject('some-alias', 'some-instantiation-parameter');

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given multiple aliases for singleton injectable, injects same instance using all keys', () => {
    const someInjectable = {
      instantiate: () => ({}),
      aliases: ['some-alias', 'some-other-alias'],
      lifecycle: lifecycleEnum.singleton,
    };

    const di = getDi(someInjectable);

    const actual1 = di.inject('some-alias');
    const actual2 = di.inject('some-other-alias');

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is overridden, injects the overridden injectable', () => {
    const childInjectable = {
      instantiate: () => 'irrelevant',
    };

    const parentInjectable = {
      instantiate: di => di.inject(childInjectable),
    };

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given an injectable with self-injecting setup is overridden, when setups are ran, injects the override in setup', () => {
    const someInjectable = {
      id: 'some-injectable-id',

      setup: di => {
        const self = di.inject('some-alias');

        self.setupped = true;
      },

      instantiate: () => {
        throw new Error('Should not go here');
      },

      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    const someInjectableOverride = {};

    di.override('some-alias', someInjectableOverride);

    di.runSetups();

    expect(someInjectableOverride.setupped).toBe(true);
  });

  it('given an injectable instantiates a class and dependencies, when injected, instantiates a "new" instance of the class with dependencies and instantiation parameter"', () => {
    class SomeClass {
      constructor(...args) {
        this.constructorArgs = args;
      }
    }

    const someInjectable = {
      id: 'some-injectable-id',
      getDependencies: () => ({ someDependency: 'some-value' }),
      Model: SomeClass,
    };

    const di = getDi(someInjectable);

    const actual = di.inject(SomeClass, 'some-instantiation-parameter');

    expect(actual).toEqual({
      constructorArgs: [
        { someDependency: 'some-value' },
        'some-instantiation-parameter',
      ],
    });
  });

  it('given an injectable instantiates a class without dependencies, when injected, instantiates a "new" instance of the class with just the instantiation parameter"', () => {
    class SomeClass {
      constructor(...args) {
        this.constructorArgs = args;
      }
    }

    const someInjectable = {
      id: 'some-injectable-id',
      Model: SomeClass,
    };

    const di = getDi(someInjectable);

    const actual = di.inject(SomeClass, 'some-instantiation-parameter');

    expect(actual).toEqual({
      constructorArgs: ['some-instantiation-parameter'],
    });
  });

  it('given an injectable does not specify ID, when manually registered, throws', () => {
    const di = getDi();

    const someInjectable = {
      id: undefined,
      instantiate: () => 'irrelevant',
    };

    expect(() => {
      di.register(someInjectable);
    }).toThrow('Tried to register injectable without ID.');
  });

  it('given an injectable is overridden twice, injects the last overridden injectable', () => {
    const childInjectable = {
      instantiate: () => 'irrelevant',
    };

    const parentInjectable = {
      instantiate: di => di.inject(childInjectable),
    };

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, 'irrelevant');
    di.override(childInjectable, 'some-reoverridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-reoverridden-value');
  });

  it('given an injectable with alias is overridden, when injecting using alias, injects the overridden injectable', () => {
    const childInjectable = {
      instantiate: () => 'irrelevant',
      aliases: ['some-alias'],
    };

    const parentInjectable = {
      instantiate: di => di.inject(childInjectable),
    };

    const di = getDi(childInjectable, parentInjectable);

    di.override('some-alias', 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given an injectable is overridden, but overrides are reset, injects the original injectable', () => {
    const childInjectable = {
      instantiate: () => 'some-original-value',
    };

    const parentInjectable = {
      instantiate: di => di.inject(childInjectable),
    };

    const di = getDi(childInjectable, parentInjectable);

    const overridingChildInjectable = {
      instantiate: () => 'irrelevant',
    };

    di.override(childInjectable, overridingChildInjectable);

    di.reset();

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable is overridden, but then unoverriden, injects the original injectable', () => {
    const someInjectable = {
      instantiate: () => 'some-original-value',
    };

    const di = getDi(someInjectable);

    di.override(someInjectable, 'irrelevant');

    di.unoverride(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable is overridden using an alias, but then unoverriden, injects the original injectable', () => {
    const someInjectable = {
      instantiate: () => 'some-original-value',
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    di.override('some-alias', 'irrelevant');

    di.unoverride('some-alias');

    const actual = di.inject('some-alias');

    expect(actual).toBe('some-original-value');
  });

  it('when overriding non-registered injectable, throws', () => {
    const di = getDi();

    expect(() => {
      di.override('some-non-existing-injectable', () => 'irrelevant');
    }).toThrow(
      'Tried to override "some-non-existing-injectable" which is not registered.',
    );
  });

  it('when overriding non-registered injectable using a symbol, throws', () => {
    const di = getDi();

    const symbol = Symbol('some-symbol');

    expect(() => {
      di.override(symbol, () => 'irrelevant');
    }).toThrow(
      'Tried to override "Symbol(some-symbol)" which is not registered.',
    );
  });

  it('when injecting non-registered injectable, throws', () => {
    const di = getDi();

    expect(() => {
      di.inject('some-non-existing-injectable');
    }).toThrow(
      'Tried to inject non-registered injectable "some-non-existing-injectable".',
    );
  });

  it('when injecting non-registered injectable using a symbol, throws', () => {
    const di = getDi();

    expect(() => {
      const symbol = Symbol('some-symbol');
      di.inject(symbol);
    }).toThrow(
      'Tried to inject non-registered injectable "Symbol(some-symbol)".',
    );
  });

  it('given an injectable is singleton, when injected multiple times, injects singleton', () => {
    const singletonInjectable = {
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    };

    const di = getDi(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);
    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is not singleton, when injected multiple times, injects as transient', () => {
    const transientInjectable = {
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.transient,
    };

    const di = getDi(transientInjectable);

    const actual1 = di.inject(transientInjectable);
    const actual2 = di.inject(transientInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given lifecycle is not specified, when injected multiple times, injects as singleton as default', () => {
    const singletonInjectable = {
      instantiate: () => ({}),
      lifecycle: undefined,
    };

    const di = getDi(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);
    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is transient, when injected with instantiation parameter, instantiates using the parameter', () => {
    const transientInjectable = {
      instantiate: (_, instantiationParameter) => instantiationParameter,
      lifecycle: lifecycleEnum.transient,
    };

    const di = getDi(transientInjectable);

    const actual = di.inject(
      transientInjectable,
      'some-instantiation-parameter',
    );

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given setup for injectable, when setups are ran, runs the setup with the DI', () => {
    const setupMock = jest.fn();

    const someInjectable = {
      setup: setupMock,
    };

    const someInjectableWithoutSetup = {};

    const di = getDi(someInjectable, someInjectableWithoutSetup);

    di.runSetups();

    expect(setupMock).toHaveBeenCalledWith(di);
  });

  it('given setup for injectable with aliases but no way to instantiate, when setups are ran, runs setup only once', () => {
    const setupMock = jest.fn();

    const someInjectable = {
      setup: setupMock,
      aliases: ['some-alias', 'some-other-alias'],
    };

    const di = getDi(someInjectable);

    di.runSetups();

    expect(setupMock).toHaveBeenCalledTimes(1);
  });

  it('given injectable with setup but no way to instantiate, when injected, throws', () => {
    const someInjectable = {
      setup: () => {},
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    di.runSetups();

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject "stubbed-require-context-key-0" when instantiation is not defined.',
    );
  });

  it('given injectable with setup but setups have not been ran, when injected, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      setup: () => {},
      instantiate: () => {},
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject setuppable "some-injectable-id" before setups are ran.',
    );
  });

  it('given injectable with setup that injects itself, when running setups, does not throw', () => {
    const someInjectable = {
      id: 'some-injectable-id',

      setup: di => {
        const instance = di.inject('some-alias');

        instance.someProperty = 'some-value';
      },

      instantiate: () => ({}),
      aliases: ['some-alias'],
    };

    const di = getDi(someInjectable);

    di.runSetups();

    const actual = di.inject('some-alias');

    expect(actual).toEqual({ someProperty: 'some-value' });
  });

  it('given injectable with setup that injects other injectable with setup, when running setups, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      setup: di => {
        di.inject(someOtherInjectable);
      },

      instantiate: () => {},
    };

    const someOtherInjectable = {
      id: 'some-other-injectable-id',
      setup: () => {},
      instantiate: () => {},
    };

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.runSetups();
    }).toThrow(
      'Tried to inject setuppable "some-other-injectable-id" before setups are ran.',
    );
  });

  it('given multiple injectables with same alias, but no way to demonstrate viability, when injected, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: undefined,
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => {},
      instantiate: () => 'irrelevant',
    };

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with no way to demonstrate viability for "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given multiple injectables with same alias, one of which is viable, when injected, injects viable instance', () => {
    const someInjectable = {
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'viable-instance',
    };

    const di = getDi(someInjectable, someOtherInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('viable-instance');
  });

  it('given multiple injectables with same alias, one of which is viable, given overridden, when injected, injects overridden instance', () => {
    const someInjectable = {
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    };

    const di = getDi(someInjectable, someOtherInjectable);

    di.override('some-alias', 'overridden-instance');

    const actual = di.inject('some-alias');

    expect(actual).toBe('overridden-instance');
  });

  it('given multiple injectables with same alias, one of which is viable by considering a third injectable, injects viable instance', () => {
    const someThirdInjectable = {
      aliases: ['third-injectable-alias'],
      instantiate: () => 'third-injectable-instance',
    };

    const someInjectable = {
      aliases: ['some-alias'],
      viability: di =>
        di.inject('third-injectable-alias') !== 'third-injectable-instance',
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      aliases: ['some-alias'],
      viability: di =>
        di.inject('third-injectable-alias') === 'third-injectable-instance',
      instantiate: () => 'viable-instance',
    };

    const di = getDi(someInjectable, someOtherInjectable, someThirdInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('viable-instance');
  });

  it('given multiple injectables with same alias, all of which are unviable, when injected, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    };

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with no viability within "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given multiple injectables with same alias, all of which are viable, when injected, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    };

    const someOtherInjectable = {
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    };

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with non-singular viability within "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given single injectable, but unviable, when injected, throws', () => {
    const someInjectable = {
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    };

    const di = getDi(someInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject injectable with no viability for "some-injectable-id"',
    );
  });

  it('given in side effects are not prevented, when injecting injectable which causes side effects, does not throw', () => {
    const di = getDi({
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const actual = di.inject('some-alias');

    expect(actual).toBe('some-instance');
  });

  it('given side effects are prevented, when injecting, throws', () => {
    const di = getDi({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    di.preventSideEffects();

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject "some-injectable-id" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented, but then permitted for an injectable, when injecting, does not throw', () => {
    const di = getDi({
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    di.preventSideEffects();

    di.permitSideEffects('some-alias');

    expect(() => {
      di.inject('some-alias');
    }).not.toThrow();
  });

  describe('given lifecycle is scoped transient', () => {
    let di;

    beforeEach(() => {
      const someInjectableForScope = {
        aliases: ['some-alias-for-scope'],
        instantiate: () => 'some-scope',
      };

      const someInjectable = {
        aliases: ['some-alias'],
        instantiate: () => ({}),
        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject('some-alias-for-scope'),
        ),
      };

      const someOtherInjectable = {
        aliases: ['some-other-alias'],
        instantiate: () => ({}),
        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject('some-alias-for-scope'),
        ),
      };

      di = getDi(someInjectable, someInjectableForScope, someOtherInjectable);
    });

    it('given unchanging scope, when injected, returns same instance', () => {
      const actual = di.inject('some-alias');
      const actual2 = di.inject('some-alias');

      expect(actual).toBe(actual2);
    });

    it('given one scope and injected and given other scope, when injected again, returns different instance', () => {
      const actual = di.inject('some-alias');

      di.override('some-alias-for-scope', 'some-other-scope');

      const actual2 = di.inject('some-alias');

      expect(actual).not.toBe(actual2);
    });

    it('given an original scope and injected and given other scope and injected, given the original scope again, when injected, returns different instance', () => {
      const actual = di.inject('some-alias');

      di.override('some-alias-for-scope', 'some-other-scope');

      di.inject('some-alias');

      di.override('some-alias-for-scope', 'some-scope');

      const actual2 = di.inject('some-alias');

      expect(actual).not.toBe(actual2);
    });

    it('given different injectables with identical scope, when injected, handles the scopes privately for the injectables', () => {
      const actual = di.inject('some-alias');

      const actual2 = di.inject('some-other-alias');

      expect(actual).not.toBe(actual2);
    });
  });
});

const getDi = (...injectables) => {
  const listOfGetRequireContexts = injectables.map(getRequireContextStub);

  return createContainer(...listOfGetRequireContexts);
};

const getRequireContextStub = files => {
  const contextDictionary = pipeline(
    files,
    castArray,
    map(file => ({ default: file })),
    nonCappedMap((file, index) => [
      `stubbed-require-context-key-${index}`,
      file,
    ]),
    fromPairs,
  );

  const contextStub = contextKey => contextDictionary[contextKey];

  contextStub.keys = () => keys(contextDictionary);

  return () => contextStub;
};
