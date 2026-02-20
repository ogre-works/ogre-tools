import { noop } from 'lodash/fp';
import { autorun, configure, runInAction, onReactionError } from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  injectionDecoratorToken,
  lifecycleEnum,
} from '@ogre-tools/injectable';

import { computedInjectMaybeInjectionToken } from './computedInjectMaybe';

import { registerMobX } from './registerMobx';
import { isPromise } from '@ogre-tools/fp';

describe('computedInjectMaybe with instantiation parameter', () => {
  let actualObservedInstance;

  beforeEach(() => {
    configure({
      enforceActions: 'always',
      computedRequiresReaction: true,
      reactionRequiresObservable: true,
      observableRequiresReaction: true,
    });
  });

  describe('given there is injection token and implementations of it, when injected as reactive', () => {
    let di;
    let actual;
    let someInjectionToken;
    let someCollidingInjectable;
    let actualObservationsCount;
    let someInjectable;
    let contextsOfSomeInjectable;

    beforeEach(() => {
      contextsOfSomeInjectable = [];
      actualObservationsCount = 0;

      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: (_, id) => `some-instance-for(${id})`,
        injectionToken: someInjectionToken,
        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, id) => id,
        }),
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

      someCollidingInjectable = getInjectable({
        id: 'some-colliding-injectable',
        instantiate: (_, id) => `some-colliding-instance-for(${id})`,
        injectionToken: someInjectionToken,
        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, id) => id,
        }),
      });

      di = createContainer('some-container');

      di.register(contextSpyDecorator);

      registerMobX(di);
    });

    describe('given in reactive context and observed as computedInjectMaybe, when no injectables that implement the injection token are registered', () => {
      beforeEach(() => {
        const computedInjectMaybe = di.inject(
          computedInjectMaybeInjectionToken,
        );

        actual = computedInjectMaybe(someInjectionToken, 'some-param');

        autorun(() => {
          actualObservedInstance = actual.get();
          actualObservationsCount++;
        });
      });

      it('injects no instance, as there is none registered', () => {
        expect(actualObservedInstance).toBeUndefined();
      });

      it('causes only one reaction', () => {
        expect(actualObservationsCount).toBe(1);
      });

      it('when injected again with the same param, returns same instance of computed', () => {
        const computedInjectMaybe = di.inject(
          computedInjectMaybeInjectionToken,
        );

        const actual1 = computedInjectMaybe(someInjectionToken, 'some-param');
        const actual2 = computedInjectMaybe(someInjectionToken, 'some-param');

        expect(actual1).toBe(actual2);
      });

      it('when injected again with a different param, returns different instance of computed', () => {
        const computedInjectMaybe = di.inject(
          computedInjectMaybeInjectionToken,
        );

        const actual1 = computedInjectMaybe(someInjectionToken, 'some-param');
        const actual2 = computedInjectMaybe(
          someInjectionToken,
          'some-other-param',
        );

        expect(actual1).not.toBe(actual2);
      });

      describe('when an implementation gets registered', () => {
        beforeEach(() => {
          runInAction(() => {
            di.register(someInjectable);
          });
        });

        it('the instance is observed', () => {
          expect(actualObservedInstance).toBe('some-instance-for(some-param)');
        });

        it('when the implementation gets deregistered, instance is no longer observed', () => {
          runInAction(() => {
            di.deregister(someInjectable);
          });

          expect(actualObservedInstance).toBeUndefined();
        });

        describe('when a colliding implementation for the token gets registered', () => {
          let actualError;

          beforeEach(() => {
            onReactionError((error, reaction) => {
              actualError = error.message;
            });

            withSuppressedConsoleError(() => {
              runInAction(() => {
                di.register(someCollidingInjectable);
              });
            });
          });

          it('an error is thrown', () => {
            expect(actualError).toBe(
              'Tried to computedInjectMaybe "some-injection-token", but more than one contribution was encountered: "some-injectable", "some-colliding-injectable"',
            );
          });
        });
      });
    });
  });
});

const withSuppressedConsoleError = toBeSuppressed => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);
  const supressed = toBeSuppressed();

  if (isPromise(supressed)) {
    supressed.finally(() => consoleErrorSpy.mockRestore());
  } else {
    consoleErrorSpy.mockRestore();
  }
};
