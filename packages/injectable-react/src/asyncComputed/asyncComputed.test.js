import asyncComputed from './asyncComputed';
import asyncFn from '@async-fn/jest';
import { isObservableProp, observable, observe, runInAction } from 'mobx';

describe('asyncComputed', () => {
  describe('given callback', () => {
    let someMock;
    let someAsyncComputed;
    let someObservable;

    beforeEach(() => {
      someMock = asyncFn();

      someObservable = observable.box('some-initial-value');

      someAsyncComputed = asyncComputed(() => {
        const someObservedValue = someObservable.get();

        return someMock(someObservedValue);
      });
    });

    it('when status is observed, does not compute', () => {
      observe(someAsyncComputed.pending);

      expect(someMock).not.toHaveBeenCalled();
    });

    describe('given value is observed', () => {
      let observedValue;

      beforeEach(() => {
        observe(
          someAsyncComputed.value,

          change => {
            observedValue = change.newValue;
          },
          true,
        );
      });

      it('computes', () => {
        expect(someMock).toHaveBeenCalledWith('some-initial-value');
      });

      describe('when observed promise has not resolved yet', () => {
        it('observed value is undefined', async () => {
          expect(observedValue).toBe(undefined);
        });

        it('observes as pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(true);
        });

        describe('but another change is observed', () => {
          beforeEach(() => {
            someMock.mockClear();

            runInAction(() => {
              someObservable.set('some-other-changed-value');
            });
          });

          it('computes', () => {
            expect(someMock).toHaveBeenCalledWith('some-other-changed-value');
          });

          it('observed value is undefined', async () => {
            expect(observedValue).toBe(undefined);
          });

          it('observes as pending', () => {
            const pendingStatus = getPendingStatus(someAsyncComputed);

            expect(pendingStatus).toBe(true);
          });

          describe('when the obsolete promise resolves', () => {
            beforeEach(async () => {
              await someMock.resolveSpecific(
                ['some-initial-value'],
                'some-obsolete-promise-result',
              );
            });

            it('still observes value as undefined', async () => {
              expect(observedValue).toBe(undefined);
            });

            it('still observes as pending', () => {
              const pendingStatus = getPendingStatus(someAsyncComputed);

              expect(pendingStatus).toBe(true);
            });

            describe('when the latest promise resolves', () => {
              beforeEach(async () => {
                await someMock.resolveSpecific(
                  ['some-other-changed-value'],
                  'some-latest-promise-result',
                );
              });

              it('observed value is result of latest promise', async () => {
                expect(observedValue).toBe('some-latest-promise-result');
              });

              it('observes as not pending', () => {
                const pendingStatus = getPendingStatus(someAsyncComputed);

                expect(pendingStatus).toBe(false);
              });
            });
          });
        });
      });

      it('when promise resolves as non observable object, computed value is also non observable', async () => {
        await someMock.resolve({ some: 'non-observable-object' });

        expect(isObservableProp(observedValue, 'some')).toBe(false);
      });

      describe('when observed promise resolves', () => {
        beforeEach(async () => {
          await someMock.resolve('some-promise-result');
        });

        it('observed value is result of promise', () => {
          expect(observedValue).toBe('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when observed again, still does not recompute', () => {
          someMock.mockClear();

          observe(someAsyncComputed.value);

          expect(someMock).not.toHaveBeenCalled();
        });

        describe('when a change is observed', () => {
          beforeEach(() => {
            someMock.mockClear();

            runInAction(() => {
              someObservable.set('some-changed-value');
            });
          });

          it('observes as pending', () => {
            const pendingStatus = getPendingStatus(someAsyncComputed);

            expect(pendingStatus).toBe(true);
          });

          it('observed value is undefined', () => {
            expect(observedValue).toBe(undefined);
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-changed-value');
          });
        });

        describe('when invalidated', () => {
          beforeEach(() => {
            someMock.mockClear();

            someAsyncComputed.invalidate();
          });

          it('observes as pending', () => {
            const pendingStatus = getPendingStatus(someAsyncComputed);

            expect(pendingStatus).toBe(true);
          });

          it('observed value is undefined', () => {
            expect(observedValue).toBe(undefined);
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-initial-value');
          });
        });
      });
    });

    it('given observed and unobserved, when observed again, does not recompute', () => {
      const unobserve = observe(someAsyncComputed.value);

      unobserve();

      observe(someAsyncComputed.value);

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('given callback, when observed multiple times, does not recompute', () => {
      observe(someAsyncComputed.value);
      observe(someAsyncComputed.value);

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('when not observed, does not call callback', () => {
      expect(someMock).not.toHaveBeenCalled();
    });

    xit('when accessed outside of reactive context, throws', () => {
      expect(() => {
        someAsyncComputed.value.get();
      }).toThrow(
        'Tried to access asyncComputed outside of computing derivation.',
      );
    });
  });
});

const getPendingStatus = someAsyncComputed => {
  let observedPending;

  observe(
    someAsyncComputed.pending,

    change => {
      observedPending = change.newValue;
    },
    true,
  );

  return observedPending;
};
