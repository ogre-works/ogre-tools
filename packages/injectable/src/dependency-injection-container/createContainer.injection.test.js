import { noop } from 'lodash/fp';
import asyncFn from '@async-fn/jest';
import getInjectable from '../getInjectable/getInjectable';
import getDi from '../test-utils/getDiForUnitTesting';
import { errorMonitorToken } from './createContainer';
import lifecycleEnum from './lifecycleEnum';

describe('createContainer.injection', () => {
  it('given async child-injectable as dependency, when injected, parent-injectable receives child as sync', async () => {
    const asyncChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: () =>
        Promise.resolve({
          someProperty: `some-child-instance`,
        }),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: async di => {
        const childInjectable = await di.inject(asyncChildInjectable);

        return childInjectable.someProperty;
      },
    });

    const di = getDi(asyncChildInjectable, parentInjectable);

    const actual = await di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given sync injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given async injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: async di => await di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: async di => await di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    const actualPromise = di.inject(parentInjectable);

    return expect(actualPromise).rejects.toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given injectables with a dependency cycle, when injected with bogus context, throws error without bogus context', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = getDi(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable, undefined, ['some-bogus-context']);
    }).toThrow(
      'Cycle of injectables encountered: "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  describe('given an error monitor, sync child-injectable and injected, when instantiation of child throws', () => {
    let errorMonitorMock;
    let thrownErrorMock;

    beforeEach(() => {
      errorMonitorMock = jest.fn();
      const errorMonitorInjectable = getInjectable({
        id: 'some-error-monitor',
        injectionToken: errorMonitorToken,
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
          di.inject(
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
        di.inject(parentInjectable, 'some-instantiation-parameter-for-parent');
      } catch (error) {
        thrownErrorMock(error);
      }
    });

    it('triggers error monitoring for child', () => {
      expect(errorMonitorMock.mock.calls).toEqual([
        [
          {
            error: 'some-error',

            context: [
              { id: 'some-parent-injectable' },
              { id: 'some-child-injectable' },
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
        injectionToken: errorMonitorToken,
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
          await di.inject(
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

      actualPromise = di.inject(
        parentInjectable,
        'some-instantiation-parameter-for-parent',
      );
    });

    describe('when instantiation of child rejects with error', () => {
      beforeEach(() => {
        instantiateChildMock.reject(new Error('some-error'));
      });

      it('triggers error monitoring once for full relevant injection context', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock.mock.calls).toEqual([
          [
            {
              error: expect.any(Error),

              context: [
                { id: 'some-parent-injectable' },
                { id: 'some-child-injectable' },
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

      it('triggers error monitoring once for full relevant injection context', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock.mock.calls).toEqual([
          [
            {
              error: 'some-non-error-rejection',

              context: [
                { id: 'some-parent-injectable' },
                { id: 'some-child-injectable' },
              ],
            },
          ],
        ]);
      });

      it('rejects as the non-error', () => {
        return expect(actualPromise).rejects.toBe('some-non-error-rejection');
      });

      it('when same exact non-error rejection occurs again, triggers error monitoring again', async () => {
        await actualPromise.catch(noop);

        errorMonitorMock.mockClear();

        actualPromise = di.inject(
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
                { id: 'some-parent-injectable' },
                { id: 'some-child-injectable' },
              ],
            },
          ],
        ]);
      });
    });
  });
});
