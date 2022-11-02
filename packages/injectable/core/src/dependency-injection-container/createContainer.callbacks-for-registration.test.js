import getInjectable from '../getInjectable/getInjectable';
import { createContainer } from '../../index';
import { registrationCallbackToken } from './createContainer';

describe('createContainer.callbacks-for-registration', () => {
  describe('given there is a callback for registration, and an injectable', () => {
    let di;
    let callbackMock;
    let someInjectable;
    let someRegistrationCallbackInjectable;

    beforeEach(() => {
      di = createContainer('some-container');
      callbackMock = jest.fn();

      someRegistrationCallbackInjectable = getInjectable({
        id: 'some-registration-callback',

        instantiate: () => callbackMock,

        injectionToken: registrationCallbackToken,
      });

      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'irrelevant',
      });
    });

    it('when the both are registered together callback first, calls the callback with the injectable', () => {
      di.register(someRegistrationCallbackInjectable, someInjectable);

      expect(callbackMock).toHaveBeenCalledWith(someInjectable);
    });

    it('when the both are registered together injectable first, still calls the callback with the injectable', () => {
      di.register(someInjectable, someRegistrationCallbackInjectable);

      expect(callbackMock).toHaveBeenCalledWith(someInjectable);
    });

    it('when the both are registered separately callback first, calls the callback with the injectable', () => {
      di.register(someRegistrationCallbackInjectable);
      di.register(someInjectable);

      expect(callbackMock).toHaveBeenCalledWith(someInjectable);
    });

    it('when the both are registered separately injectable first, does not call the callback', () => {
      di.register(someInjectable);
      di.register(someRegistrationCallbackInjectable);

      expect(callbackMock).not.toHaveBeenCalledWith(someInjectable);
    });
  });
});
