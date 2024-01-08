import asyncFn from '@async-fn/jest';
import { noop } from 'lodash/fp';

import {
  errorMonitorInjectionToken,
  registerErrorMonitoring,
} from './error-monitoring';

import {
  createContainer,
  getInjectable,
  lifecycleEnum,
} from '@lensapp/injectable';

describe('createContainer.error-monitoring-for-instantiation', () => {
  describe('given error monitoring, sync child-injectable and injected, when instantiation of child throws', () => {
    let errorMonitorMock;
    let thrownErrorMock;
    let parentInjectable;
    let syncChildInjectable;

    beforeEach(() => {
      errorMonitorMock = jest.fn();
      const errorMonitorInjectable = getInjectable({
        id: 'some-error-monitor',
        injectionToken: errorMonitorInjectionToken,
        instantiate: () => errorMonitorMock,
      });

      syncChildInjectable = getInjectable({
        id: 'some-child-injectable',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => {
          throw 'some-error';
        },
      });

      parentInjectable = getInjectable({
        id: 'some-parent-injectable',

        lifecycle: lifecycleEnum.transient,

        instantiate: di => {
          di.inject(
            syncChildInjectable,
            'some-instantiation-parameter-for-child',
          );
        },
      });

      const di = createContainer('some-container');

      di.register(
        parentInjectable,
        syncChildInjectable,
        errorMonitorInjectable,
      );

      registerErrorMonitoring(di);

      thrownErrorMock = jest.fn();

      try {
        di.inject(parentInjectable, 'some-instantiation-parameter-for-parent');
      } catch (error) {
        thrownErrorMock(error);
      }
    });

    it('triggers error monitoring', () => {
      expect(errorMonitorMock).toHaveBeenCalledWith({
        error: 'some-error',

        context: [
          { injectable: { id: 'some-container' } },

          {
            injectable: expect.objectContaining(parentInjectable),
            instantiationParameter: 'some-instantiation-parameter-for-parent',
          },

          {
            injectable: expect.objectContaining(syncChildInjectable),
            instantiationParameter: 'some-instantiation-parameter-for-child',
          },
        ],
      });
    });

    it('throws', () => {
      expect(thrownErrorMock).toHaveBeenCalledWith('some-error');
    });
  });

  describe('given error monitoring, async child-injectable and injected', () => {
    let errorMonitorMock;
    let actualPromise;
    let instantiateChildMock;
    let parentInjectable;
    let asyncChildInjectable;
    let di;

    beforeEach(async () => {
      errorMonitorMock = asyncFn();
      const errorMonitorInjectable = getInjectable({
        id: 'some-error-monitor',
        injectionToken: errorMonitorInjectionToken,
        instantiate: () => errorMonitorMock,
      });

      instantiateChildMock = asyncFn();
      asyncChildInjectable = getInjectable({
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

      di = createContainer('some-container');

      di.register(
        parentInjectable,
        asyncChildInjectable,
        errorMonitorInjectable,
      );

      registerErrorMonitoring(di);

      actualPromise = di.inject(
        parentInjectable,
        'some-instantiation-parameter-for-parent',
      );
    });

    describe('when instantiation of child rejects with error', () => {
      beforeEach(() => {
        instantiateChildMock.reject(new Error('some-error'));
      });

      it('triggers error monitoring', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock).toHaveBeenCalledWith({
          error: expect.any(Error),

          context: [
            { injectable: { id: 'some-container' } },

            {
              injectable: expect.objectContaining(parentInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-parent',
            },

            {
              injectable: expect.objectContaining(asyncChildInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-child',
            },
          ],
        });
      });

      it('throws', () => {
        return expect(actualPromise).rejects.toThrow('some-error');
      });
    });

    describe('when instantiation of child rejects with non-error', () => {
      beforeEach(() => {
        instantiateChildMock.reject('some-non-error-rejection');
      });

      it('triggers error monitoring', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock).toHaveBeenCalledWith({
          error: 'some-non-error-rejection',

          context: [
            { injectable: { id: 'some-container' } },

            {
              injectable: expect.objectContaining(parentInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-parent',
            },

            {
              injectable: expect.objectContaining(asyncChildInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-child',
            },
          ],
        });
      });

      it('rejects as the non-error', () => {
        return expect(actualPromise).rejects.toBe('some-non-error-rejection');
      });
    });
  });
});
