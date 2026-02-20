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
  computedInjectManyInjectable,
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

  describe('given the MobX extension is registered, and there is a specific injection token and implementations of it, when injected as reactive', () => {
    let di;
    let actual;
    let someFirstInjectionToken;
    let someOtherInjectable;
    let reactionCountForFirstToken;
    let someInjectable;
    let contextsOfSomeInjectable;
    let someGeneralInjectable;

    beforeEach(() => {
      contextsOfSomeInjectable = [];
      reactionCountForFirstToken = 0;

      someFirstInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      }).for('some-speciality');

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someFirstInjectionToken.for('some-speciality'),
      });

      someGeneralInjectable = getInjectable({
        id: 'some-general-injectable',
        instantiate: () => 'some-general-instance',
        // Notice: lack of .for() makes this more general
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
        injectionToken: someFirstInjectionToken.for('some-speciality'),
      });

      di = createContainer('some-container');

      di.register(contextSpyDecorator);

      registerMobX(di);
    });

    describe('given in reactive context and observed as more specific computedInjectMany, when multiple injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        actual = computedInjectMany(
          someFirstInjectionToken.for('some-speciality'),
        );

        observe(
          actual,

          change => {
            reactionCountForFirstToken++;
            reactiveInstances = change.newValue;
          },
        );

        runInAction(() => {
          di.register(
            someInjectable,
            someOtherInjectable,
            someGeneralInjectable,
          );
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

        const actual1 = computedInjectMany(
          someFirstInjectionToken.for('some-speciality'),
        );

        const actual2 = computedInjectMany(
          someFirstInjectionToken.for('some-speciality'),
        );

        expect(actual1).toBe(actual2);
      });

      it('when a new specific implementation gets registered, the reactive instances react', () => {
        const someIrrelevantInjectable = getInjectable({
          id: 'some-irrelevant-injectable',
          instantiate: () => 'irrelevant',
        });

        const someAnotherInjectable = getInjectable({
          id: 'some-another-injectable',
          instantiate: () => 'some-another-instance',
          injectionToken: someFirstInjectionToken.for('some-speciality'),
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

      describe('when a new specific, yet unrelated implementation gets registered', () => {
        beforeEach(() => {
          const someAnotherInjectable = getInjectable({
            id: 'some-another-injectable',
            instantiate: () => 'irrelevant',

            injectionToken: someFirstInjectionToken.for(
              'some-unrelated-speciality',
            ),
          });

          reactionCountForFirstToken = 0;

          runInAction(() => {
            di.register(someAnotherInjectable);
          });
        });

        it('the reactive instances do not change', () => {
          expect(reactiveInstances).toEqual([
            'some-instance',
            'some-other-instance',
          ]);
        });

        it('the reactive instances do observe change', () => {
          expect(reactionCountForFirstToken).toBe(0);
        });
      });

      it('when an existing specific implementation gets deregistered, the reactive instances react', () => {
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

      describe('when an existing less specific (thus irrelevant) implementation gets deregistered', () => {
        beforeEach(() => {
          reactionCountForFirstToken = 0;

          runInAction(() => {
            di.deregister(someGeneralInjectable);
          });
        });

        it('the reactive instances do not change', () => {
          expect(reactiveInstances).toEqual([
            'some-instance',
            'some-other-instance',
          ]);
        });

        it('the reactive instances do not observe change', () => {
          expect(reactionCountForFirstToken).toBe(0);
        });
      });

      it('when registering multiple new implementations of differing specificity for the token, causes only one reaction', () => {
        const someNewInjectable1 = getInjectable({
          id: 'some-injectable-1',
          instantiate: () => 'irrelevant',
          injectionToken: someFirstInjectionToken.for('some-speciality'),
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
    });

    describe('given in reactive context and observed as less specific computedInjectMany, when multiple injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectable);

        actual = computedInjectMany(
          // Note: lack of .for() makes this less specific
          someFirstInjectionToken,
        );

        observe(
          actual,

          change => {
            reactionCountForFirstToken++;
            reactiveInstances = change.newValue;
          },
        );

        runInAction(() => {
          di.register(
            someInjectable,
            someOtherInjectable,
            someGeneralInjectable,
          );
        });
      });

      it('injects reactive instances, including the more general one', () => {
        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
          'some-general-instance',
        ]);
      });

      it('causes only one reaction', () => {
        expect(reactionCountForFirstToken).toBe(1);
      });

      it('when a new specific implementation gets registered, the reactive instances react', () => {
        const someAnotherInjectable = getInjectable({
          id: 'some-another-injectable',
          instantiate: () => 'some-new-specific-instance',
          injectionToken: someFirstInjectionToken.for('some-speciality'),
        });

        runInAction(() => {
          di.register(someAnotherInjectable);
        });

        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
          'some-general-instance',
          'some-new-specific-instance',
        ]);
      });

      it('when a new less specific implementation gets registered, the reactive instances react', () => {
        const someAnotherInjectable = getInjectable({
          id: 'some-another-injectable',
          instantiate: () => 'some-new-less-specific-instance',
          // Note: lack of .for() makes this less specific
          injectionToken: someFirstInjectionToken,
        });

        runInAction(() => {
          di.register(someAnotherInjectable);
        });

        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
          'some-general-instance',
          'some-new-less-specific-instance',
        ]);
      });

      it('when an existing specific implementation gets deregistered, the reactive instances react', () => {
        runInAction(() => {
          di.deregister(someOtherInjectable);
        });

        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-general-instance',
        ]);
      });

      it('when an existing less specific implementation gets deregistered, the reactive instances react', () => {
        runInAction(() => {
          di.deregister(someGeneralInjectable);
        });

        expect(reactiveInstances).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
      });

      it('when registering multiple new implementations of differing specificity, causes only one reaction', () => {
        const someNewInjectable1 = getInjectable({
          id: 'some-injectable-1',
          instantiate: () => 'irrelevant',
          injectionToken: someFirstInjectionToken.for('some-speciality'),
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
    });
  });
});
