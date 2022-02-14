import { isFunction, last } from 'lodash/fp';
import getInjectionToken from '../../getInjectionToken/getInjectionToken';
import { isPromise, pipeline } from '@ogre-tools/fp';
import getInjectable from '../../getInjectable/getInjectable';
import { decorationInjectionToken } from '../createContainer';

export const errorMonitorInjectionToken = getInjectionToken({
  id: 'error-monitor-token',
});

export const registerErrorMonitoring = di => {
  di.register(errorMonitoringDecoratorForInstantiationInjectable);
  di.register(errorMonitoringDecoratorForFunctionInstancesInjectable);
};

const errorMonitoringDecoratorForInstantiationInjectable = getInjectable({
  id: 'error-monitoring-for-instantiation-decorator',

  instantiate: di => ({
    decorate:
      instantiateToBeDecorated =>
      (...args) => {
        // Todo: un-kludge accessing of context.
        const context = last(args);

        const decorated = pipeline(
          instantiateToBeDecorated,
          withErrorMonitoringFor(di, context),
        );

        return decorated(...args);
      },
  }),

  injectionToken: decorationInjectionToken,
});

const errorMonitoringDecoratorForFunctionInstancesInjectable = getInjectable({
  id: 'error-monitoring-for-function-instances-decorator',

  instantiate: di => ({
    decorate:
      instantiateToBeDecorated =>
      (...args) => {
        const result = instantiateToBeDecorated(...args);

        if (isFunction(result)) {
          // Todo: un-kludge accessing of context.
          const context = last(args);

          return pipeline(result, withErrorMonitoringFor(di, context));
        }

        return result;
      },
  }),

  injectionToken: decorationInjectionToken,
});

const withErrorMonitoringFor = (di, context) => {
  const notifyErrorMonitors = notifyErrorMonitorsFor(di);

  return instantiateToBeDecorated =>
    (...args) => {
      let result;

      try {
        result = instantiateToBeDecorated(...args);
      } catch (error) {
        notifyErrorMonitors(error, context);

        throw error;
      }

      if (isPromise(result)) {
        result.catch(error => {
          notifyErrorMonitors(error, context);
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
