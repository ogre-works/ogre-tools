import { get } from 'lodash/fp';
import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { deregistrationCallbackToken } from '../dependency-injection-container/tokens';
import getInjectableBunch from '../getInjectableBunch/getInjectableBunch';
import getInjectable2 from '../getInjectable2/getInjectable2';

describe('createContainer.callbacks-for-deregistration', () => {
  describe('given there is an injectable and callback for deregistration', () => {
    let di;
    let someInjectable;
    let someDeregistrationCallbackInjectable;
    let deregisterCallbackMock;

    beforeEach(() => {
      di = createContainer('some-container');

      deregisterCallbackMock = jest.fn();

      someDeregistrationCallbackInjectable = getInjectable({
        id: 'some-deregistration-callback',

        instantiate: () => deregisterCallbackMock,

        injectionToken: deregistrationCallbackToken,
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
      });

      di.register(someDeregistrationCallbackInjectable, someInjectable);
    });

    it('when the injectable is deregistered, calls callback with injectable', () => {
      di.deregister(someInjectable);

      expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
        'some-injectable',
      ]);
    });

    it('when the injectable is deregistered together with the callback, still calls the callback with the injectable', () => {
      di.deregister(someDeregistrationCallbackInjectable, someInjectable);

      expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
        'some-deregistration-callback',
        'some-injectable',
      ]);
    });
  });

  describe('given there is an injectable bunch and callback for deregistration', () => {
    let di;
    let someInjectable;
    let someBunch;
    let someDeregistrationCallbackInjectable;
    let deregisterCallbackMock;

    beforeEach(() => {
      di = createContainer('some-container');

      deregisterCallbackMock = jest.fn();

      someDeregistrationCallbackInjectable = getInjectable({
        id: 'some-deregistration-callback',

        instantiate: () => deregisterCallbackMock,

        injectionToken: deregistrationCallbackToken,
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
      });

      someBunch = getInjectableBunch({
        someInjectable,
      });

      di.register(someDeregistrationCallbackInjectable, someBunch);
    });

    it('when the injectable is deregistered, calls callback with injectable', () => {
      di.deregister(someBunch);

      expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
        'some-injectable',
      ]);
    });

    it('when the injectable is deregistered together with the callback, still calls the callback with the injectable', () => {
      di.deregister(someDeregistrationCallbackInjectable, someBunch);

      expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
        'some-deregistration-callback',
        'some-injectable',
      ]);
    });
  });

  it('given there is callback for deregistration and injectable which registers, when the injectable is deregistered at root level, calls callback for the injectable and all injectables directly or indirectly registered by it', () => {
    const di = createContainer('some-container');

    const deregisterCallbackMock = jest.fn();

    const someDeregistrationCallback = getInjectable({
      id: 'some-deregistration-callback',

      instantiate: () => deregisterCallbackMock,

      injectionToken: deregistrationCallbackToken,
    });

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const someRootInjectable = getInjectable({
      id: 'some-root-injectable',

      instantiate: di => injectable =>
        di.injectMany(someInjectionToken).forEach(x => x(injectable)),
    });

    const registererInjectable = getInjectable({
      id: 'registerer',

      instantiate: di => injectable => {
        di.inject(unrelatedInjectable);
        di.register(injectable);
      },

      injectionToken: someInjectionToken,
    });

    const unrelatedInjectable = getInjectable({
      id: 'some-unrelated-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(
      someDeregistrationCallback,
      registererInjectable,
      someRootInjectable,
      unrelatedInjectable,
    );

    const registerInContextOfRootInjectable = di.inject(someRootInjectable);

    registerInContextOfRootInjectable(someInjectable);

    di.deregister(someRootInjectable);

    // someInjectable was registered by registererInjectable, not someRootInjectable,
    // so only someRootInjectable itself is deregistered
    expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
      'some-root-injectable',
    ]);
  });

  it('given there is callback for deregistration and injectable which registers, when the injectable is deregistered using another injectable, calls callback for the injectable only', () => {
    const di = createContainer('some-container');

    const deregisterCallbackMock = jest.fn();

    const someDeregistrationCallback = getInjectable({
      id: 'some-deregistration-callback',

      instantiate: () => deregisterCallbackMock,

      injectionToken: deregistrationCallbackToken,
    });

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const someRootInjectable = getInjectable({
      id: 'some-root-injectable',

      instantiate: di => injectable =>
        di.injectMany(someInjectionToken).forEach(x => x(injectable)),
    });

    const registererInjectable = getInjectable({
      id: 'registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },

      injectionToken: someInjectionToken,
    });

    const deregistererInjectable = getInjectable({
      id: 'deregisterer',
      instantiate:
        di =>
        (...args) =>
          di.deregister(...args),
    });

    di.register(
      someDeregistrationCallback,
      registererInjectable,
      deregistererInjectable,
      someRootInjectable,
    );

    const registerInContextOfRootInjectable = di.inject(someRootInjectable);
    registerInContextOfRootInjectable(someInjectable);

    const deregister = di.inject(deregistererInjectable);
    deregister(someRootInjectable);

    // someInjectable was registered by registererInjectable, not someRootInjectable
    expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
      'some-root-injectable',
    ]);
  });

  describe('given a scope has registered injectables, and an injectable2 is a callback for deregistration', () => {
    let di;
    let someScopeInjectable;
    let someInjectableInScope;
    let deregisterCallbackMock;

    beforeEach(() => {
      di = createContainer('some-container');

      deregisterCallbackMock = jest.fn();

      const someDeregistrationCallbackInjectable = getInjectable2({
        id: 'some-deregistration-callback',
        instantiate: () => () => deregisterCallbackMock,
        injectionToken: deregistrationCallbackToken,
      });

      someInjectableInScope = getInjectable2({
        id: 'some-injectable-in-scope',

        instantiate: di => () => di.sourceNamespace,
      });

      someScopeInjectable = getInjectable2({
        id: 'some-scope',

        instantiate: di => () => {
          di.register(someInjectableInScope);
        },
      });

      di.register(someDeregistrationCallbackInjectable, someScopeInjectable);

      di.inject2(someScopeInjectable)();
    });

    it('when the scope is deregistered, calls the callback with the namespaced id of the scope and of what it takes along', () => {
      di.deregister(someScopeInjectable);

      expect(deregisterCallbackMock.mock.calls.map(get('2'))).toEqual([
        'some-scope',
        'some-scope:some-injectable-in-scope',
      ]);
    });

    it('the namespaced id of the scope is what its injectables know as their source namespace when injecting', () => {
      const someInjectingInjectable = getInjectable2({
        id: 'some-injecting',
        instantiate: di => () => di.inject(someInjectableInScope)(),
      });

      const someOtherScopeInjectable = getInjectable2({
        id: 'some-other-scope',

        instantiate: di => () => {
          di.register(someInjectingInjectable);
        },
      });

      di.register(someOtherScopeInjectable);
      di.inject2(someOtherScopeInjectable)();

      const sourceNamespace = di.inject2(someInjectingInjectable)();

      di.deregister(someOtherScopeInjectable);

      expect(deregisterCallbackMock.mock.calls.map(get('2'))).toContain(
        sourceNamespace,
      );
    });
  });
});
