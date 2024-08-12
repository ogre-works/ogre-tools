import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';

import {
  deregistrationCallbackToken,
  registrationCallbackToken,
} from '../dependency-injection-container/tokens';

import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('conditional registration of injectables which only register with other injectables', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given an injectable bound to initially unregistered injectables, when registered', () => {
    let someBindingTargetInjectable1;
    let someBindingTargetInjectable2;
    let someBoundInjectable;
    let someHigherOrderBoundInjectable;
    let registrationCallbackMock;
    let deregistrationCallbackMock;

    beforeEach(() => {
      someBindingTargetInjectable1 = getInjectable({
        id: 'some-binding-target-injectable-1',
        instantiate: () => 'irrelevant',
      });

      someBindingTargetInjectable2 = getInjectable({
        id: 'some-binding-target-injectable-2',
        instantiate: () => 'irrelevant',
      });

      const someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someBoundInjectable = getInjectable({
        id: 'some-bound-injectable',
        instantiate: () => 'some-instance',
        registersWith: [
          someBindingTargetInjectable1,
          someBindingTargetInjectable2,
        ],
        injectionToken: someInjectionToken,
      });

      someHigherOrderBoundInjectable = getInjectable({
        id: 'some-higher-order-bound-injectable',
        instantiate: () => 'some-instance-2',
        registersWith: [someInjectionToken],
      });

      registrationCallbackMock = jest.fn();

      const someRegistrationCallbackInjectable = getInjectable({
        id: 'some-registration-callback',

        instantiate: () => registrationCallbackMock,

        injectionToken: registrationCallbackToken,
      });

      deregistrationCallbackMock = jest.fn();

      const somederegistrationCallbackInjectable = getInjectable({
        id: 'some-deregistration-callback',

        instantiate: () => deregistrationCallbackMock,

        injectionToken: deregistrationCallbackToken,
      });

      di.register(
        someBoundInjectable,
        someHigherOrderBoundInjectable,
        someRegistrationCallbackInjectable,
        somederegistrationCallbackInjectable,
      );
    });

    it('does not trigger a registration callback for the bound injectable yet', () => {
      expect(registrationCallbackMock).not.toHaveBeenCalledWith(
        someBoundInjectable,
      );
    });

    it('does not trigger a registration callback for a higher order bound injectable yet', () => {
      expect(registrationCallbackMock).not.toHaveBeenCalledWith(
        someHigherOrderBoundInjectable,
      );
    });

    it('when injecting the bound injectable, throws for the injectable not being really registered', () => {
      expect(() => {
        di.inject(someBoundInjectable);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
      );
    });

    it('when injecting a higher order bound injectable, throws for the injectable not being really registered', () => {
      expect(() => {
        di.inject(someHigherOrderBoundInjectable);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
      );
    });

    describe('given just one of target of bindings is registered', () => {
      beforeEach(() => {
        registrationCallbackMock.mockClear();

        di.register(someBindingTargetInjectable1);
      });

      it('does not trigger a registration callback for the bound injectable yet', () => {
        expect(registrationCallbackMock).not.toHaveBeenCalledWith(
          someBoundInjectable,
        );
      });

      it('does not trigger a registration callback for a higher order bound injectable yet', () => {
        expect(registrationCallbackMock).not.toHaveBeenCalledWith(
          someHigherOrderBoundInjectable,
        );
      });

      it('when injecting the bound injectable, throws for the injectable not being really registered', () => {
        expect(() => {
          di.inject(someBoundInjectable);
        }).toThrow(
          'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
        );
      });

      it('when injecting a higher order bound injectable, throws for the injectable not being really registered', () => {
        expect(() => {
          di.inject(someHigherOrderBoundInjectable);
        }).toThrow(
          'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
        );
      });

      describe('given rest of target of bindings get registered', () => {
        beforeEach(() => {
          registrationCallbackMock.mockClear();

          di.register(someBindingTargetInjectable2);
        });

        it('when injecting the bound injectable, does so', () => {
          expect(di.inject(someBoundInjectable)).toBe('some-instance');
        });

        it('when injecting a higher order bound injectable, does so', () => {
          expect(di.inject(someHigherOrderBoundInjectable)).toBe(
            'some-instance-2',
          );
        });

        it('triggers a registration callback also for the bound injectable', () => {
          expect(registrationCallbackMock.mock.calls).toEqual([
            [someBindingTargetInjectable2],
            [someBoundInjectable],
            [someHigherOrderBoundInjectable],
          ]);
        });

        describe('given any target of binding is deregistered', () => {
          beforeEach(() => {
            di.deregister(someBindingTargetInjectable1);
          });

          it('triggers a deregistration callback also for the bound injectable', () => {
            expect(deregistrationCallbackMock.mock.calls).toEqual([
              [someHigherOrderBoundInjectable],
              [someBoundInjectable],
              [someBindingTargetInjectable1],
            ]);
          });

          it('when injecting the bound injectable, throws for the injectable no longer being registered', () => {
            expect(() => {
              di.inject(someBoundInjectable);
            }).toThrow(
              'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
            );
          });

          it('when injecting a higher order bound injectable, throws for the injectable not being really registered', () => {
            expect(() => {
              di.inject(someHigherOrderBoundInjectable);
            }).toThrow(
              'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
            );
          });

          describe('given remaining targets of binding are deregistered', () => {
            beforeEach(() => {
              deregistrationCallbackMock.mockClear();

              di.deregister(someBindingTargetInjectable2);
            });

            it('does not trigger a deregistration callback for the bound injectable again', () => {
              expect(deregistrationCallbackMock).not.toHaveBeenCalledWith(
                someBoundInjectable,
              );
            });

            it('does not trigger a deregistration callback for a higher order bound injectable again', () => {
              expect(deregistrationCallbackMock).not.toHaveBeenCalledWith(
                someHigherOrderBoundInjectable,
              );
            });

            it('when injecting the bound injectable, still throws for the injectable no longer being registered', () => {
              expect(() => {
                di.inject(someBoundInjectable);
              }).toThrow(
                'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
              );
            });

            it('when injecting a higher order bound injectable, still throws for the injectable not being really registered', () => {
              expect(() => {
                di.inject(someHigherOrderBoundInjectable);
              }).toThrow(
                'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
              );
            });

            describe('when deregistering the bound injectables', () => {
              beforeEach(() => {
                di.deregister(
                  someBoundInjectable,
                  someHigherOrderBoundInjectable,
                );
              });

              it("doesn't throw for the injectables already being deregistered", () => {});

              it('does not trigger a deregistration callback for the bound injectable again', () => {
                expect(deregistrationCallbackMock).not.toHaveBeenCalledWith(
                  someBoundInjectable,
                );
              });

              it('when deregistering the bound injectables again, now does throw for the injectables already being deregistered', () => {
                expect(() => {
                  di.deregister(
                    someBoundInjectable,
                    someHigherOrderBoundInjectable,
                  );
                }).toThrow(
                  'Tried to deregister non-registered injectable "some-bound-injectable".',
                );
              });
            });
          });
        });
      });
    });
  });

  describe('given an injectable bound to initially registered injectables, when registered', () => {
    let someBindingTargetInjectable1;
    let someBindingTargetInjectable2;
    let someBoundInjectable;
    let someHigherOrderBoundInjectable;
    let registrationCallbackMock;
    let deregistrationCallbackMock;

    beforeEach(() => {
      someBindingTargetInjectable1 = getInjectable({
        id: 'some-binding-target-injectable-1',
        instantiate: () => 'irrelevant',
      });

      someBindingTargetInjectable2 = getInjectable({
        id: 'some-binding-target-injectable-2',
        instantiate: () => 'irrelevant',
      });

      const someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someBoundInjectable = getInjectable({
        id: 'some-bound-injectable',
        instantiate: () => 'some-instance',
        registersWith: [
          someBindingTargetInjectable1,
          someBindingTargetInjectable2,
        ],
        injectionToken: someInjectionToken,
      });

      someHigherOrderBoundInjectable = getInjectable({
        id: 'some-higher-order-bound-injectable',
        instantiate: () => 'some-instance-2',
        registersWith: [someInjectionToken],
      });

      registrationCallbackMock = jest.fn();

      const someRegistrationCallbackInjectable = getInjectable({
        id: 'some-registration-callback',

        instantiate: () => registrationCallbackMock,

        injectionToken: registrationCallbackToken,
      });

      deregistrationCallbackMock = jest.fn();

      const someDeregistrationCallbackInjectable = getInjectable({
        id: 'some-deregistration-callback',

        instantiate: () => deregistrationCallbackMock,

        injectionToken: deregistrationCallbackToken,
      });

      di.register(
        someRegistrationCallbackInjectable,
        someDeregistrationCallbackInjectable,
      );

      registrationCallbackMock.mockClear();
      deregistrationCallbackMock.mockClear();

      di.register(
        someBindingTargetInjectable1,
        someBindingTargetInjectable2,
        someBoundInjectable,
        someHigherOrderBoundInjectable,
      );
    });

    it('triggers a registration callback also for all the injectables', () => {
      expect(registrationCallbackMock.mock.calls).toEqual([
        [someBindingTargetInjectable1],
        [someBindingTargetInjectable2],
        [someBoundInjectable],
        [someHigherOrderBoundInjectable],
      ]);
    });

    it('when injecting the bound injectable, does so', () => {
      expect(di.inject(someBoundInjectable)).toBe('some-instance');
    });

    it('when injecting a higher order bound injectable, does so', () => {
      expect(di.inject(someHigherOrderBoundInjectable)).toBe('some-instance-2');
    });

    describe('given any target of binding is deregistered', () => {
      beforeEach(() => {
        di.deregister(someBindingTargetInjectable1);
      });

      it('triggers a deregistration callback also for the bound injectable', () => {
        expect(deregistrationCallbackMock.mock.calls).toEqual([
          [someHigherOrderBoundInjectable],
          [someBoundInjectable],
          [someBindingTargetInjectable1],
        ]);
      });

      it('when injecting the bound injectable, throws for the injectable no longer being registered', () => {
        expect(() => {
          di.inject(someBoundInjectable);
        }).toThrow(
          'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
        );
      });

      it('when injecting a higher order bound injectable, throws for the injectable not being really registered', () => {
        expect(() => {
          di.inject(someHigherOrderBoundInjectable);
        }).toThrow(
          'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
        );
      });

      describe('given remaining targets of binding are deregistered', () => {
        beforeEach(() => {
          deregistrationCallbackMock.mockClear();

          di.deregister(someBindingTargetInjectable2);
        });

        it('does not trigger a deregistration callback for the bound injectable again', () => {
          expect(deregistrationCallbackMock).not.toHaveBeenCalledWith(
            someBoundInjectable,
          );
        });

        it('does not trigger a deregistration callback for a higher order bound injectable again', () => {
          expect(deregistrationCallbackMock).not.toHaveBeenCalledWith(
            someHigherOrderBoundInjectable,
          );
        });

        it('when injecting the bound injectable, still throws for the injectable no longer being registered', () => {
          expect(() => {
            di.inject(someBoundInjectable);
          }).toThrow(
            'Tried to inject non-registered injectable "some-container" -> "some-bound-injectable".',
          );
        });

        it('when injecting a higher order bound injectable, still throws for the injectable not being really registered', () => {
          expect(() => {
            di.inject(someHigherOrderBoundInjectable);
          }).toThrow(
            'Tried to inject non-registered injectable "some-container" -> "some-higher-order-bound-injectable".',
          );
        });
      });
    });
  });
});
