import { configure, observe, runInAction } from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectable2,
  getInjectionToken,
  registrationDecoratorToken,
} from '@lensapp/injectable';

import { computedInjectManyInjectionToken } from './computedInjectMany';
import { registerMobX } from './registerMobx';

describe('computedInjectMany with registration decoration', () => {
  let di;

  beforeEach(() => {
    configure({
      enforceActions: 'always',
      computedRequiresReaction: true,
      reactionRequiresObservable: true,
      observableRequiresReaction: true,
    });

    di = createContainer('some-container');
    registerMobX(di);
  });

  describe('given a registration decorator that prevents registration of injectables for a token', () => {
    let someToken;
    let someInjectable;
    let deferredRegistrations;
    let featureFlagDecorator;

    beforeEach(() => {
      deferredRegistrations = new Map();

      someToken = getInjectionToken({ id: 'some-token' });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someToken,
      });

      featureFlagDecorator = getInjectable2({
        id: 'feature-flag-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        decorable: false,

        instantiate: () => () => registerToBeDecorated => injectable => {
          deferredRegistrations.set(injectable, () =>
            registerToBeDecorated(injectable),
          );
        },
      });

      runInAction(() => {
        di.register(featureFlagDecorator);
      });
    });

    describe('given computedInjectMany observing the token, when an injectable is registered while flagged', () => {
      let observed;
      let reactiveInstances;

      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectionToken);
        reactiveInstances = computedInjectMany(someToken);

        observe(reactiveInstances, change => {
          observed = change.newValue;
        });

        runInAction(() => {
          di.register(someInjectable);
        });
      });

      it('the observer does not fire', () => {
        expect(observed).toBeUndefined();
      });

      it('computedInjectMany returns an empty array', () => {
        expect(runInAction(() => reactiveInstances.get())).toEqual([]);
      });
    });

    describe('given an injectable registered while flagged, when the deferred registration is released', () => {
      let observations;
      let reactiveInstances;

      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectionToken);
        reactiveInstances = computedInjectMany(someToken);

        observations = [];

        observe(reactiveInstances, change => {
          observations.push(change.newValue);
        });

        runInAction(() => {
          di.register(someInjectable);
        });

        runInAction(() => {
          const release = deferredRegistrations.get(someInjectable);
          release();
        });
      });

      it('the observer fires with the instance', () => {
        expect(observations).toEqual([['some-instance']]);
      });

      it('computedInjectMany returns the instance', () => {
        expect(runInAction(() => reactiveInstances.get())).toEqual([
          'some-instance',
        ]);
      });
    });

    describe('given multiple injectables deferred', () => {
      let observations;
      let someOtherInjectable;

      beforeEach(() => {
        someOtherInjectable = getInjectable({
          id: 'some-other-injectable',
          instantiate: () => 'some-other-instance',
          injectionToken: someToken,
        });

        const computedInjectMany = di.inject(computedInjectManyInjectionToken);
        const reactiveInstances = computedInjectMany(someToken);

        observations = [];

        observe(reactiveInstances, change => {
          observations.push([...change.newValue]);
        });

        runInAction(() => {
          di.register(someInjectable, someOtherInjectable);
        });
      });

      it('when the first injectable is released, computedInjectMany reacts', () => {
        runInAction(() => {
          deferredRegistrations.get(someInjectable)();
        });

        expect(observations).toEqual([['some-instance']]);
      });

      it('when both injectables are released one by one, computedInjectMany reacts to each', () => {
        runInAction(() => {
          deferredRegistrations.get(someInjectable)();
        });

        runInAction(() => {
          deferredRegistrations.get(someOtherInjectable)();
        });

        expect(observations).toEqual([
          ['some-instance'],
          ['some-instance', 'some-other-instance'],
        ]);
      });
    });
  });

  describe('given a feature-flag-like pattern: decorator blocks, then unblocks by deregistering itself', () => {
    let someToken;
    let someInjectable;
    let flagDecorator;
    let deferred;

    beforeEach(() => {
      someToken = getInjectionToken({ id: 'some-token' });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someToken,
      });

      deferred = new Map();

      flagDecorator = getInjectable2({
        id: 'flag-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        decorable: false,

        instantiate: () => () => registerToBeDecorated => injectable => {
          deferred.set(injectable, () => registerToBeDecorated(injectable));
        },
      });
    });

    describe('given flag decorator is registered and an injectable is registered while flagged', () => {
      let reactiveInstances;
      let observations;

      beforeEach(() => {
        const computedInjectMany = di.inject(computedInjectManyInjectionToken);
        reactiveInstances = computedInjectMany(someToken);

        observations = [];

        observe(reactiveInstances, change => {
          observations.push([...change.newValue]);
        });

        runInAction(() => {
          di.register(flagDecorator);
        });

        runInAction(() => {
          di.register(someInjectable);
        });
      });

      it('computedInjectMany returns empty while flagged', () => {
        expect(runInAction(() => reactiveInstances.get())).toEqual([]);
      });

      it('when flag is deregistered and deferred registrations are released, computedInjectMany includes the injectable', () => {
        runInAction(() => {
          di.deregister(flagDecorator);

          for (const release of deferred.values()) {
            release();
          }
        });

        expect(observations).toEqual([['some-instance']]);
      });
    });
  });

  describe('given a registration decorator that conditionally blocks based on injectable identity', () => {
    describe('given a selective decorator that blocks one injectable but allows another, when both are registered', () => {
      let observations;
      let reactiveInstances;

      beforeEach(() => {
        const someToken = getInjectionToken({ id: 'some-token' });

        const blockedInjectable = getInjectable({
          id: 'blocked-injectable',
          instantiate: () => 'blocked-instance',
          injectionToken: someToken,
        });

        const allowedInjectable = getInjectable({
          id: 'allowed-injectable',
          instantiate: () => 'allowed-instance',
          injectionToken: someToken,
        });

        const decoratorInjectable = getInjectable2({
          id: 'selective-decorator',
          injectionToken: registrationDecoratorToken.for(someToken),
          decorable: false,

          instantiate: () => () => registerToBeDecorated => injectable => {
            if (injectable === blockedInjectable) {
              return;
            }

            registerToBeDecorated(injectable);
          },
        });

        const computedInjectMany = di.inject(computedInjectManyInjectionToken);
        reactiveInstances = computedInjectMany(someToken);

        observations = [];

        observe(reactiveInstances, change => {
          observations.push([...change.newValue]);
        });

        runInAction(() => {
          di.register(decoratorInjectable);
        });

        runInAction(() => {
          di.register(blockedInjectable, allowedInjectable);
        });
      });

      it('the observer fires with only the allowed instance', () => {
        expect(observations).toEqual([['allowed-instance']]);
      });

      it('computedInjectMany returns only the allowed instance', () => {
        expect(runInAction(() => reactiveInstances.get())).toEqual([
          'allowed-instance',
        ]);
      });
    });
  });
});
