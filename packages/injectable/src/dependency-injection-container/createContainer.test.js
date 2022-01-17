import asyncFn from '@async-fn/jest';
import createContainer from './createContainer';
import fromPairs from 'lodash/fp/fromPairs';
import keys from 'lodash/fp/keys';
import lifecycleEnum from './lifecycleEnum';
import map from 'lodash/fp/map';
import { pipeline } from '@ogre-tools/fp';
import getInjectionToken from '../getInjectionToken/getInjectionToken';
import getInjectable from '../getInjectable/getInjectable';
import getPromiseStatus from '../test-utils/getPromiseStatus/getPromiseStatus';

const nonCappedMap = map.convert({ cap: false });

describe('createContainer', () => {
  it('injects auto-registered injectable without sub-injectables', () => {
    const injectableStub = getInjectable({
      instantiate: () => 'some-injected-instance',
    });

    const di = getDi(injectableStub);

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given injectable does not specify aliases and manually registered, when injecting, does not throw', () => {
    const instantiateStub = () => 'some-instance';

    const di = getDi();

    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: instantiateStub,
    });

    di.register(someInjectable);

    const actual = di.inject(instantiateStub);

    expect(actual).toBe('some-instance');
  });

  it('injects auto-registered injectable with a another auto-registered child-injectable', () => {
    const childInjectable = getInjectable({
      instantiate: () => 'some-child-instance',
    });

    const parentInjectable = getInjectable({
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given async child-injectable as dependency, when injected, parent-injectable receives child as sync', async () => {
    const asyncChildInjectable = getInjectable({
      instantiate: () =>
        Promise.resolve({
          someProperty: `some-child-instance`,
        }),
    });

    const parentInjectable = getInjectable({
      instantiate: async di => {
        const childInjectable = await di.inject(asyncChildInjectable);

        return childInjectable.someProperty;
      },
    });

    const di = getDi(asyncChildInjectable, parentInjectable);

    const actual = await di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given an alias for injectable, injects', () => {
    const someInjectable = getInjectable({
      instantiate: () => 'some-instance',
      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('some-instance');
  });

  it('given instantiate-function as alias for injectable, injects', () => {
    const someInstantiate = () => 'some-instance';

    const someInjectable = getInjectable({
      instantiate: someInstantiate,
    });

    const di = getDi(someInjectable);

    const actual = di.inject(someInstantiate);

    expect(actual).toBe('some-instance');
  });

  it('when injecting with a parameter, injects using the parameter', () => {
    const someInjectable = getInjectable({
      instantiate: (_, instantiationParameter) => instantiationParameter,
      aliases: ['some-alias'],
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(someInjectable);

    const actual = di.inject('some-alias', 'some-instantiation-parameter');

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given multiple aliases for singleton injectable, injects same instance using all keys', () => {
    const someInjectable = getInjectable({
      instantiate: () => ({}),
      aliases: ['some-alias', 'some-other-alias'],
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(someInjectable);

    const actual1 = di.inject('some-alias');
    const actual2 = di.inject('some-other-alias');

    expect(actual1).toBe(actual2);
  });

  it('given multiple containers and shared singleton, when injected from different containers, injects different instance', () => {
    const someInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di1 = getDi(someInjectable);
    const di2 = getDi(someInjectable);

    const actual1 = di1.inject(someInjectable);
    const actual2 = di2.inject(someInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given multiple containers and shared scoped-transient, when injected from different containers using same scope, injects different instance', () => {
    const someInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.scopedTransient(() => 'some-scope'),
    });

    const di1 = getDi(someInjectable);
    const di2 = getDi(someInjectable);

    const actual1 = di1.inject(someInjectable);
    const actual2 = di2.inject(someInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given sync injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-id',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-id',
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-id" -> "some-child-id" -> "some-parent-id"',
    );
  });

  it('given async injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-id',
      instantiate: async di => await di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-id',
      instantiate: async di => await di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    const actualPromise = di.inject(parentInjectable);

    return expect(actualPromise).rejects.toThrow(
      'Cycle of injectables encountered: "some-parent-id" -> "some-child-id" -> "some-parent-id"',
    );
  });

  it('given injectables with a dependency cycle, when injected with bogus context, throws error without bogus context', () => {
    const childInjectable = getInjectable({
      id: 'some-child-id',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-id',
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable, undefined, ['some-bogus-context']);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-id" -> "some-child-id" -> "some-parent-id"',
    );
  });

  it('given an injectable is overridden, injects the overridden injectable', () => {
    const childInjectable = getInjectable({
      instantiate: () => {
        throw Error('Should not come here');
      },
    });

    const parentInjectable = getInjectable({
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given transient and overridden, when injected with instantiation parameter, provides override with way to inject using instantiation parameter', () => {
    const someInjectable = getInjectable({
      instantiate: () => 'irrelevant',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      instantiate: (_, instantiationParameter) => instantiationParameter,
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(someInjectable, someOtherInjectable);

    di.override(someInjectable, (di, instantiationParameter) =>
      di.inject(someOtherInjectable, instantiationParameter),
    );

    const actual = di.inject(someInjectable, 'some-instantiation-parameter');

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given singleton and overridden, when injected, provides override with way to inject', () => {
    const someInjectable = getInjectable({
      instantiate: () => 'some-instance',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      instantiate: () => 'some-other-instance',
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(someInjectable, someOtherInjectable);

    di.override(someInjectable, di => di.inject(someOtherInjectable));

    const actual = di.inject(someInjectable, 'some-other-instance');

    expect(actual).toBe('some-other-instance');
  });

  it('given an injectable with self-injecting setup is overridden, when setups are ran, injects the override in setup', async () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',

      setup: di => {
        const self = di.inject('some-alias');

        self.setupped = true;
      },

      instantiate: () => {
        throw new Error('Should not go here');
      },

      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    const someInjectableOverride = getInjectable({});

    di.override('some-alias', () => someInjectableOverride);

    await di.runSetups();

    expect(someInjectableOverride.setupped).toBe(true);
  });

  it('given an injectable does not specify ID, when manually registered, throws', () => {
    const di = getDi();

    const someInjectable = getInjectable({
      id: undefined,
      instantiate: () => 'irrelevant',
    });

    expect(() => {
      di.register(someInjectable);
    }).toThrow('Tried to register injectable without ID.');
  });

  it('given an injectable is overridden twice, injects the last overridden injectable', () => {
    const childInjectable = getInjectable({
      instantiate: () => 'irrelevant',
    });

    const parentInjectable = getInjectable({
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'irrelevant');
    di.override(childInjectable, () => 'some-reoverridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-reoverridden-value');
  });

  it('given an injectable with alias is overridden, when injecting using alias, injects the overridden injectable', () => {
    const childInjectable = getInjectable({
      instantiate: () => 'irrelevant',
      aliases: ['some-alias'],
    });

    const parentInjectable = getInjectable({
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override('some-alias', () => 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given an injectable is overridden, but overrides are reset, injects the original injectable', () => {
    const childInjectable = getInjectable({
      instantiate: () => 'some-original-value',
    });

    const parentInjectable = getInjectable({
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'irrelevant');

    di.reset();

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable is overridden, but then unoverriden, injects the original injectable', () => {
    const someInjectable = getInjectable({
      instantiate: () => 'some-original-value',
    });

    const di = getDi(someInjectable);

    di.override(someInjectable, () => 'irrelevant');

    di.unoverride(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable is overridden using an alias, but then unoverriden, injects the original injectable', () => {
    const someInjectable = getInjectable({
      instantiate: () => 'some-original-value',
      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    di.override('some-alias', () => 'irrelevant');

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
    const singletonInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);
    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is does not specify lifecycle, when injected multiple times, defaults to injecting singleton', () => {
    const injectable = getInjectable({
      module: { filename: 'irrelevant' },
      instantiate: () => ({}),
    });

    const di = getDi(injectable);

    const actual1 = di.inject(injectable);
    const actual2 = di.inject(injectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is not singleton, when injected multiple times, injects as transient', () => {
    const transientInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(transientInjectable);

    const actual1 = di.inject(transientInjectable);
    const actual2 = di.inject(transientInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given lifecycle is not specified, when injected multiple times, injects as singleton as default', () => {
    const singletonInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: undefined,
    });

    const di = getDi(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);
    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given setup for injectable, when setups are ran, runs the setup with a way to inject', async () => {
    let instanceFromSetup;

    const someSetuppable = getInjectable({
      setup: di => {
        instanceFromSetup = di.inject(
          someInjectable,
          'some-parameter',
          'irrelevant',
        );
      },
    });

    const someInjectable = getInjectable({
      lifecycle: lifecycleEnum.transient,
      instantiate: (di, parameter) => `some-instance: "${parameter}"`,
    });

    const di = getDi(someSetuppable, someInjectable);

    await di.runSetups();

    expect(instanceFromSetup).toBe('some-instance: "some-parameter"');
  });

  it('given multiple async setuppables and DI-setups are ran, when setups resolve, DI-setup resolves', async () => {
    const someSetuppable = {
      setup: asyncFn(),
    };

    const someOtherSetuppable = {
      setup: asyncFn(),
    };

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();
    someOtherSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(true);
  });

  it('given multiple async setuppables and DI-setups are ran, when only some of the setups resolve, DI-setup does not resolve', async () => {
    const someSetuppable = {
      setup: asyncFn(),
    };

    const someOtherSetuppable = {
      setup: asyncFn(),
    };

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(false);
  });

  it('given setup for injectable with aliases but no way to instantiate, when setups are ran, runs setup only once', async () => {
    const setupMock = jest.fn();

    const someInjectable = getInjectable({
      setup: setupMock,
      aliases: ['some-alias', 'some-other-alias'],
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    expect(setupMock).toHaveBeenCalledTimes(1);
  });

  it('given injectable with setup but no way to instantiate, when injected, throws', async () => {
    const someInjectable = getInjectable({
      setup: () => {},
      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject "stubbed-require-context-key-0" when instantiation is not defined.',
    );
  });

  it('given injectable with setup but setups have not been ran, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      setup: () => {},
      instantiate: () => {},
      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject setuppable "some-injectable-id" before setups are ran.',
    );
  });

  it('given injectable with setup that injects itself, when running setups, does not throw', async () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',

      setup: di => {
        const instance = di.inject('some-alias');

        instance.someProperty = 'some-value';
      },

      instantiate: () => ({}),
      aliases: ['some-alias'],
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    const actual = di.inject('some-alias');

    expect(actual).toEqual({ someProperty: 'some-value' });
  });

  it('given injectable with setup that injects other injectable with setup, when running setups, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      setup: di => {
        di.inject(someOtherInjectable);
      },

      instantiate: () => {},
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable-id',
      setup: () => {},
      instantiate: () => {},
    });

    const di = getDi(someInjectable, someOtherInjectable);

    return expect(di.runSetups()).rejects.toThrow(
      'Tried to inject setuppable "some-other-injectable-id" before setups are ran.',
    );
  });

  it('given multiple injectables with same alias, but no way to demonstrate viability, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: undefined,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => {},
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with no way to demonstrate viability for "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given multiple injectables with same alias, one of which is viable, when injected, injects viable instance', () => {
    const someInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'viable-instance',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('viable-instance');
  });

  it('given multiple injectables with same alias, one of which is viable, given overridden, when injected, injects overridden instance', () => {
    const someInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    di.override('some-alias', () => 'overridden-instance');

    const actual = di.inject('some-alias');

    expect(actual).toBe('overridden-instance');
  });

  it('given multiple injectables with same alias, one of which is viable by considering a third injectable, injects viable instance', () => {
    const someThirdInjectable = getInjectable({
      aliases: ['third-injectable-alias'],
      instantiate: () => 'third-injectable-instance',
    });

    const someInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: di =>
        di.inject('third-injectable-alias') !== 'third-injectable-instance',
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      aliases: ['some-alias'],
      viability: di =>
        di.inject('third-injectable-alias') === 'third-injectable-instance',
      instantiate: () => 'viable-instance',
    });

    const di = getDi(someInjectable, someOtherInjectable, someThirdInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('viable-instance');
  });

  it('given multiple injectables with same alias, all of which are unviable, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with no viability within "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given multiple injectables with same alias, all of which are viable, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable-id',
      aliases: ['some-alias'],
      viability: () => true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject one of multiple injectables with non-singular viability within "some-injectable-id", "some-other-injectable-id"',
    );
  });

  it('given single injectable, but unviable, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      viability: () => false,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject injectable with no viability for "some-injectable-id"',
    );
  });

  it('given in side effects are not prevented, when injecting injectable which causes side effects, does not throw', () => {
    const someInjectable = getInjectable({
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const di = getDi(someInjectable);

    const actual = di.inject('some-alias');

    expect(actual).toBe('some-instance');
  });

  it('given side effects are prevented, when injecting, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-id',
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    expect(() => {
      di.inject('some-alias');
    }).toThrow(
      'Tried to inject "some-injectable-id" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented, but then permitted for an injectable, when injecting, does not throw', () => {
    const someInjectable = getInjectable({
      aliases: ['some-alias'],
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    di.permitSideEffects('some-alias');

    expect(() => {
      di.inject('some-alias');
    }).not.toThrow();
  });

  describe('given lifecycle is scoped transient', () => {
    let di;

    beforeEach(() => {
      const someInjectableForScope = getInjectable({
        aliases: ['some-alias-for-scope'],
        instantiate: () => 'some-scope',
      });

      const someInjectable = getInjectable({
        aliases: ['some-alias'],
        instantiate: () => ({}),
        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject('some-alias-for-scope'),
        ),
      });

      const someOtherInjectable = getInjectable({
        aliases: ['some-other-alias'],
        instantiate: () => ({}),
        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject('some-alias-for-scope'),
        ),
      });

      di = getDi(someInjectable, someInjectableForScope, someOtherInjectable);
    });

    it('given unchanging scope, when injected, returns same instance', () => {
      const actual = di.inject('some-alias');
      const actual2 = di.inject('some-alias');

      expect(actual).toBe(actual2);
    });

    it('given one scope and injected and given other scope, when injected again, returns different instance', () => {
      const actual = di.inject('some-alias');

      di.override('some-alias-for-scope', () => 'some-other-scope');

      const actual2 = di.inject('some-alias');

      expect(actual).not.toBe(actual2);
    });

    it('given an original scope and injected and given other scope and injected, given the original scope again, when injected, returns different instance', () => {
      const actual = di.inject('some-alias');

      di.override('some-alias-for-scope', () => 'some-other-scope');

      di.inject('some-alias');

      di.override('some-alias-for-scope', () => 'some-scope');

      const actual2 = di.inject('some-alias');

      expect(actual).not.toBe(actual2);
    });

    it('given different injectables with identical scope, when injected, handles the scopes privately for the injectables', () => {
      const actual = di.inject('some-alias');

      const actual2 = di.inject('some-other-alias');

      expect(actual).not.toBe(actual2);
    });
  });

  it('given singleton, when injecting with instantiation parameter, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-id',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject('some-id', { some: 'instantiation parameter' });
    }).toThrow(
      'Tried to inject singleton "some-id" with instantiation parameters.',
    );
  });

  it('given injectable, when DI is asked for lifecycle, returns lifecycle', () => {
    const someInjectable = getInjectable({
      id: 'some-id',
      instantiate: () => ({}),
      lifecycle: { some: 'lifecycle' },
    });

    const di = getDi(someInjectable);

    const lifecycle = di.getLifecycle(someInjectable);

    expect(lifecycle).toEqual({ some: 'lifecycle' });
  });

  it('given an injectable is singleton and injected but purged, when injected, injects new instance', () => {
    const singletonInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);

    di.purge(singletonInjectable);

    const actual2 = di.inject(singletonInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given an injectable is singleton and injected but unrelated singleton is purged, when injected, injects singleton', () => {
    const singletonInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const unrelatedSingletonInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(singletonInjectable, unrelatedSingletonInjectable);

    const actual1 = di.inject(singletonInjectable);

    di.purge(unrelatedSingletonInjectable);

    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is transient, when purged, throws', () => {
    const transientInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(transientInjectable);

    expect(() => {
      di.purge(transientInjectable);
    }).toThrow('Tried to purge injectable with transient lifecycle.');
  });

  it('given an injectable is scoped transient and injected but purged, when injected, injects new instance', () => {
    const scopedTransientInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.scopedTransient(() => 'some-scope'),
    });

    const di = getDi(scopedTransientInjectable);

    const actual1 = di.inject(scopedTransientInjectable);

    di.purge(scopedTransientInjectable);

    const actual2 = di.inject(scopedTransientInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given an injectable is scoped transient and injected but unrelated scoped transient is purged, when injected, injects same instance', () => {
    const scopedTransientInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.scopedTransient(() => 'some-scope'),
    });

    const unrelatedScopedTransientInjectable = getInjectable({
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.scopedTransient(() => 'some-scope'),
    });

    const di = getDi(
      scopedTransientInjectable,
      unrelatedScopedTransientInjectable,
    );

    const actual1 = di.inject(scopedTransientInjectable);

    di.purge(unrelatedScopedTransientInjectable);

    const actual2 = di.inject(scopedTransientInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given injectable with injection token, when injected using injection token, injects', () => {
    const injectionToken = getInjectionToken();

    const someInjectable = getInjectable({
      instantiate: () => 'some-instance',
      injectionToken: injectionToken,
    });

    const di = getDi(someInjectable);

    expect(di.inject(injectionToken)).toBe('some-instance');
  });
});

const getDi = (...injectables) => {
  const requireContextStub = getRequireContextStub(...injectables);

  return createContainer(requireContextStub);
};

const getRequireContextStub = (...injectables) => {
  const contextDictionary = pipeline(
    injectables,
    map(injectable => ({ default: injectable })),
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
