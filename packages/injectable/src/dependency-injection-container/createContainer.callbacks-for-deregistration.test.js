import { get } from 'lodash/fp';
import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { deregistrationCallbackToken } from './createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

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

    expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
      'some-root-injectable',
      'some-injectable',
    ]);
  });

  it('given there is callback for deregistration and injectable which registers, when the injectable is deregistered using another injectable, calls callback for the injectable and all injectables directly or indirectly registered by it', () => {
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

    expect(deregisterCallbackMock.mock.calls.map(get('0.id'))).toEqual([
      'some-root-injectable',
      'some-injectable',
    ]);
  });
});
