import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { registrationDecoratorToken } from './createContainer';

describe('createContainer.decoration-of-registration', () => {
  describe('given there is decorator for registration, when an injectable is registered', () => {
    let someInjectable;
    let di;

    beforeEach(() => {
      di = createContainer('some-container');

      const someRegistrationDecorator = getInjectable({
        id: 'some-registration-decorator',

        instantiate:
          () =>
          toBeDecorated =>
          (injectable, ...args) =>
            toBeDecorated(
              {
                ...injectable,
                instantiate: () => 'some-instance-from-decorator',
              },

              ...args,
            ),

        injectionToken: registrationDecoratorToken,
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
      });

      di.register(someRegistrationDecorator);
      di.register(someInjectable);
    });

    it('when the injectable is injected, injects instance using decorated registration', () => {
      const actualInstance = di.inject(someInjectable);

      expect(actualInstance).toBe('some-instance-from-decorator');
    });
  });
});
