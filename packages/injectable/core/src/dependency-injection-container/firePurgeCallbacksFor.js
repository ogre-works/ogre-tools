import { instancePurgeCallbackToken } from './tokens';

export const firePurgeCallbacksFor =
  ({ injectMany }) =>
  (injectable, instance, keyArray) => {
    const payload = { instance };

    for (const cb of injectMany({
      alias: instancePurgeCallbackToken.for(injectable),
      instantiationParameters: [],
      injectingInjectable: injectable,
    })) {
      cb(payload)(...keyArray);
    }

    if (injectable.injectionToken) {
      for (const cb of injectMany({
        alias: instancePurgeCallbackToken.for(injectable.injectionToken),
        instantiationParameters: [],
        injectingInjectable: injectable,
      })) {
        cb(payload)(...keyArray);
      }
    }
  };
