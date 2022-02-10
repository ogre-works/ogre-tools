import asyncFn from '@async-fn/jest';
import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from './lifecycleEnum';
import { errorMonitorInjectionToken } from './createContainer';
import { first, noop } from 'lodash/fp';
import { pipeline } from '@ogre-tools/fp';

describe('createContainer.error-monitoring-for-instantiation', () => {
  [
    { name: 'given injecting single', inject: di => di.inject },

    {
      name: 'given injecting many',

      inject:
        di =>
        (...args) =>
          pipeline(di.injectMany(...args), first),
    },
  ].forEach(scenario => {
    describe(scenario.name, () => {
      describe('given an error monitor, sync child-injectable and injected, when instantiation of child throws', () => {
        let errorMonitorMock;
        let thrownErrorMock;

        beforeEach(() => {
          errorMonitorMock = jest.fn();
          const errorMonitorInjectable = getInjectable({
            id: 'some-error-monitor',
            injectionToken: errorMonitorInjectionToken,
            instantiate: () => errorMonitorMock,
          });

          const syncChildInjectable = getInjectable({
            id: 'some-child-injectable',

            lifecycle: lifecycleEnum.transient,

            instantiate: () => {
              throw 'some-error';
            },
          });

          const parentInjectable = getInjectable({
            id: 'some-parent-injectable',

            lifecycle: lifecycleEnum.transient,

            instantiate: di => {
              scenario.inject(di)(
                syncChildInjectable,
                'some-instantiation-parameter-for-child',
              );
            },
          });

          const di = getDi(
            parentInjectable,
            syncChildInjectable,
            errorMonitorInjectable,
          );

          thrownErrorMock = jest.fn();

          try {
            scenario.inject(di)(
              parentInjectable,
              'some-instantiation-parameter-for-parent',
            );
          } catch (error) {
            thrownErrorMock(error);
          }
        });

        it('triggers error monitoring only for child', () => {
          expect(errorMonitorMock.mock.calls).toEqual([
            [
              {
                error: 'some-error',

                context: [
                  {
                    id: 'some-parent-injectable',
                    instantiationParameter:
                      'some-instantiation-parameter-for-parent',
                  },

                  {
                    id: 'some-child-injectable',
                    instantiationParameter:
                      'some-instantiation-parameter-for-child',
                  },
                ],
              },
            ],
          ]);
        });

        it('throws', () => {
          expect(thrownErrorMock).toHaveBeenCalledWith('some-error');
        });
      });

      describe('given an error monitor, async child-injectable and injected', () => {
        let errorMonitorMock;
        let actualPromise;
        let instantiateChildMock;
        let parentInjectable;
        let di;

        beforeEach(async () => {
          errorMonitorMock = asyncFn();
          const errorMonitorInjectable = getInjectable({
            id: 'some-error-monitor',
            injectionToken: errorMonitorInjectionToken,
            instantiate: () => errorMonitorMock,
          });

          instantiateChildMock = asyncFn();
          const asyncChildInjectable = getInjectable({
            id: 'some-child-injectable',
            lifecycle: lifecycleEnum.transient,
            instantiate: instantiateChildMock,
          });

          parentInjectable = getInjectable({
            id: 'some-parent-injectable',
            lifecycle: lifecycleEnum.transient,

            instantiate: async di => {
              await scenario.inject(di)(
                asyncChildInjectable,
                'some-instantiation-parameter-for-child',
              );
            },
          });

          di = getDi(
            parentInjectable,
            asyncChildInjectable,
            errorMonitorInjectable,
          );

          actualPromise = scenario.inject(di)(
            parentInjectable,
            'some-instantiation-parameter-for-parent',
          );
        });

        describe('when instantiation of child rejects with error', () => {
          beforeEach(() => {
            instantiateChildMock.reject(new Error('some-error'));
          });

          it('triggers error monitoring only for child', async () => {
            await actualPromise.catch(noop);

            expect(errorMonitorMock.mock.calls).toEqual([
              [
                {
                  error: expect.any(Error),

                  context: [
                    {
                      id: 'some-parent-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-parent',
                    },

                    {
                      id: 'some-child-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-child',
                    },
                  ],
                },
              ],
            ]);
          });

          it('throws', () => {
            return expect(actualPromise).rejects.toThrow('some-error');
          });
        });

        describe('when instantiation of child rejects with non-error', () => {
          beforeEach(() => {
            instantiateChildMock.reject('some-non-error-rejection');
          });

          it('triggers error monitoring only for child', async () => {
            await actualPromise.catch(noop);

            expect(errorMonitorMock.mock.calls).toEqual([
              [
                {
                  error: 'some-non-error-rejection',

                  context: [
                    {
                      id: 'some-parent-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-parent',
                    },

                    {
                      id: 'some-child-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-child',
                    },
                  ],
                },
              ],
            ]);
          });

          it('rejects as the non-error', () => {
            return expect(actualPromise).rejects.toBe(
              'some-non-error-rejection',
            );
          });

          it('when same exact non-error rejection occurs again, triggers error monitoring again', async () => {
            await actualPromise.catch(noop);

            errorMonitorMock.mockClear();

            actualPromise = scenario.inject(di)(
              parentInjectable,
              'some-instantiation-parameter-for-parent',
            );

            instantiateChildMock.reject('some-non-error-rejection');

            await actualPromise.catch(noop);

            expect(errorMonitorMock.mock.calls).toEqual([
              [
                {
                  error: 'some-non-error-rejection',

                  context: [
                    {
                      id: 'some-parent-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-parent',
                    },

                    {
                      id: 'some-child-injectable',
                      instantiationParameter:
                        'some-instantiation-parameter-for-child',
                    },
                  ],
                },
              ],
            ]);
          });
        });
      });
    });
  });
});
