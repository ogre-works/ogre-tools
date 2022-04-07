import asyncFn from '@async-fn/jest';
import noop from 'lodash/fp/noop';

import {
  errorMonitorInjectionToken,
  registerErrorMonitoring,
} from './error-monitoring';
import {
  createContainer,
  getInjectable,
  lifecycleEnum,
} from '@ogre-tools/injectable';

describe('createContainer.error-monitoring-for-injected-functions', () => {
  describe('given error monitoring and async function as child-injectable, when injected and called', () => {
    let errorMonitorMock;
    let actualPromise;
    let childCallMock;
    let parentInjectable;
    let childInjectable;
    let di;

    beforeEach(async () => {
      errorMonitorMock = asyncFn();
      const errorMonitorInjectable = getInjectable({
        id: 'some-error-monitor',
        injectionToken: errorMonitorInjectionToken,
        instantiate: () => errorMonitorMock,
        decorable: false,
      });

      childCallMock = asyncFn();
      childInjectable = getInjectable({
        id: 'some-child-injectable',
        lifecycle: lifecycleEnum.transient,
        instantiate: () => childCallMock,
      });

      parentInjectable = getInjectable({
        id: 'some-parent-injectable',
        lifecycle: lifecycleEnum.transient,

        instantiate: di =>
          di.inject(childInjectable, 'some-instantiation-parameter-for-child'),
      });

      const di = createContainer();

      di.register(parentInjectable, childInjectable, errorMonitorInjectable);

      registerErrorMonitoring(di);

      const instance = di.inject(
        parentInjectable,
        'some-instantiation-parameter-for-parent',
      );

      actualPromise = instance();
    });

    describe('when call of child rejects with error', () => {
      beforeEach(() => {
        childCallMock.reject(new Error('some-error'));
      });

      it('triggers error monitoring', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock).toHaveBeenCalledWith({
          error: expect.any(Error),

          context: [
            {
              injectable: expect.objectContaining(parentInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-parent',
            },

            {
              injectable: expect.objectContaining(childInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-child',
            },
          ],
        });
      });

      it('throws', () => {
        return expect(actualPromise).rejects.toThrow('some-error');
      });
    });

    describe('when call of child rejects with non-error', () => {
      beforeEach(() => {
        childCallMock.reject('some-non-error-rejection');
      });

      it('triggers error monitoring', async () => {
        await actualPromise.catch(noop);

        expect(errorMonitorMock).toHaveBeenCalledWith({
          error: 'some-non-error-rejection',

          context: [
            {
              injectable: expect.objectContaining(parentInjectable),
              instantiationParameter: 'some-instantiation-parameter-for-parent',
            },

            {
              injectable: expect.objectContaining(childInjectable),
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

  describe('given error monitoring and sync function as child-injectable and injected, when a call throws', () => {
    let errorMonitorMock;
    let thrownErrorMock;
    let childCallMock;
    let parentInjectable;
    let childInjectable;
    let di;

    beforeEach(async () => {
      errorMonitorMock = asyncFn();
      thrownErrorMock = jest.fn();
      const errorMonitorInjectable = getInjectable({
        id: 'some-error-monitor',
        injectionToken: errorMonitorInjectionToken,
        instantiate: () => errorMonitorMock,
        decorable: false,
      });

      childCallMock = asyncFn();
      childInjectable = getInjectable({
        id: 'some-child-injectable',
        lifecycle: lifecycleEnum.transient,

        instantiate: () => () => {
          throw new Error('some-error');
        },
      });

      parentInjectable = getInjectable({
        id: 'some-parent-injectable',
        lifecycle: lifecycleEnum.transient,

        instantiate: di =>
          di.inject(childInjectable, 'some-instantiation-parameter-for-child'),
      });

      di = createContainer();

      di.register(parentInjectable, childInjectable, errorMonitorInjectable);

      registerErrorMonitoring(di);

      const instance = di.inject(
        parentInjectable,
        'some-instantiation-parameter-for-parent',
      );

      try {
        instance();
      } catch (error) {
        thrownErrorMock(error.toString());
      }
    });

    it('triggers error monitoring', async () => {
      expect(errorMonitorMock).toHaveBeenCalledWith({
        error: expect.any(Error),

        context: [
          {
            injectable: expect.objectContaining(parentInjectable),
            instantiationParameter: 'some-instantiation-parameter-for-parent',
          },

          {
            injectable: expect.objectContaining(childInjectable),
            instantiationParameter: 'some-instantiation-parameter-for-child',
          },
        ],
      });
    });

    it('throws', () => {
      expect(thrownErrorMock).toHaveBeenCalledWith('Error: some-error');
    });
  });
});
