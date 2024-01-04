import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('early-override', () => {
  describe('given a still non-registered injectable', () => {
    let di;
    let someInjectable;
    let someInjectionToken;

    beforeEach(() => {
      di = createContainer('irrelevant');

      someInjectionToken = getInjectionToken({ id: 'some-token-id' });
    });

    describe('when early-overriding an injection token', () => {
      beforeEach(() => {
        di.earlyOverride(someInjectionToken, () => 'some-overridden-instance');
      });

      it('given the injectable is still non-registered, when injected, injects the override', () => {
        const actual = di.inject(someInjectionToken);

        expect(actual).toBe('some-overridden-instance');
      });

      describe('given the injectable is registered', () => {
        let someInjectable;

        beforeEach(() => {
          someInjectable = getInjectable({
            id: 'some-injectable',
            instantiate: di => 'irrelevant',
            injectionToken: someInjectionToken,
          });

          di.register(someInjectable);
        });

        fit('when injected using token, injects the override', () => {
          const actual = di.inject(someInjectionToken);

          expect(actual).toBe('some-overridden-instance');
        });

        it('when injected using injectable, injects the override', () => {
          const actual = di.inject(someInjectable);

          expect(actual).toBe('some-overridden-instance');
        });

        it('given overridden again using injectable, when injected, injects the override', () => {
          di.override(someInjectable, () => 'some-other-overridden-instance');

          const actual = di.inject(someInjectionToken);

          expect(actual).toBe('some-other-overridden-instance');
        });

        it('given overridden again using token, when injected, injects the override', () => {
          di.override(
            someInjectionToken,
            () => 'some-other-overridden-instance',
          );

          const actual = di.inject(someInjectionToken);

          expect(actual).toBe('some-other-overridden-instance');
        });

        describe('given overridden again with both ways', () => {
          beforeEach(() => {
            di.override(someInjectionToken, () => 'irrelevant');

            di.override(someInjectable, () => 'some-other-overridden-instance');
          });

          it('when injected using token, injects the latest override', () => {
            const actual = di.inject(someInjectionToken);

            expect(actual).toBe('some-other-overridden-instance');
          });

          it('when injected using injectable, injects the latest override', () => {
            const actual = di.inject(someInjectable);

            expect(actual).toBe('some-other-overridden-instance');
          });
        });
      });
    });

    describe('when early-overriding it using injectable', () => {
      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        });

        di.earlyOverride(someInjectable, () => 'some-overridden-instance');
      });

      describe('given the injectable is still non-registered', () => {
        it('when injected, throws as normal', () => {
          expect(() => {
            di.inject(someInjectable);
          }).toThrow(
            'Tried to inject non-registered injectable "irrelevant" -> "some-injectable".',
          );
        });

        it('when injected using token, throws as normal', () => {
          expect(() => {
            di.inject(someInjectionToken);
          }).toThrow(
            'Tried to inject non-registered injectable "irrelevant" -> "some-token-id".',
          );
        });
      });

      describe('given the injectable is registered', () => {
        beforeEach(() => {
          di.register(someInjectable);
        });

        it('when injected, returns the overridden instance', () => {
          const actual = di.inject(someInjectable);

          expect(actual).toBe('some-overridden-instance');
        });

        it('when injected using token, returns the overridden instance', () => {
          const actual = di.inject(someInjectionToken);

          expect(actual).toBe('some-overridden-instance');
        });

        it('when injecting many using token, returns the overridden instance', () => {
          const actual = di.injectMany(someInjectionToken);

          expect(actual).toEqual(['some-overridden-instance']);
        });

        it('given injected, when the early-overridden again, throws', () => {
          di.inject(someInjectionToken);

          expect(() => {
            di.earlyOverride(someInjectable);
          }).toThrow(
            'Tried to override injectable "some-injectable", but it was already injected.',
          );
        });

        describe('given unoverridden', () => {
          beforeEach(() => {
            di.unoverride(someInjectable);
          });

          it('when injected, returns the original instance', () => {
            const actual = di.inject(someInjectable);

            expect(actual).toBe('some-instance');
          });

          it('when injected using token, returns the original instance', () => {
            const actual = di.inject(someInjectionToken);

            expect(actual).toBe('some-instance');
          });
        });
      });
    });
  });
});
