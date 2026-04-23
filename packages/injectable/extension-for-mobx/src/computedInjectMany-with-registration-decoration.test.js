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

    it('when an injectable is registered while flagged, computedInjectMany does not include it', () => {
      const computedInjectMany = di.inject(computedInjectManyInjectionToken);
      const reactiveInstances = computedInjectMany(someToken);

      let observed;

      observe(reactiveInstances, change => {
        observed = change.newValue;
      });

      runInAction(() => {
        di.register(someInjectable);
      });

      expect(observed).toBeUndefined();
      expect(runInAction(() => reactiveInstances.get())).toEqual([]);
    });

    it('when the deferred registration is released, computedInjectMany reacts and includes the injectable', () => {
      const computedInjectMany = di.inject(computedInjectManyInjectionToken);
      const reactiveInstances = computedInjectMany(someToken);

      const observations = [];

      observe(reactiveInstances, change => {
        observations.push(change.newValue);
      });

      runInAction(() => {
        di.register(someInjectable);
      });

      expect(runInAction(() => reactiveInstances.get())).toEqual([]);

      runInAction(() => {
        const release = deferredRegistrations.get(someInjectable);
        release();
      });

      expect(observations).toEqual([['some-instance']]);
      expect(runInAction(() => reactiveInstances.get())).toEqual([
        'some-instance',
      ]);
    });

    it('when multiple injectables are deferred and then released one by one, computedInjectMany reacts to each', () => {
      const someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
        injectionToken: someToken,
      });

      const computedInjectMany = di.inject(computedInjectManyInjectionToken);
      const reactiveInstances = computedInjectMany(someToken);

      const observations = [];

      observe(reactiveInstances, change => {
        observations.push([...change.newValue]);
      });

      runInAction(() => {
        di.register(someInjectable, someOtherInjectable);
      });

      expect(runInAction(() => reactiveInstances.get())).toEqual([]);

      runInAction(() => {
        deferredRegistrations.get(someInjectable)();
      });

      expect(observations).toEqual([['some-instance']]);

      runInAction(() => {
        deferredRegistrations.get(someOtherInjectable)();
      });

      expect(observations).toEqual([
        ['some-instance'],
        ['some-instance', 'some-other-instance'],
      ]);
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

    it('when flag is deregistered and deferred registrations are released, computedInjectMany includes the injectable', () => {
      const computedInjectMany = di.inject(computedInjectManyInjectionToken);
      const reactiveInstances = computedInjectMany(someToken);

      const observations = [];

      observe(reactiveInstances, change => {
        observations.push([...change.newValue]);
      });

      runInAction(() => {
        di.register(flagDecorator);
      });

      runInAction(() => {
        di.register(someInjectable);
      });

      expect(runInAction(() => reactiveInstances.get())).toEqual([]);

      runInAction(() => {
        di.deregister(flagDecorator);

        for (const release of deferred.values()) {
          release();
        }
      });

      expect(observations).toEqual([['some-instance']]);
    });
  });

  describe('given a registration decorator that conditionally blocks based on injectable identity', () => {
    it('only blocked injectables are excluded from computedInjectMany, non-blocked injectables appear immediately', () => {
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
      const reactiveInstances = computedInjectMany(someToken);

      const observations = [];

      observe(reactiveInstances, change => {
        observations.push([...change.newValue]);
      });

      runInAction(() => {
        di.register(decoratorInjectable);
      });

      runInAction(() => {
        di.register(blockedInjectable, allowedInjectable);
      });

      expect(observations).toEqual([['allowed-instance']]);
      expect(runInAction(() => reactiveInstances.get())).toEqual([
        'allowed-instance',
      ]);
    });
  });
});
