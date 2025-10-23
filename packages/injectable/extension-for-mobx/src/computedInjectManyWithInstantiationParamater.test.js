import { configure, observe, runInAction } from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from '@lensapp/injectable';

import { computedInjectManyInjectable } from './computedInjectMany';
import { registerMobX } from './registerMobx';

describe('computed inject many with instantiation parameter', () => {
  let reactiveInstances;
  let reactiveInstances2;

  beforeEach(() => {
    configure({
      enforceActions: 'always',
      computedRequiresReaction: true,
      reactionRequiresObservable: true,
      observableRequiresReaction: true,
    });
  });

  describe('given injection token and implementations of it that are not singleton, when injected as reactive', () => {
    let di;
    let actual;
    let actual2;
    let someInjectionToken;
    let someInjectable;
    let someOtherInjectable;
    let reactionCountForInjectionToken;

    beforeEach(() => {
      reactionCountForInjectionToken = 0;

      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: (di, parameter) => `some-instance(${parameter})`,
        injectionToken: someInjectionToken,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, parameter) => parameter,
        }),
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: (di, parameter) => `some-other-instance(${parameter})`,
        injectionToken: someInjectionToken,
        lifecycle: lifecycleEnum.transient,
      });

      di = createContainer('some-container');

      registerMobX(di);
    });

    describe('given observed as computedInjectMany with instantiation parameter, when multiple injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        actual = computedInjectMany(
          someInjectionToken,
          'some-instantiation-parameter',
        );

        actual2 = computedInjectMany(
          someInjectionToken,
          'some-other-instantiation-parameter',
        );

        observe(
          actual,

          change => {
            reactionCountForInjectionToken++;
            reactiveInstances = change.newValue;
          },
        );

        observe(
          actual2,

          change => {
            reactiveInstances2 = change.newValue;
          },
        );

        runInAction(() => {
          di.register(someInjectable, someOtherInjectable);
        });
      });

      it('injects reactive instances that use the parameter', () => {
        expect(reactiveInstances).toEqual([
          'some-instance(some-instantiation-parameter)',
          'some-other-instance(some-instantiation-parameter)',
        ]);
      });

      it('causes only one reaction', () => {
        expect(reactionCountForInjectionToken).toBe(1);
      });

      it('given same key, when injected multiple times, returns same instance of computed', () => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        const actual1 = computedInjectMany(someInjectionToken, 'some-key');

        const actual2 = computedInjectMany(someInjectionToken, 'some-key');

        expect(actual1).toBe(actual2);
      });

      it('given different keys, when injected multiple times, returns different instances of computed', () => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        const actual1 = computedInjectMany(someInjectionToken, 'some-key-1');

        const actual2 = computedInjectMany(someInjectionToken, 'some-key-2');

        expect(actual1).not.toBe(actual2);
      });

      describe('when a new implementation gets registered', () => {
        beforeEach(() => {
          const someIrrelevantInjectable = getInjectable({
            id: 'some-irrelevant-injectable',
            instantiate: () => 'irrelevant',
          });

          const someAnotherInjectable = getInjectable({
            id: 'some-another-injectable',
            instantiate: (di, parameter) =>
              `some-another-instance(${parameter})`,
            lifecycle: lifecycleEnum.transient,
            injectionToken: someInjectionToken,
          });

          runInAction(() => {
            di.register(someIrrelevantInjectable, someAnotherInjectable);
          });
        });

        it('the reactive instances for first instantiation parameters react', () => {
          expect(reactiveInstances).toEqual([
            'some-instance(some-instantiation-parameter)',
            'some-other-instance(some-instantiation-parameter)',
            'some-another-instance(some-instantiation-parameter)',
          ]);
        });

        it('the reactive instances for second instantiation parameters react', () => {
          expect(reactiveInstances2).toEqual([
            'some-instance(some-other-instantiation-parameter)',
            'some-other-instance(some-other-instantiation-parameter)',
            'some-another-instance(some-other-instantiation-parameter)',
          ]);
        });
      });

      describe('when an existing implementation gets deregistered', () => {
        beforeEach(() => {
          const someIrrelevantInjectable = getInjectable({
            id: 'some-irrelevant-injectable',
            instantiate: () => 'irrelevant',
          });

          runInAction(() => {
            di.register(someIrrelevantInjectable);
          });

          runInAction(() => {
            di.deregister(someIrrelevantInjectable, someOtherInjectable);
          });
        });

        it('the reactive instances for first instantiation parameters react', () => {
          expect(reactiveInstances).toEqual([
            'some-instance(some-instantiation-parameter)',
          ]);
        });

        it('the reactive instances for second instantiation parameters react', () => {
          expect(reactiveInstances2).toEqual([
            'some-instance(some-other-instantiation-parameter)',
          ]);
        });
      });

      it('when registering multiple new implementations for the token, causes only one reaction', () => {
        const someNewInjectable1 = getInjectable({
          id: 'some-injectable-1',
          instantiate: () => 'irrelevant',
          injectionToken: someInjectionToken,
          lifecycle: lifecycleEnum.transient,
        });

        const someNewInjectable2 = getInjectable({
          id: 'some-injectable-2',
          instantiate: () => 'irrelevant',
          injectionToken: someInjectionToken,
          lifecycle: lifecycleEnum.transient,
        });

        reactionCountForInjectionToken = 0;

        runInAction(() => {
          di.register(someNewInjectable1, someNewInjectable2);
        });

        expect(reactionCountForInjectionToken).toBe(1);
      });
    });
  });
});
