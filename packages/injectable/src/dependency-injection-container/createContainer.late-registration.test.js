import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';

describe('createContainer.late-registration', () => {
  it('given injectable registered by another injectable during injection, when thus registered injectable is injected, injects', async () => {
    const someInjectableForlateRegistration = getInjectable({
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
      someInjectableForlateRegistration,
      // Notice: the injectable is not registered before late.
      // someInjectableToBeRegisteredLate,
    );

    di.inject(someInjectableForlateRegistration);

    const actual = di.inject(someInjectableToBeRegisteredLate);

    expect(actual).toBe('some-instance');
  });

  it('given injectable registered by another injectable during setup, when thus registered injectable is injected, injects', async () => {
    const someInjectableForlateRegistration = getInjectable({
      id: 'some-injectable-for-late-registration',

      setup: di => {
        di.register(someInjectableToBeRegisteredLate);
      },

      instantiate: () => undefined,
    });

    const someInjectableToBeRegisteredLate = getInjectable({
      id: 'some-injectable-to-be-registered-late',

      instantiate: () => 'some-instance',
    });

    const di = getDi(
      someInjectableForlateRegistration,
      // Notice: the injectable is not registered before late.
      // someInjectableToBeRegisteredLate,
    );

    await di.runSetups();

    const actual = di.inject(someInjectableToBeRegisteredLate);

    expect(actual).toBe('some-instance');
  });

  it('given setups are already ran, when registering a setuppable, throws', async () => {
    const someSetuppableToBeRegisteredLate = getInjectable({
      id: 'some-setuppable-to-be-registered-late',

      setup: () => {},

      instantiate: () => undefined,
    });

    const di = getDi();

    await di.runSetups();

    expect(() => {
      di.register(someSetuppableToBeRegisteredLate);
    }).toThrow(
      'Tried to register setuppable "some-setuppable-to-be-registered-late" after setups have already ran.',
    );
  });

  it('given setups are being ran, when a setuppable registers another setuppable, throws', async () => {
    const someSetuppable = getInjectable({
      id: 'some-setuppable',

      setup: di => {
        di.register(someSetuppableToBeRegisteredLate);
      },

      instantiate: () => undefined,
    });

    const someSetuppableToBeRegisteredLate = getInjectable({
      id: 'some-setuppable-to-be-registered-late',

      setup: () => {},
    });

    const di = getDi(someSetuppable);

    return expect(di.runSetups()).rejects.toThrow(
      'Tried to register setuppable "some-setuppable-to-be-registered-late" during setup.',
    );
  });
});
