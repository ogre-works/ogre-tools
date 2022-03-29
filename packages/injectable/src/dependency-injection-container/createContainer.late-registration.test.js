import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';

describe('createContainer.late-registration', () => {
  it('given injectable registered by another injectable during injection, when thus registered injectable is injected, injects', async () => {
    const someInjectableForLateRegistration = getInjectable({
      id: 'some-injectable-for-late-registration',

      instantiate: di => {
        di.register(someInjectableToBeRegisteredLate);
      },
    });

    const someInjectableToBeRegisteredLate = getInjectable({
      id: 'some-injectable-to-be-registered-late',

      instantiate: () => 'some-instance',
    });

    const di = getDi(
      someInjectableForLateRegistration,
      // Notice: the injectable is not registered before late.
      // someInjectableToBeRegisteredLate,
    );

    di.inject(someInjectableForLateRegistration);

    const actual = di.inject(someInjectableToBeRegisteredLate);

    expect(actual).toBe('some-instance');
  });
});
