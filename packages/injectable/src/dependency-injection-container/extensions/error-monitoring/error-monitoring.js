import { isFunction, last } from 'lodash/fp';
import getInjectionToken from '../../../getInjectionToken/getInjectionToken';
import { isPromise, pipeline } from '@ogre-tools/fp';
import getInjectable from '../../../getInjectable/getInjectable';
import { decorationInjectionToken } from '../../createContainer';

export const errorMonitorInjectionToken = getInjectionToken({
  id: 'error-monitor-token',
});

export const registerErrorMonitoring = di => {
  di.register(errorMonitoringDecoratorForInstantiationInjectable);
  di.register(errorMonitoringDecoratorForFunctionInstancesInjectable);
};

const errorMonitoringDecoratorForInstantiationInjectable = getInjectable({
  id: 'error-monitoring-for-instantiation-decorator',

  instantiate: () => ({
    decorate:
      instantiateToBeDecorated =>
      (di, ...args) => {
        const decorated = pipeline(
          instantiateToBeDecorated,
          withErrorMonitoringFor(di),
        );

        return decorated(di, ...args);
      },
  }),

  injectionToken: decorationInjectionToken,
});

const errorMonitoringDecoratorForFunctionInstancesInjectable = getInjectable({
  id: 'error-monitoring-for-function-instances-decorator',

  instantiate: di => ({
    decorate:
      instantiateToBeDecorated =>
      (di, ...args) => {
        const result = instantiateToBeDecorated(di, ...args);

        if (isFunction(result)) {
          return pipeline(result, withErrorMonitoringFor(di));
        }

        return result;
      },
  }),

  injectionToken: decorationInjectionToken,
});

const withErrorMonitoringFor = di => {
  const notifyErrorMonitors = notifyErrorMonitorsFor(di);

  return instantiateToBeDecorated =>
    (...args) => {
      let result;

      try {
        result = instantiateToBeDecorated(...args);
      } catch (error) {
        notifyErrorMonitors(error, di.context);

        throw error;
      }

      if (isPromise(result)) {
        result.catch(error => {
          notifyErrorMonitors(error, di.context);
        });
      }

      return result;
    };
};

const notifyErrorMonitorsFor = di => (error, context) => {
  di.injectMany(errorMonitorInjectionToken).forEach(errorMonitor =>
    errorMonitor({
      error,
      context,
    }),
  );
};
