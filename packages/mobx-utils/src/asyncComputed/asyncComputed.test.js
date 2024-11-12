import {
  autorun,
  isObservableProp,
  observable,
  observe,
  runInAction,
  toJS,
} from 'mobx';
import asyncComputed from './asyncComputed';
import asyncFn from '@async-fn/jest';
import { flushPromises } from '@lensapp/ogre-test-utils';

describe('asyncComputed', () => {
  describe('given callback to observe something that returns a promise, and a specific value for when pending', () => {
    let someMock;
    let someAsyncComputed;
    let someObservable;

    beforeEach(() => {
      someMock = asyncFn();

      someObservable = observable.box('some-initial-value');

      someAsyncComputed = asyncComputed({
        getValueFromObservedPromise: () => {
          const someObservedValue = someObservable.get();

          return someMock(someObservedValue);
        },

        valueWhenPending: 'some-pending-value',
      });
    });

    it('given invalidated before observation, when observed, does not throw', () => {
      someAsyncComputed.invalidate();

      expect(() => {
        observe(someAsyncComputed.value, () => {});
      }).not.toThrow();
    });

    describe('when only status is observed but not value', () => {
      beforeEach(() => {
        observe(someAsyncComputed.pending, () => {});
      });

      it('when status is observed, computes', () => {
        expect(someMock).toHaveBeenCalled();
      });

      describe('when observed promise resolves', () => {
        beforeEach(async () => {
          await someMock.resolve('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when value is observed, observed value is the result of promise', () => {
          let observedValue;

          observe(
            someAsyncComputed.value,

            change => {
              observedValue = change.newValue;
            },
            true,
          );

          expect(observedValue).toBe('some-promise-result');
        });
      });
    });

    it('when status is observed multiple times, computes only once', () => {
      observe(someAsyncComputed.pending, () => {});
      observe(someAsyncComputed.pending, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
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
        it('observed value is pending value', async () => {
          expect(observedValue).toBe('some-pending-value');
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

          it('observed value is pending value', async () => {
            expect(observedValue).toBe('some-pending-value');
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

            it('still observes value as pending value', async () => {
              expect(observedValue).toBe('some-pending-value');
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

        it('observed value is the result of promise', () => {
          expect(observedValue).toBe('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when observed again, still does not recompute', () => {
          someMock.mockClear();

          observe(someAsyncComputed.value, () => {});

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

          it('observed value is pending value', () => {
            expect(observedValue).toBe('some-pending-value');
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

          it('observed value is pending value', () => {
            expect(observedValue).toBe('some-pending-value');
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-initial-value');
          });
        });
      });
    });

    it('given observed and unobserved, when observed again, does not recompute', () => {
      const unobserve = observe(someAsyncComputed.value, () => {});

      unobserve();

      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('given callback, when observed multiple times, does not recompute', () => {
      observe(someAsyncComputed.value, () => {});
      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('when not observed, does not call callback', () => {
      expect(someMock).not.toHaveBeenCalled();
    });
  });

  describe('given callback to observe something that returns a promise, and no specific value for when pending', () => {
    let someMock;
    let someAsyncComputed;
    let someObservable;

    beforeEach(() => {
      someMock = asyncFn();

      someObservable = observable.box('some-initial-value');

      someAsyncComputed = asyncComputed({
        getValueFromObservedPromise: () => {
          const someObservedValue = someObservable.get();

          return someMock(someObservedValue);
        },

        // Notice: no pending value.
        // valueWhenPending: 'some-pending-value',
      });
    });

    it('given invalidated before observation, when observed, does not throw', () => {
      someAsyncComputed.invalidate();

      expect(() => {
        observe(someAsyncComputed.value, () => {});
      }).not.toThrow();
    });

    describe('when only status is observed but not value', () => {
      beforeEach(() => {
        observe(someAsyncComputed.pending, () => {});
      });

      it('when status is observed, computes', () => {
        expect(someMock).toHaveBeenCalled();
      });

      describe('when observed promise resolves', () => {
        beforeEach(async () => {
          await someMock.resolve('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when value is observed, observed value is the result of promise', () => {
          let observedValue;

          observe(
            someAsyncComputed.value,

            change => {
              observedValue = change.newValue;
            },
            true,
          );

          expect(observedValue).toBe('some-promise-result');
        });
      });
    });

    it('when status is observed multiple times, computes only once', () => {
      observe(someAsyncComputed.pending, () => {});
      observe(someAsyncComputed.pending, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
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

          it('observed value is pending value', async () => {
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

            it('still observes value as pending value', async () => {
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

        it('observed value is the result of promise', () => {
          expect(observedValue).toBe('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when observed again, still does not recompute', () => {
          someMock.mockClear();

          observe(someAsyncComputed.value, () => {});

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

          it('observed value is pending value', () => {
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

          it('observed value is pending value', () => {
            expect(observedValue).toBe(undefined);
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-initial-value');
          });
        });
      });
    });

    it('given observed and unobserved, when observed again, does not recompute', () => {
      const unobserve = observe(someAsyncComputed.value, () => {});

      unobserve();

      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('given callback, when observed multiple times, does not recompute', () => {
      observe(someAsyncComputed.value, () => {});
      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('when not observed, does not call callback', () => {
      expect(someMock).not.toHaveBeenCalled();
    });
  });

  describe('given callback to observe something that returns a promise, and showing latest value when between observed updates', () => {
    let someMock;
    let someAsyncComputed;
    let someObservable;

    beforeEach(() => {
      someMock = asyncFn();

      someObservable = observable.box('some-initial-value');

      someAsyncComputed = asyncComputed({
        getValueFromObservedPromise: () => {
          const someObservedValue = someObservable.get();

          return someMock(someObservedValue);
        },

        valueWhenPending: 'some-pending-value',

        betweenUpdates: 'show-latest-value',
      });
    });

    it('given invalidated before observation, when observed, does not throw', () => {
      someAsyncComputed.invalidate();

      expect(() => {
        observe(someAsyncComputed.value, () => {});
      }).not.toThrow();
    });

    describe('when only status is observed but not value', () => {
      beforeEach(() => {
        observe(someAsyncComputed.pending, () => {});
      });

      it('when status is observed, computes', () => {
        expect(someMock).toHaveBeenCalled();
      });

      describe('when observed promise resolves', () => {
        beforeEach(async () => {
          await someMock.resolve('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when value is observed, observed value is the result of promise', () => {
          let observedValue;

          observe(
            someAsyncComputed.value,

            change => {
              observedValue = change.newValue;
            },
            true,
          );

          expect(observedValue).toBe('some-promise-result');
        });
      });
    });

    it('when status is observed multiple times, computes only once', () => {
      observe(someAsyncComputed.pending, () => {});
      observe(someAsyncComputed.pending, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    describe('given value is observed', () => {
      let observedValue;
      let changeOfValueIsObserved;

      beforeEach(() => {
        changeOfValueIsObserved = false;

        observe(
          someAsyncComputed.value,

          change => {
            observedValue = change.newValue;
            changeOfValueIsObserved = true;
          },
          true,
        );
      });

      it('computes', () => {
        expect(someMock).toHaveBeenCalledWith('some-initial-value');
      });

      describe('when observed promise has not resolved yet', () => {
        it('observed value is undefined', async () => {
          expect(observedValue).toBe('some-pending-value');
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

          it('observed value is still the pending value', async () => {
            expect(observedValue).toBe('some-pending-value');
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

            it('still observes value as pending value', async () => {
              expect(observedValue).toBe('some-pending-value');
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

        it('observed value is the result of promise', () => {
          expect(observedValue).toBe('some-promise-result');
        });

        it('is no longer pending', () => {
          const pendingStatus = getPendingStatus(someAsyncComputed);

          expect(pendingStatus).toBe(false);
        });

        it('when observed again, still does not recompute', () => {
          someMock.mockClear();

          observe(someAsyncComputed.value, () => {});

          expect(someMock).not.toHaveBeenCalled();
        });

        describe('when a change is observed', () => {
          beforeEach(() => {
            someMock.mockClear();
            changeOfValueIsObserved = false;

            runInAction(() => {
              someObservable.set('some-changed-value');
            });
          });

          it('observes as pending', () => {
            const pendingStatus = getPendingStatus(someAsyncComputed);

            expect(pendingStatus).toBe(true);
          });

          it('no change of value is observed yet', () => {
            expect(changeOfValueIsObserved).toBe(false);
          });

          it('observed value remains the latest value', () => {
            expect(observedValue).toBe('some-promise-result');
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-changed-value');
          });
        });

        describe('when invalidated', () => {
          beforeEach(() => {
            someMock.mockClear();

            changeOfValueIsObserved = false;
            someAsyncComputed.invalidate();
          });

          it('observes as pending', () => {
            const pendingStatus = getPendingStatus(someAsyncComputed);

            expect(pendingStatus).toBe(true);
          });

          it('no change of value is observed yet', () => {
            expect(changeOfValueIsObserved).toBe(false);
          });

          it('observed value yet remains the latest value', () => {
            expect(observedValue).toBe('some-promise-result');
          });

          it('recomputes', () => {
            expect(someMock).toHaveBeenCalledWith('some-initial-value');
          });
        });
      });
    });

    it('given observed and unobserved, when observed again, does not recompute', () => {
      const unobserve = observe(someAsyncComputed.value, () => {});

      unobserve();

      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('given callback, when observed multiple times, does not recompute', () => {
      observe(someAsyncComputed.value, () => {});
      observe(someAsyncComputed.value, () => {});

      expect(someMock).toHaveBeenCalledTimes(1);
    });

    it('when not observed, does not call callback', () => {
      expect(someMock).not.toHaveBeenCalled();
    });
  });

  describe('given custom comparer and showing latest value between updates (note: showing a pending value between updates would make a custom comparer make very little sense)', () => {
    let actualObservation;
    let someObservable;
    let someAsyncComputed;
    let actualNumberOfObservations;

    beforeEach(() => {
      const someCustomComparer = (a, b) =>
        a?.relevantProperty === b?.relevantProperty;

      someObservable = observable.object({
        relevantProperty: 'some-initial-relevant-property-value',
        irrelevantProperty: 'some-initial-irrelevant-property-value',
      });

      someAsyncComputed = asyncComputed({
        getValueFromObservedPromise: async () => toJS(someObservable),
        equals: someCustomComparer,
        betweenUpdates: 'show-latest-value',
      });

      actualNumberOfObservations = 0;

      autorun(() => {
        actualNumberOfObservations++;
        actualObservation = someAsyncComputed.value.get();
      });
    });

    describe('when a change relevant to custom comparer happens', () => {
      beforeEach(async () => {
        actualNumberOfObservations = 0;

        runInAction(() => {
          someObservable.relevantProperty = 'some-new-value';
        });

        // Not really required because of a suspected bug/peculiarity in jest
        await flushPromises();
      });

      it('the relevant change is observed', async () => {
        expect(actualObservation.relevantProperty).toBe('some-new-value');
      });

      it('there is exactly one new observation', () => {
        expect(actualNumberOfObservations).toBe(1);
      });
    });

    describe('when a change irrelevant to custom comparer happens', () => {
      beforeEach(async () => {
        actualNumberOfObservations = 0;

        runInAction(() => {
          someObservable.irrelevantProperty = 'some-new-value';
        });

        // Not really required because of a suspected bug/peculiarity in jest
        await flushPromises();
      });

      it('the irrelevant change is not observed', async () => {
        expect(actualObservation.irrelevantProperty).toBe(
          'some-initial-irrelevant-property-value',
        );
      });

      it('there are no new observations', () => {
        expect(actualNumberOfObservations).toBe(0);
      });
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
