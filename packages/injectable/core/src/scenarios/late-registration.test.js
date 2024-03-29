import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';

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

    const di = createContainer('some-container');

    di.register(
      someInjectableForLateRegistration,
      // Notice: the injectable is not registered before late.
      // someInjectableToBeRegisteredLate,
    );

    di.inject(someInjectableForLateRegistration);

    const actual = di.inject(someInjectableToBeRegisteredLate);

    expect(actual).toBe('some-instance');
  });
});
