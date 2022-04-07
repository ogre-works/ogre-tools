import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { deregistrationDecoratorToken } from './createContainer';

describe('createContainer.decoration-of-deregistration', () => {
  describe('given there is decorator for deregistration, when an injectable is deregistered, ', () => {
    let someInjectable;
    let di;
    let deregisterDecoratorMock;

    beforeEach(() => {
      di = createContainer();

      deregisterDecoratorMock = jest.fn();

      const someDeregistrationDecorator = getInjectable({
        id: 'some-deregistration-decorator',

        instantiate: () => () => deregisterDecoratorMock,

        injectionToken: deregistrationDecoratorToken,
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
      });

      di.register(someDeregistrationDecorator);
      di.register(someInjectable);
    });

    it('when the injectable is deregistered, calls decorator with injectable', () => {
      di.deregister(someInjectable);

      expect(deregisterDecoratorMock).toHaveBeenCalledWith(someInjectable);
    });
  });
});
