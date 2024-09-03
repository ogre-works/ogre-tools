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
  getInjectionToken,
  injectionDecoratorToken,
} from '@ogre-tools/injectable';

import {
  computedInjectManyWithMetaInjectable,
  isInternalOfComputedInjectMany,
  registerMobX,
} from './computedInjectMany';

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

      di = createContainer('some-container');

      di.register(contextSpyDecorator);

      registerMobX(di);
    });

    describe('given in reactive context and observed as computedInjectManyWithMeta, when multiple injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectManyWithMeta = di.inject(
          computedInjectManyWithMetaInjectable,
        );

        actual = computedInjectManyWithMeta(someFirstInjectionToken);

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
          { instance: 'some-instance', meta: { id: 'some-injectable' } },

          {
            instance: 'some-other-instance',
            meta: { id: 'some-other-injectable' },
          },
        ]);
      });

      it('causes only one reaction', () => {
        expect(reactionCountForFirstToken).toBe(1);
      });

      it('when injected again, returns same instance of computed', () => {
        const computedInjectManyWithMeta = di.inject(
          computedInjectManyWithMetaInjectable,
        );

        const actual1 = computedInjectManyWithMeta(someFirstInjectionToken);
        const actual2 = computedInjectManyWithMeta(someFirstInjectionToken);

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
          { instance: 'some-instance', meta: { id: 'some-injectable' } },
          {
            instance: 'some-other-instance',
            meta: { id: 'some-other-injectable' },
          },
          {
            instance: 'some-another-instance',
            meta: { id: 'some-another-injectable' },
          },
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

        expect(reactiveInstances).toEqual([
          { instance: 'some-instance', meta: { id: 'some-injectable' } },
        ]);
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

          const computedInjectManyWithMeta = di.inject(
            computedInjectManyWithMetaInjectable,
          );

          const actual = computedInjectManyWithMeta(someSecondInjectionToken);

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
            {
              instance: 'some-instance-for-second-token',
              meta: { id: 'some-injectable-for-second-injection-token' },
            },
          ]);
        });

        it('does not cause reaction in reactive instances of unrelated injection token', () => {
          expect(reactionCountForFirstToken).toBe(0);
        });
      });
    });

    it('given an injection decorator, when an injectable is registered and deregistered, does not decorate internals of computedInjectMany because injects between registrations can happen too early', () => {
      const someDecorator = getInjectable({
        id: 'some-decorator',

        instantiate: () => ({
          decorate:
            toBeDecorated =>
            (injectable, ...args) => {
              if (injectable[isInternalOfComputedInjectMany] === true) {
                throw new Error(
                  `Tried to decorate an internal of computedInjectMany: "${injectable.id}"`,
                );
              }

              return toBeDecorated(injectable, ...args);
            },
        }),

        decorable: false,

        injectionToken: injectionDecoratorToken,
      });

      runInAction(() => {
        di.register(someDecorator);

        di.register(someInjectable);
        di.deregister(someInjectable);
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
              computedInjectManyWithMetaInjectable,
            );

            const nestedInstances = nestedComputedInjectMany(
              someFirstInjectionToken,
            );

            return computed(() => {
              const childInstancesString = nestedInstances
                .get()
                .map(x => x.instance)
                .join(', ');

              return `some-root-instance(${childInstancesString})`;
            });
          },

          injectionToken: someRootInjectionToken,
        });

        const computedInjectManyWithMeta = di.inject(
          computedInjectManyWithMetaInjectable,
        );

        const reactiveRootInstances = computedInjectManyWithMeta(
          someRootInjectionToken,
        );

        const actual = computed(() =>
          reactiveRootInstances.get().flatMap(reactiveChildInstance => {
            return reactiveChildInstance.instance.get();
          }),
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

      it('a deeply nested injectable has full context', () => {
        expect(contextsOfSomeInjectable).toEqual([
          [
            'some-container',
            'computed-inject-many-with-meta',
            'reactive-instances-with-meta',
            'some-root-injection-token',
            'some-root-injectable',
            'computed-inject-many-with-meta',
            'reactive-instances-with-meta',
            'some-injection-token',
            'some-injectable',
          ],
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
        const computedInjectManyWithMeta = di.inject(
          computedInjectManyWithMetaInjectable,
        );

        actual = computedInjectManyWithMeta(someFirstInjectionToken);

        runInAction(() => {
          di.register(someInjectable, someOtherInjectable);
        });
      });

      it('when questionably accessing instances outside of reactive context, instances are present', () => {
        expect(actual.get().map(x => x.instance.someField)).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
      });

      it('given a property of one of the observable instances changes, when questionably accessing instances outside of reactive context, change is present', () => {
        const someInstance = di.inject(someInjectable);

        runInAction(() => {
          someInstance.someField = 'some-new-instance';
        });

        expect(actual.get().map(x => x.instance.someField)).toEqual([
          'some-new-instance',
          'some-other-instance',
        ]);
      });

      it('given observing reactive changes, when a property of one of the observable instances changes, the change is observed', () => {
        let someObservation;

        reaction(
          () => actual.get().map(x => x.instance.someField),
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
