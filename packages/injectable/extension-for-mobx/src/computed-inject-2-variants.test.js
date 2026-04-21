import { autorun, configure, runInAction } from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectable2,
  getInjectionToken,
  getInjectionToken2,
} from '@lensapp/injectable';

import {
  computedInjectMany2InjectionToken,
  computedInjectManyWithMeta2InjectionToken,
} from './computedInjectMany';
import { computedInjectMaybe2InjectionToken } from './computedInjectMaybe';
import { registerMobX } from './registerMobx';

describe('factory-shape computed-inject-2 variants', () => {
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

  describe('computedInjectMany2', () => {
    it('given v1 token, fn(token)() returns IComputedValue of instance array that reacts to registrations', () => {
      const someToken = getInjectionToken({ id: 'many-2-v1-token' });

      const firstImpl = getInjectable({
        id: 'first-impl',
        instantiate: () => 'first',
        injectionToken: someToken,
      });

      di.register(firstImpl);

      const computedInjectMany2 = di.inject2(computedInjectMany2InjectionToken);
      const factoryForToken = computedInjectMany2(someToken);
      const reactiveInstances = factoryForToken();

      const observed = [];
      const stop = autorun(() => {
        observed.push([...reactiveInstances.get()]);
      });

      expect(observed).toEqual([['first']]);

      const secondImpl = getInjectable({
        id: 'second-impl',
        instantiate: () => 'second',
        injectionToken: someToken,
      });

      runInAction(() => di.register(secondImpl));

      expect(observed).toEqual([['first'], ['first', 'second']]);

      stop();
    });

    it('given v2 token with a param, fn(token) returns a factory that accepts the param', () => {
      const someToken2 = getInjectionToken2({ id: 'many-2-v2-token' });

      const impl = getInjectable2({
        id: 'v2-impl',
        injectionToken: someToken2,
        instantiate: () => key => `instance-${key}`,
      });

      di.register(impl);

      const computedInjectMany2 = di.inject2(computedInjectMany2InjectionToken);
      const factoryForToken = computedInjectMany2(someToken2);

      const observed = [];
      const stop = autorun(() => {
        observed.push([...factoryForToken('a').get()]);
      });

      expect(observed).toEqual([['instance-a']]);

      stop();
    });

    it('given same token and same args, fn(token)(...args) hits the same reactive instance (referentially stable)', () => {
      const someToken = getInjectionToken({ id: 'many-2-stable-token' });

      const impl = getInjectable({
        id: 'stable-impl',
        instantiate: () => 'stable',
        injectionToken: someToken,
      });

      di.register(impl);

      const computedInjectMany2 = di.inject2(computedInjectMany2InjectionToken);
      const factoryForToken = computedInjectMany2(someToken);

      const first = factoryForToken();
      const second = factoryForToken();

      expect(first).toBe(second);
    });
  });

  describe('computedInjectManyWithMeta2', () => {
    it('given v1 token, fn(token)() returns IComputedValue of instance-with-meta array', () => {
      const someToken = getInjectionToken({ id: 'many-meta-2-token' });

      const impl = getInjectable({
        id: 'meta-impl',
        instantiate: () => 'value',
        injectionToken: someToken,
      });

      di.register(impl);

      const computedInjectManyWithMeta2 = di.inject2(
        computedInjectManyWithMeta2InjectionToken,
      );
      const factoryForToken = computedInjectManyWithMeta2(someToken);

      const observed = [];
      const stop = autorun(() => {
        observed.push(factoryForToken().get());
      });

      expect(observed).toEqual([
        [{ instance: 'value', meta: { id: 'meta-impl' } }],
      ]);

      stop();
    });
  });

  describe('computedInjectMaybe2', () => {
    it('given token with one impl, fn(token)() returns IComputedValue of that instance', () => {
      const someToken = getInjectionToken({ id: 'maybe-2-token' });

      const impl = getInjectable({
        id: 'maybe-impl',
        instantiate: () => 'the-value',
        injectionToken: someToken,
      });

      di.register(impl);

      const computedInjectMaybe2 = di.inject2(
        computedInjectMaybe2InjectionToken,
      );
      const factoryForToken = computedInjectMaybe2(someToken);

      const observed = [];
      const stop = autorun(() => {
        observed.push(factoryForToken().get());
      });

      expect(observed).toEqual(['the-value']);

      stop();
    });

    it('given token with zero impls, fn(token)() returns IComputedValue of undefined', () => {
      const someToken = getInjectionToken({ id: 'maybe-2-empty-token' });

      const computedInjectMaybe2 = di.inject2(
        computedInjectMaybe2InjectionToken,
      );
      const factoryForToken = computedInjectMaybe2(someToken);

      const observed = [];
      const stop = autorun(() => {
        observed.push(factoryForToken().get());
      });

      expect(observed).toEqual([undefined]);

      stop();
    });

    it('given v2 token with a param, fn(token) returns a factory that accepts the param', () => {
      const someToken2 = getInjectionToken2({ id: 'maybe-2-v2-token' });

      const impl = getInjectable2({
        id: 'maybe-v2-impl',
        injectionToken: someToken2,
        instantiate: () => key => `maybe-${key}`,
      });

      di.register(impl);

      const computedInjectMaybe2 = di.inject2(
        computedInjectMaybe2InjectionToken,
      );
      const factoryForToken = computedInjectMaybe2(someToken2);

      const observed = [];
      const stop = autorun(() => {
        observed.push(factoryForToken('x').get());
      });

      expect(observed).toEqual(['maybe-x']);

      stop();
    });
  });
});
