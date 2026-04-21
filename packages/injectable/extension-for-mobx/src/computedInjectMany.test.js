import {
  computed,
  configure,
  observable,
  observe,
  reaction,
  runInAction,
} from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectable2,
  getInjectionToken,
  injectionDecoratorToken,
} from '@ogre-tools/injectable';

import {
  atomsByTokenInjectable,
  computedInjectManyInjectable,
  computedInjectManyInjectionToken,
  isInternalOfComputedInjectMany,
} from './computedInjectMany';
import { registerMobX } from './registerMobx';

describe('registerMobx', () => {
  let reactiveInstances;

  beforeEach(() => {
    configure({
      enforceActions: 'always',
      computedRequiresReaction: true,
      reactionRequiresObservable: true,
      observableRequiresReaction: true,
    });
  });

  describe('given the MobX extension is registered, and there is injection token and implementations of it, when injected as reactive', () => {
    let di;
    let actual;
    let someFirstInjectionToken;
    let someOtherInjectable;
    let reactionCountForFirstToken;
    let someInjectable;
    beforeEach(() => {
      reactionCountForFirstToken = 0;

      someFirstInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someFirstInjectionToken,
      });

      const contextSpyDecorator = getInjectable2({
        id: 'context-spy-decorator',

        instantiate: () => () =>
          toBeDecorated =>
          (...params) =>
            toBeDecorated(...params),

        decorable: false,

        injectionToken: injectionDecoratorToken.for(someInjectable),
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
        injectionToken: someFirstInjectionToken,
      });

      di = createContainer('some-container');

      di.register(contextSpyDecorator);

      registerMobX(di);
    });

    it('when calling registerMobX again, does not throw', () => {
      expect(() => {
        registerMobX(di);
      }).not.toThrow();
    });

    it('when injecting the computedInjectMany injection token twice, returns the same wrapper function instance', () => {
      const first = di.inject(computedInjectManyInjectionToken);
      const second = di.inject(computedInjectManyInjectionToken);

      expect(first).toBe(second);
    });

    describe('given reactivity atoms are tracked lazily per token', () => {
      let atomsByToken;

      beforeEach(() => {
        atomsByToken = di.inject(atomsByTokenInjectable);
      });

      it('given no token has been requested as reactive, the atom map is empty', () => {
        expect(atomsByToken.size).toBe(0);
      });

      describe('when an implementation is registered against a token that nothing has requested as reactive', () => {
        beforeEach(() => {
          runInAction(() => {
            di.register(someInjectable);
          });
        });

        it('no atom is created for the token', () => {
          expect(atomsByToken.has(someFirstInjectionToken)).toBe(false);
        });
      });

      describe('when computedInjectMany is called for a token', () => {
        beforeEach(() => {
          const computedInjectMany = di.inject(
            computedInjectManyInjectionToken,
          );
          computedInjectMany(someFirstInjectionToken);
        });

        it('an atom is registered for the token', () => {
          expect(atomsByToken.has(someFirstInjectionToken)).toBe(true);
        });

        describe('when computedInjectMany is also called with additional instantiation parameters for the same token', () => {
          beforeEach(() => {
            const computedInjectMany = di.inject(
              computedInjectManyInjectionToken,
            );
            computedInjectMany(someFirstInjectionToken, 'some-arg');
          });

          it('the same single atom is reused across the parameter variations', () => {
            expect(atomsByToken.size).toBe(1);
          });
        });
      });
    });

    describe('given a second MobX-enabled container', () => {
      let atomsByToken;
      let otherAtomsByToken;

      beforeEach(() => {
        const otherDi = createContainer('some-other-container');
        registerMobX(otherDi);

        atomsByToken = di.inject(atomsByTokenInjectable);
        otherAtomsByToken = otherDi.inject(atomsByTokenInjectable);
      });

      it('the two containers own independent atom maps', () => {
        expect(atomsByToken).not.toBe(otherAtomsByToken);
      });

      describe('when a token is requested as reactive in the original container', () => {
        beforeEach(() => {
          const computedInjectMany = di.inject(
            computedInjectManyInjectionToken,
          );
          computedInjectMany(someFirstInjectionToken);
        });

        it('the atom exists in the original container', () => {
          expect(atomsByToken.has(someFirstInjectionToken)).toBe(true);
        });

        it('the other container is unaffected', () => {
          expect(otherAtomsByToken.has(someFirstInjectionToken)).toBe(false);
        });
      });
    });

    describe('given in reactive context and observed as computedInjectMany, when multiple injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectionToken);

        actual = computedInjectMany(someFirstInjectionToken);

        observe(
          actual,

          change => {
            reactionCountForFirstToken++;
            reactiveInstances = change.newValue;
          },
        );

        runInAction(() => {
          di.register(someInjectable, someOtherInjectable);
        });
      });

      it('injects reactive instances', () => {
        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
      });

      it('causes only one reaction', () => {
        expect(reactionCountForFirstToken).toBe(1);
      });

      it('when injected again, returns same instance of computed', () => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        const actual1 = computedInjectMany(someFirstInjectionToken);
        const actual2 = computedInjectMany(someFirstInjectionToken);

        expect(actual1).toBe(actual2);
      });

      it('when a new implementation gets registered, the reactive instances react', () => {
        const someIrrelevantInjectable = getInjectable({
          id: 'some-irrelevant-injectable',
          instantiate: () => 'irrelevant',
        });

        const someAnotherInjectable = getInjectable({
          id: 'some-another-injectable',
          instantiate: () => 'some-another-instance',
          injectionToken: someFirstInjectionToken,
        });

        runInAction(() => {
          di.register(someIrrelevantInjectable, someAnotherInjectable);
        });

        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
          'some-another-instance',
        ]);
      });

      it('when an existing implementation gets deregistered, the reactive instances react', () => {
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

        expect(reactiveInstances).toEqual(['some-instance']);
      });

      it('when registering multiple new implementations for the token, causes only one reaction', () => {
        const someNewInjectable1 = getInjectable({
          id: 'some-injectable-1',
          instantiate: () => 'irrelevant',
          injectionToken: someFirstInjectionToken,
        });

        const someNewInjectable2 = getInjectable({
          id: 'some-injectable-2',
          instantiate: () => 'irrelevant',
          injectionToken: someFirstInjectionToken,
        });

        reactionCountForFirstToken = 0;

        runInAction(() => {
          di.register(someNewInjectable1, someNewInjectable2);
        });

        expect(reactionCountForFirstToken).toBe(1);
      });

      describe('given second injection token and implementations, when injected as reactive', () => {
        let reactiveInstancesForSecondToken;

        beforeEach(() => {
          const someSecondInjectionToken = getInjectionToken({
            id: 'some-second-injection-token',
          });

          const someInjectableForSecondInjectionToken = getInjectable({
            id: 'some-injectable-for-second-injection-token',
            instantiate: () => 'some-instance-for-second-token',
            injectionToken: someSecondInjectionToken,
          });

          const computedInjectMany = di.inject(computedInjectManyInjectable);

          const actual = computedInjectMany(someSecondInjectionToken);

          observe(
            actual,

            change => {
              reactiveInstancesForSecondToken = change.newValue;
            },
          );

          reactionCountForFirstToken = 0;

          runInAction(() => {
            di.register(someInjectableForSecondInjectionToken);
          });
        });

        it('injects only related implementations', () => {
          expect(reactiveInstancesForSecondToken).toEqual([
            'some-instance-for-second-token',
          ]);
        });

        it('does not cause reaction in reactive instances of unrelated injection token', () => {
          expect(reactionCountForFirstToken).toBe(0);
        });
      });
    });

    describe('given nested injection token and implementations, when injected as reactive', () => {
      let observedRootValue;

      beforeEach(() => {
        const someRootInjectionToken = getInjectionToken({
          id: 'some-root-injection-token',
        });

        const someRootInjectable = getInjectable({
          id: 'some-root-injectable',

          instantiate: di => {
            const nestedComputedInjectMany = di.inject(
              computedInjectManyInjectable,
            );

            const nestedInstances = nestedComputedInjectMany(
              someFirstInjectionToken,
            );

            return computed(() => {
              const childInstancesString = nestedInstances.get().join(', ');

              return `some-root-instance(${childInstancesString})`;
            });
          },

          injectionToken: someRootInjectionToken,
        });

        const computedInjectMany = di.inject(computedInjectManyInjectable);

        const reactiveRootInstances = computedInjectMany(
          someRootInjectionToken,
        );

        const actual = computed(() =>
          reactiveRootInstances
            .get()
            .flatMap(reactiveChildInstance => reactiveChildInstance.get()),
        );

        observe(
          actual,

          change => {
            observedRootValue = change.newValue;
          },
        );

        runInAction(() => {
          di.register(someRootInjectable, someInjectable, someOtherInjectable);
        });
      });

      it('observes root and nested values', () => {
        expect(observedRootValue).toEqual([
          'some-root-instance(some-instance, some-other-instance)',
        ]);
      });
    });
  });

  describe('given observable instances', () => {
    let di;
    let someFirstInjectionToken;
    let someOtherInjectable;
    let someInjectable;

    beforeEach(() => {
      configure({
        computedRequiresReaction: false,
        observableRequiresReaction: false,
      });

      someFirstInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',

        instantiate: () =>
          observable({
            someField: 'some-instance',
          }),

        injectionToken: someFirstInjectionToken,
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',

        instantiate: () =>
          observable({
            someField: 'some-other-instance',
          }),

        injectionToken: someFirstInjectionToken,
      });

      di = createContainer('some-container');

      registerMobX(di);
    });

    describe('given the injectables are registered', () => {
      let actual;

      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        actual = computedInjectMany(someFirstInjectionToken);

        runInAction(() => {
          di.register(someInjectable, someOtherInjectable);
        });
      });

      it('when questionably accessing instances outside of reactive context, instances are present', () => {
        expect(actual.get().map(x => x.someField)).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
      });

      it('given a property of one of the observable instances changes, when questionably accessing instances outside of reactive context, change is present', () => {
        const someInstance = di.inject(someInjectable);

        runInAction(() => {
          someInstance.someField = 'some-new-instance';
        });

        expect(actual.get().map(x => x.someField)).toEqual([
          'some-new-instance',
          'some-other-instance',
        ]);
      });

      it('given observing reactive changes, when a property of one of the observable instances changes, the change is observed', () => {
        let someObservation;

        reaction(
          () => actual.get().map(x => x.someField),
          change => {
            someObservation = change;
          },
        );

        const someInstance = di.inject(someInjectable);
        runInAction(() => {
          someInstance.someField = 'some-new-instance';
        });

        expect(someObservation).toEqual([
          'some-new-instance',
          'some-other-instance',
        ]);
      });
    });
  });
});
