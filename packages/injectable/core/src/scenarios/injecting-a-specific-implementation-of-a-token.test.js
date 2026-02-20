import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('injecting-a-specific-implementation-of-a-token', () => {
  let di;

  beforeEach(() => {
    di = createContainer('irrelevant');
  });

  describe('given injection token, and multiple injectables implementing it, and one of them having a specific key', () => {
    let someGeneralInjectionToken;
    let unrelatedInstantiateMock;
    let someSpecificInjectable;

    beforeEach(() => {
      someGeneralInjectionToken = getInjectionToken({
        id: 'some-injection-token',

        specificInjectionTokenFactory: ({ someSpeciality }) =>
          getInjectionToken({
            id: 'some-speciality',
            speciality: someSpeciality,
          }),
      });

      unrelatedInstantiateMock = jest.fn(() => 'some-unspecific-instance');

      someSpecificInjectable = getInjectable({
        id: 'some-specific-injectable',
        instantiate: () => 'some-specific-instance',

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-speciality',
        }),
      });

      const someOtherSpecificInjectable = getInjectable({
        id: 'some-other-specific-injectable',
        instantiate: unrelatedInstantiateMock,

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-other-speciality',
        }),
      });

      di.register(someSpecificInjectable, someOtherSpecificInjectable);
    });

    describe('when injecting the specific injection token', () => {
      let actual;

      beforeEach(() => {
        actual = di.inject(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-speciality',
          }),
        );
      });

      it('injects the specific instance', () => {
        expect(actual).toBe('some-specific-instance');
      });

      it('does not instantiate the unrelated injectable', () => {
        expect(unrelatedInstantiateMock).not.toHaveBeenCalled();
      });

      describe('given the specific injectable is de-registered', () => {
        beforeEach(() => {
          di.deregister(someSpecificInjectable);
        });

        it('when injecting it using the specific token, throws', () => {
          expect(() => {
            di.inject(
              someGeneralInjectionToken.for({
                someSpeciality: 'some-speciality',
              }),
            );
          }).toThrow(
            'Tried to inject non-registered injectable "irrelevant" -> "(some-injection-token/some-speciality)".',
          );
        });

        it('when injecting many using the general token, does not inject the now de-registered instance', () => {
          const actual = di.injectMany(someGeneralInjectionToken);

          expect(actual).toEqual(['some-unspecific-instance']);
        });
      });
    });

    describe('when injecting many for the specific injection token', () => {
      let actual;

      beforeEach(() => {
        actual = di.injectMany(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-speciality',
          }),
        );
      });

      it('injects the specific instance', () => {
        expect(actual).toEqual(['some-specific-instance']);
      });

      it('does not instantiate the unrelated injectable', () => {
        expect(unrelatedInstantiateMock).not.toHaveBeenCalled();
      });
    });

    describe('when injecting many for injection token as non-specific', () => {
      let actual;

      beforeEach(() => {
        // Note: missing .for() makes the injection token non-specific.
        actual = di.injectMany(someGeneralInjectionToken);
      });

      it('injects all the instances, specific or not', () => {
        expect(actual).toEqual([
          'some-specific-instance',
          'some-unspecific-instance',
        ]);
      });
    });

    it('given there are more than one injectables with the same speciality, when injecting the specific injection token, throws', () => {
      const someInjectableWithCollidingSpeciality = getInjectable({
        id: 'some-injectable-with-colliding-speciality',
        instantiate: () => 'irrelevant',

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-colliding-speciality',
        }),
      });

      const someOtherInjectableWithCollidingSpeciality = getInjectable({
        id: 'some-other injectable-with-colliding-speciality',
        instantiate: () => 'irrelevant',

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-colliding-speciality',
        }),
      });

      di.register(
        someInjectableWithCollidingSpeciality,
        someOtherInjectableWithCollidingSpeciality,
      );

      expect(() => {
        di.inject(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-colliding-speciality',
          }),
        );
      }).toThrow(
        'Tried to inject single injectable for injection token "some-injection-token/some-speciality" but found multiple injectables: "some-injectable-with-colliding-speciality", "some-other injectable-with-colliding-speciality"',
      );
    });

    it('when injecting non-existing specific injection token, throws', () => {
      expect(() => {
        di.inject(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-non-existing-speciality',
          }),
        );
      }).toThrow(
        'Tried to inject non-registered injectable "irrelevant" -> "(some-injection-token/some-speciality)".',
      );
    });
  });

  it('given general injection token with multiple specifiers, and specific injectables, when injecting specific one, does so', () => {
    const someGeneralInjectionTokenWithMultipleSpecifiers = getInjectionToken({
      id: 'some-general-injection-token-with-multiple-specifiers',

      specificInjectionTokenFactory: (specifier1, specifier2) =>
        getInjectionToken({
          id: 'some-speciality',
          speciality: specifier1 + specifier2,
        }),
    });

    const someSpecificInjectable = getInjectable({
      id: 'some-specific-injectable',
      instantiate: () => 'some-specific-instance-1',

      injectionToken: someGeneralInjectionTokenWithMultipleSpecifiers.for(
        'some-specifier-1',
        'some-specifier-2',
      ),
    });

    const someSpecificInjectable2 = getInjectable({
      id: 'some-specific-injectable-2',
      instantiate: () => 'some-specific-instance-2',

      injectionToken: someGeneralInjectionTokenWithMultipleSpecifiers.for(
        'some-specifier-1',
        'some-other-specifier-2',
      ),
    });

    di.register(someSpecificInjectable, someSpecificInjectable2);

    const actual = di.inject(
      someGeneralInjectionTokenWithMultipleSpecifiers.for(
        'some-specifier-1',
        'some-other-specifier-2',
      ),
    );

    expect(actual).toBe('some-specific-instance-2');
  });

  it('given general injection token without explicit specific injection token factory, and specific injectables, when injecting specific one using the defaulted factory for "id", does so', () => {
    const someGeneralInjectionTokenWithoutFactory = getInjectionToken({
      id: 'some-general-injection-token-with-multiple-specifiers',
    });

    const someSpecificInjectable = getInjectable({
      id: 'some-specific-injectable',
      instantiate: () => 'some-specific-instance-1',

      injectionToken:
        someGeneralInjectionTokenWithoutFactory.for('some-specific-id'),
    });

    const someSpecificInjectable2 = getInjectable({
      id: 'some-specific-injectable-2',
      instantiate: () => 'some-specific-instance-2',

      injectionToken: someGeneralInjectionTokenWithoutFactory.for(
        'some-other-specific-id',
      ),
    });

    di.register(someSpecificInjectable, someSpecificInjectable2);

    const actual = di.inject(
      someGeneralInjectionTokenWithoutFactory.for('some-other-specific-id'),
    );

    expect(actual).toBe('some-specific-instance-2');
  });

  describe('given general injection token, and deeply specific injectables for it', () => {
    let someGeneralInjectionToken;
    let someDeeplySpecificInjectable2;

    beforeEach(() => {
      someGeneralInjectionToken = getInjectionToken({
        id: 'some-general-injection-token',
      });

      const someDeeplySpecificInjectable1 = getInjectable({
        id: 'some-deeply-specific-injectable-1',
        instantiate: () => 'some-deeply-specific-instance-1',

        injectionToken: someGeneralInjectionToken
          .for('some-specific-id')
          .for('some-more-specific-id'),
      });

      someDeeplySpecificInjectable2 = getInjectable({
        id: 'some-deeply-specific-injectable-2',
        instantiate: () => 'some-deeply-specific-instance-2',
        injectionToken: someGeneralInjectionToken
          .for('some-specific-id')
          .for('some-other-more-specific-id'),
      });

      const someShallowlySpecificInjectable = getInjectable({
        id: 'some-shallowly-specific-injectable',
        instantiate: () => 'some-shallowly-specific-instance',
        injectionToken: someGeneralInjectionToken.for('some-specific-id'),
      });

      const someGeneralInjectable = getInjectable({
        id: 'some-general-injectable',
        instantiate: () => 'some-general-instance',
        injectionToken: someGeneralInjectionToken,
      });

      di.register(
        someDeeplySpecificInjectable1,
        someDeeplySpecificInjectable2,
        someShallowlySpecificInjectable,
        someGeneralInjectable,
      );
    });

    it('when injecting a deeply specific instance, does so', () => {
      const actual = di.inject(
        someGeneralInjectionToken
          .for('some-specific-id')
          .for('some-more-specific-id'),
      );

      expect(actual).toBe('some-deeply-specific-instance-1');
    });

    it('when injecting many "shallowly" specific instances, does so', () => {
      const actual = di.injectMany(
        someGeneralInjectionToken.for('some-specific-id'),
      );

      expect(actual).toEqual([
        'some-deeply-specific-instance-1',
        'some-deeply-specific-instance-2',
        'some-shallowly-specific-instance',
      ]);
    });

    it('when injecting many general instances, does so', () => {
      const actual = di.injectMany(someGeneralInjectionToken);

      expect(actual).toEqual([
        'some-deeply-specific-instance-1',
        'some-deeply-specific-instance-2',
        'some-shallowly-specific-instance',
        'some-general-instance',
      ]);
    });

    describe('given a deeply specific injectable is deregistered', () => {
      beforeEach(() => {
        di.deregister(someDeeplySpecificInjectable2);
      });

      it('when injecting many deeply specific instances, does so without the deregistered one', () => {
        const actual = di.injectMany(
          someGeneralInjectionToken
            .for('some-specific-id')
            .for('some-more-specific-id'),
        );

        expect(actual).toEqual(['some-deeply-specific-instance-1']);
      });

      it('when injecting many "shallowly" specific instances, does so without the deregistered one', () => {
        const actual = di.injectMany(
          someGeneralInjectionToken.for('some-specific-id'),
        );

        expect(actual).toEqual([
          'some-deeply-specific-instance-1',
          'some-shallowly-specific-instance',
        ]);
      });

      it('when injecting many general instances, does so without the deregistered one', () => {
        const actual = di.injectMany(someGeneralInjectionToken);

        expect(actual).toEqual([
          'some-deeply-specific-instance-1',
          'some-shallowly-specific-instance',
          'some-general-instance',
        ]);
      });
    });
  });

  describe('given injection token, and an injectable being both specific and keyed implementing it', () => {
    let someGeneralInjectionToken;
    let unrelatedInstantiateMock;
    let someSpecificInjectable;

    beforeEach(() => {
      someGeneralInjectionToken = getInjectionToken({
        id: 'some-injection-token',

        specificInjectionTokenFactory: ({ someSpeciality }) =>
          getInjectionToken({
            id: 'some-speciality',
            speciality: someSpeciality,
          }),
      });

      unrelatedInstantiateMock = jest.fn(
        (di, key) => `some-unspecific-instance-for-${key}`,
      );

      someSpecificInjectable = getInjectable({
        id: 'some-specific-injectable',
        instantiate: (di, key) => `some-specific-instance-for-${key}`,

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-speciality',
        }),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, key) => key,
        }),
      });

      const someOtherSpecificInjectable = getInjectable({
        id: 'some-other-specific-injectable',
        instantiate: unrelatedInstantiateMock,

        injectionToken: someGeneralInjectionToken.for({
          someSpeciality: 'some-other-speciality',
        }),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, key) => key,
        }),
      });

      di.register(someSpecificInjectable, someOtherSpecificInjectable);
    });

    describe('when injecting the specific injection token using the key as instantiation parameter', () => {
      let actual;

      beforeEach(() => {
        actual = di.inject(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-speciality',
          }),

          'some-key',
        );
      });

      it('injects the specific instance', () => {
        expect(actual).toBe('some-specific-instance-for-some-key');
      });

      it('does not instantiate the unrelated injectable', () => {
        expect(unrelatedInstantiateMock).not.toHaveBeenCalled();
      });

      describe('given the specific injectable is de-registered', () => {
        beforeEach(() => {
          di.deregister(someSpecificInjectable);
        });

        it('when injecting it using the specific token, throws', () => {
          expect(() => {
            di.inject(
              someGeneralInjectionToken.for({
                someSpeciality: 'some-speciality',
              }),
              'irrelevant',
            );
          }).toThrow(
            'Tried to inject non-registered injectable "irrelevant" -> "(some-injection-token/some-speciality)".',
          );
        });

        it('when injecting many using the more general token, does not inject the now de-registered instance', () => {
          const actual = di.injectMany(
            someGeneralInjectionToken,
            'some-other-key',
          );

          expect(actual).toEqual([
            'some-unspecific-instance-for-some-other-key',
          ]);
        });
      });
    });

    describe('when injecting many for the specific injection token', () => {
      let actual;

      beforeEach(() => {
        actual = di.injectMany(
          someGeneralInjectionToken.for({
            someSpeciality: 'some-speciality',
          }),

          'some-key',
        );
      });

      it('injects the specific instance', () => {
        expect(actual).toEqual(['some-specific-instance-for-some-key']);
      });

      it('does not instantiate the unrelated injectable', () => {
        expect(unrelatedInstantiateMock).not.toHaveBeenCalled();
      });
    });

    describe('when injecting many for injection token as non-specific, but using a key as instantiation paramater', () => {
      let actual;

      beforeEach(() => {
        // Note: missing .for() makes the injection token non-specific.
        actual = di.injectMany(someGeneralInjectionToken, 'some-key');
      });

      it('injects all the keyed instances, specific or not', () => {
        expect(actual).toEqual([
          'some-specific-instance-for-some-key',
          'some-unspecific-instance-for-some-key',
        ]);
      });
    });
  });
});
