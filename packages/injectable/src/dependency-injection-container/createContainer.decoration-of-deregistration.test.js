import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { deregistrationDecoratorToken } from './createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.decoration-of-deregistration', () => {
  it('given there is decorator for deregistration, when an injectable is deregistered, calls decorator with injectable', () => {
    const di = createContainer('some-container');

    const deregisterDecoratorMock = jest.fn();

    const someDeregistrationDecorator = getInjectable({
      id: 'some-deregistration-decorator',

      instantiate: () => () => deregisterDecoratorMock,

      injectionToken: deregistrationDecoratorToken,
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someDeregistrationDecorator);
    di.register(someInjectable);

    di.deregister(someInjectable);

    expect(deregisterDecoratorMock.mock.calls).toEqual([[someInjectable]]);
  });

  it('given there is decorator for deregistration and injectable which registers, when the injectable is deregistered at root level, calls decorator for the injectable and all injectables directly or indirectly registered by it', () => {
    const di = createContainer('some-container');

    const deregisterDecoratorMock = jest.fn();

    const someDeregistrationDecorator = getInjectable({
      id: 'some-deregistration-decorator',

      instantiate:
        () =>
        toBeDecorated =>
        (...args) => {
          deregisterDecoratorMock(...args);
          toBeDecorated(...args);
        },

      injectionToken: deregistrationDecoratorToken,
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

    di.register(someDeregistrationDecorator);

    di.register(registererInjectable, someRootInjectable, unrelatedInjectable);

    const registerInContextOfRootInjectable = di.inject(someRootInjectable);

    registerInContextOfRootInjectable(someInjectable);

    di.deregister(someRootInjectable);

    expect(deregisterDecoratorMock.mock.calls).toEqual([
      [someRootInjectable],
      [someInjectable],
    ]);
  });

  it('given there is decorator for deregistration and injectable which registers, when the injectable is deregistered using another injectable, calls decorator for the injectable and all injectables directly or indirectly registered by it', () => {
    const di = createContainer('some-container');

    const deregisterDecoratorMock = jest.fn();

    const someDeregistrationDecorator = getInjectable({
      id: 'some-deregistration-decorator',

      instantiate:
        () =>
        toBeDecorated =>
        (...args) => {
          deregisterDecoratorMock(...args);
          toBeDecorated(...args);
        },

      injectionToken: deregistrationDecoratorToken,
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

    di.register(someDeregistrationDecorator);

    di.register(
      registererInjectable,
      deregistererInjectable,
      someRootInjectable,
    );

    const registerInContextOfRootInjectable = di.inject(someRootInjectable);
    registerInContextOfRootInjectable(someInjectable);

    const deregister = di.inject(deregistererInjectable);
    deregister(someRootInjectable);

    expect(deregisterDecoratorMock.mock.calls).toEqual([
      [someRootInjectable],
      [someInjectable],
    ]);
  });
});
