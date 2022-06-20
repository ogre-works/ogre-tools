import {
  createContainer,
  getInjectable,
  getInjectionToken,
  injectionDecoratorToken,
} from '@ogre-tools/injectable';

import {
  computedInjectManyInjectable,
  registerMobX,
} from './computedInjectMany';

import { computed, configure, observe } from 'mobx';

configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
});

describe('registerMobx', () => {
  let reactiveInstances;

  describe('given the MobX extension is registered, and there is injection token and implementations of it, when injected as reactive', () => {
    let di;
    let actual;
    let someFirstInjectionToken;
    let someOtherInjectable;
    let reactionCountForFirstToken;
    let someInjectable;
    let contextsOfSomeInjectable;

    beforeEach(() => {
      contextsOfSomeInjectable = [];
      reactionCountForFirstToken = 0;

      someFirstInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someFirstInjectionToken,
      });

      const contextSpyDecorator = getInjectable({
        id: 'context-spy-decorator',

        instantiate: () => ({
          target: someInjectable,

          decorate:
            toBeDecorated =>
            (alias, instantiationParameter, context = []) => {
              contextsOfSomeInjectable.push([
                ...context.map(x => x.injectable.id),
                alias.id,
              ]);

              return toBeDecorated(alias, instantiationParameter, context);
            },
        }),

        decorable: false,

        injectionToken: injectionDecoratorToken,
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
        injectionToken: someFirstInjectionToken,
      });

      di = createContainer();

      di.register(contextSpyDecorator);

      registerMobX(di);
    });

    describe('given observed as computedInjectMany, when registered', () => {
      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        actual = computedInjectMany(someFirstInjectionToken);

        observe(
          actual,

          change => {
            reactionCountForFirstToken++;
            reactiveInstances = change.newValue;
          },
        );

        di.register(someInjectable, someOtherInjectable);
      });

      it('injects reactive instances', () => {
        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
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

        di.register(someIrrelevantInjectable, someAnotherInjectable);

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

        di.register(someIrrelevantInjectable);

        di.deregister(someIrrelevantInjectable, someOtherInjectable);

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

        di.register(someNewInjectable1, someNewInjectable2);

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

          di.register(someInjectableForSecondInjectionToken);
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

        di.register(someRootInjectable, someInjectable, someOtherInjectable);
      });

      it('observes root and nested values', () => {
        expect(observedRootValue).toEqual([
          'some-root-instance(some-instance, some-other-instance)',
        ]);
      });

      it('a deeply nested injectable has full context', () => {
        expect(contextsOfSomeInjectable).toEqual([
          [
            'computed-inject-many',
            'reactive-instances',
            'some-root-injection-token',
            'some-root-injectable',
            'computed-inject-many',
            'reactive-instances',
            'some-injection-token',
            'some-injectable',
          ],
        ]);
      });
    });
  });
});
