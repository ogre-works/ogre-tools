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
      module: { filename: 'irrelevant' },
      instantiate: () => 'some-injected-instance',
    });

    const di = getDi(injectableStub);

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given manually registered injectable, when injecting, injects', () => {
    const di = getDi();

    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('injects auto-registered injectable with a another auto-registered child-injectable', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      instantiate: () => 'some-child-instance',
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given async child-injectable as dependency, when injected, parent-injectable receives child as sync', async () => {
    const asyncChildInjectable = getInjectable({
      module: { filename: 'some-child-injectable-filename' },

      instantiate: () =>
        Promise.resolve({
          someProperty: `some-child-instance`,
        }),
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-parent-injectable-filename' },

      instantiate: async di => {
        const childInjectable = await di.inject(asyncChildInjectable);

        return childInjectable.someProperty;
      },
    });

    const di = getDi(asyncChildInjectable, parentInjectable);

    const actual = await di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('when injecting with a parameter, injects using the parameter', () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
      instantiate: (_, instantiationParameter) => instantiationParameter,
      lifecycle: lifecycleEnum.transient,
    });

    const di = getDi(someInjectable);

    const actual = di.inject(someInjectable, 'some-instantiation-parameter');

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given multiple containers and shared singleton, when injected from different containers, injects different instance', () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
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
      module: { filename: 'some-child-injectable' },
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-parent-injectable' },
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given async injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-child-injectable' },
      instantiate: async di => await di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-parent-injectable' },
      instantiate: async di => await di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    const actualPromise = di.inject(parentInjectable);

    return expect(actualPromise).rejects.toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given injectables with a dependency cycle, when injected with bogus context, throws error without bogus context', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-child-injectable' },
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-parent-injectable' },
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable, undefined, ['some-bogus-context']);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given an injectable is overridden, injects the overridden injectable', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },

      instantiate: () => {
        throw Error('Should not come here');
      },
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },

      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given transient and overridden, when injected with instantiation parameter, provides override with way to inject using instantiation parameter', () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      instantiate: () => 'irrelevant',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
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
      module: { filename: 'some-injectable-filename' },
      instantiate: () => 'some-instance',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
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
      module: { filename: 'irrelevant' },

      setup: di => {
        const self = di.inject(someInjectable);

        self.setupped = true;
      },

      instantiate: () => {
        throw new Error('Should not go here');
      },
    });

    const di = getDi(someInjectable);

    const someInjectableOverride = getInjectable({
      module: { filename: 'irrelevant' },
    });

    di.override(someInjectable, () => someInjectableOverride);

    await di.runSetups();

    expect(someInjectableOverride.setupped).toBe(true);
  });

  it('given an injectable does not specify module, when manually registered, throws', () => {
    const di = getDi();

    const someInjectable = getInjectable({
      module: undefined,
      instantiate: () => 'irrelevant',
    });

    expect(() => {
      di.register(someInjectable);
    }).toThrow('Tried to register injectable without module.');
  });

  it('given an injectable is overridden twice, injects the last overridden injectable', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      instantiate: () => 'irrelevant',
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'irrelevant');
    di.override(childInjectable, () => 'some-reoverridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-reoverridden-value');
  });

  it('given an injectable is overridden, but overrides are reset, injects the original injectable', () => {
    const childInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      instantiate: () => 'some-original-value',
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
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
      module: { filename: 'irrelevant' },
      instantiate: () => 'some-original-value',
    });

    const di = getDi(someInjectable);

    di.override(someInjectable, () => 'irrelevant');

    di.unoverride(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('when overriding non-registered injectable, throws', () => {
    const di = getDi();

    const injectable = getInjectable({
      module: { filename: 'some-non-registered-injectable-filename' },
    });

    expect(() => {
      di.override(injectable, () => 'irrelevant');
    }).toThrow(
      'Tried to override "some-non-registered-injectable-filename" which is not registered.',
    );
  });

  it('when injecting non-registered injectable, throws', () => {
    const someNonRegisteredInjectable = getInjectable({
      module: { filename: 'some-non-registered-injectable-filename' },
    });

    const di = getDi();

    expect(() => {
      di.inject(someNonRegisteredInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-non-registered-injectable-filename".',
    );
  });

  it('when injecting nested non-registered injectable, throws with chain of injectables', () => {
    const someNonRegisteredInjectable = getInjectable({
      module: { filename: 'some-non-registered-injectable-filename' },
      instantiate: () => 'irrelevant',
    });

    const someRegisteredInjectable = getInjectable({
      module: { filename: 'some-registered-injectable-filename' },
      instantiate: di => di.inject(someNonRegisteredInjectable),
    });

    const di = getDi(someRegisteredInjectable);

    expect(() => {
      di.inject(someRegisteredInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-registered-injectable-filename" -> "some-non-registered-injectable-filename".',
    );
  });

  it('given an injectable is singleton, when injected multiple times, injects singleton', () => {
    const singletonInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
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
      module: { filename: 'some-setuppable-filename' },

      setup: di => {
        instanceFromSetup = di.inject(someInjectable, 'some-parameter');
      },
    });

    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      lifecycle: lifecycleEnum.transient,
      instantiate: (di, parameter) => `some-instance: "${parameter}"`,
    });

    const di = getDi(someSetuppable, someInjectable);

    await di.runSetups();

    expect(instanceFromSetup).toBe('some-instance: "some-parameter"');
  });

  it('given multiple async setuppables and setups are ran, when setups resolve, setup resolves', async () => {
    const someSetuppable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      setup: asyncFn(),
    });

    const someOtherSetuppable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      setup: asyncFn(),
    });

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();
    someOtherSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(true);
  });

  it('given multiple async setuppables and DI-setups are ran, when only some of the setups resolve, DI-setup does not resolve', async () => {
    const someSetuppable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      setup: asyncFn(),
    });

    const someOtherSetuppable = {
      module: { filename: 'some-other-injectable-filename' },
      setup: asyncFn(),
    };

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(false);
  });

  it('given injectable with setup but no way to instantiate, when injected, throws', async () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      setup: () => {},
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-injectable-filename" when instantiation is not defined.',
    );
  });

  it('given injectable with setup but setups have not been ran, when injected, throws', () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      setup: () => {},
      instantiate: () => {},
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject setuppable "some-injectable-filename" before setups are ran.',
    );
  });

  it('given injectable with setup that injects itself, when running setups, does not throw', async () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },

      setup: di => {
        const instance = di.inject(someInjectable);

        instance.someProperty = 'some-value';
      },

      instantiate: () => ({}),
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    const actual = di.inject(someInjectable);

    expect(actual).toEqual({ someProperty: 'some-value' });
  });

  it('given injectable with setup that injects other injectable with setup, when running setups, throws', () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-setuppable-filename' },

      setup: di => {
        di.inject(someOtherInjectable);
      },

      instantiate: () => {},
    });

    const someOtherInjectable = getInjectable({
      module: { filename: 'some-other-setuppable-filename' },
      setup: () => {},
      instantiate: () => {},
    });

    const di = getDi(someInjectable, someOtherInjectable);

    return expect(di.runSetups()).rejects.toThrow(
      'Tried to inject setuppable "some-other-setuppable-filename" before setups are ran.',
    );
  });

  it('given multiple injectables with shared injection token, when injecting using the token, throws', () => {
    const someSharedInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject(someSharedInjectionToken);
    }).toThrow(
      `Tried to inject single injectable for injection token "some-injection-token-filename" but found multiple injectables: "some-injectable-filename", "some-other-injectable-filename"`,
    );
  });

  it('given multiple sync injectables with shared injection token, when injecting many using the token, injects all injectables with the shared token', () => {
    const someSharedInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-instance',
    });

    const someOtherInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-other-instance',
    });

    const someUnrelatedInjectable = getInjectable({
      module: { filename: 'some-unrelated-injectable-filename' },
      instantiate: () => 'some-other-instance',
    });

    const di = getDi(
      someInjectable,
      someOtherInjectable,
      someUnrelatedInjectable,
    );

    const actual = di.injectMany(someSharedInjectionToken);

    expect(actual).toEqual(['some-instance', 'some-other-instance']);
  });

  it('given multiple sync and async injectables with shared injection token, when injecting many using the token, injects all injectables with the shared token', async () => {
    const someSharedInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const someSyncInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-instance',
    });

    const someAsyncInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      instantiate: async () => 'some-other-instance',
    });

    const someUnrelatedInjectable = getInjectable({
      module: { filename: 'some-other-injectable-filename' },
      instantiate: () => 'some-other-instance',
    });

    const di = getDi(
      someSyncInjectable,
      someAsyncInjectable,
      someUnrelatedInjectable,
    );

    const actual = await di.injectMany(someSharedInjectionToken);

    expect(actual).toEqual(['some-instance', 'some-other-instance']);
  });

  it('given multiple transient injectables, when injecting many with an instantiation parameter, injects the injectables using the instantiation parameter', () => {
    const someSharedInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      injectionToken: someSharedInjectionToken,
      lifecycle: lifecycleEnum.transient,

      instantiate: (di, instantiationParameter) =>
        `some-instance: "${instantiationParameter}"`,
    });

    const di = getDi(someInjectable);

    const actual = di.injectMany(
      someSharedInjectionToken,
      'some-instantiation-parameter',
    );

    expect(actual).toEqual(['some-instance: "some-instantiation-parameter"']);
  });

  it('given no injectables, when injecting many, injects no instances', async () => {
    const someSharedInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const di = getDi();

    const actual = await di.injectMany(
      someSharedInjectionToken,
      'some-instantiation-parameter',
    );

    expect(actual).toEqual([]);
  });

  it('given injectables with a dependency cycle, when injecting many, throws', () => {
    const someInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const someOtherInjectionToken = getInjectionToken({
      module: { filename: 'some-injection-token-filename' },
    });

    const childInjectable = getInjectable({
      module: { filename: 'some-child-injectable' },
      injectionToken: someOtherInjectionToken,
      instantiate: di => di.injectMany(parentInjectable),
    });

    const parentInjectable = getInjectable({
      module: { filename: 'some-parent-injectable' },
      injectionToken: someInjectionToken,
      instantiate: di => di.injectMany(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.injectMany(parentInjectable, undefined, ['some-bogus-context']);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given in side effects are not prevented, when injecting injectable which causes side effects, does not throw', () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const di = getDi(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('given side effects are prevented, when injecting, throws', () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-injectable-filename" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented, but then permitted for an injectable, when injecting, does not throw', () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    di.permitSideEffects(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).not.toThrow();
  });

  describe('given lifecycle is scoped transient', () => {
    let di;
    let someInjectable;
    let someInjectableForScope;
    let someOtherInjectable;

    beforeEach(() => {
      someInjectableForScope = getInjectable({
        module: { filename: 'irrelevant' },
        instantiate: () => 'some-scope',
      });

      someInjectable = getInjectable({
        module: { filename: 'irrelevant' },
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject(someInjectableForScope),
        ),
      });

      someOtherInjectable = getInjectable({
        module: { filename: 'irrelevant' },
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.scopedTransient(di =>
          di.inject(someInjectableForScope),
        ),
      });

      di = getDi(someInjectable, someInjectableForScope, someOtherInjectable);
    });

    it('given unchanging scope, when injected, returns same instance', () => {
      const actual = di.inject(someInjectable);
      const actual2 = di.inject(someInjectable);

      expect(actual).toBe(actual2);
    });

    it('given one scope and injected and given other scope, when injected again, returns different instance', () => {
      const actual = di.inject(someInjectable);

      di.override(someInjectableForScope, () => 'some-other-scope');

      const actual2 = di.inject(someInjectable);

      expect(actual).not.toBe(actual2);
    });

    it('given an original scope and injected and given other scope and injected, given the original scope again, when injected, returns different instance', () => {
      const actual = di.inject(someInjectable);

      di.override(someInjectableForScope, () => 'some-other-scope');

      di.inject(someInjectable);

      di.override(someInjectableForScope, () => 'some-scope');

      const actual2 = di.inject(someInjectable);

      expect(actual).not.toBe(actual2);
    });

    it('given different injectables with identical scope, when injected, handles the scopes privately for the injectables', () => {
      const actual = di.inject(someInjectable);

      const actual2 = di.inject(someOtherInjectable);

      expect(actual).not.toBe(actual2);
    });
  });

  it('given singleton, when injecting with instantiation parameter, throws', () => {
    const someInjectable = getInjectable({
      module: { filename: 'some-injectable-filename' },
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject(someInjectable, { some: 'instantiation parameter' });
    }).toThrow(
      'Tried to inject singleton "some-injectable-filename" with instantiation parameters.',
    );
  });

  it('given injectable, when DI is asked for lifecycle, returns lifecycle', () => {
    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
      instantiate: () => ({}),
      lifecycle: { some: 'lifecycle' },
    });

    const di = getDi(someInjectable);

    const lifecycle = di.getLifecycle(someInjectable);

    expect(lifecycle).toEqual({ some: 'lifecycle' });
  });

  it('given an injectable is singleton and injected but purged, when injected, injects new instance', () => {
    const singletonInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const unrelatedSingletonInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
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
      module: { filename: 'irrelevant' },
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.scopedTransient(() => 'some-scope'),
    });

    const unrelatedScopedTransientInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
    const injectionToken = getInjectionToken({ module });

    const someInjectable = getInjectable({
      module: { filename: 'irrelevant' },
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
