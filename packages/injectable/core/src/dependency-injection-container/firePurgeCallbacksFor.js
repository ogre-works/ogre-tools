import { instancePurgeCallbackToken } from './tokens';

export const firePurgeCallbacksFor =
  ({ injectMany }) =>
  (injectable, instance, keyArray) => {
    const payload = { instance };

    for (const cb of injectMany(
      instancePurgeCallbackToken.for(injectable),
      [],
      [],
    )) {
      cb(payload)(...keyArray);
    }

    if (injectable.injectionToken) {
      for (const cb of injectMany(
        instancePurgeCallbackToken.for(injectable.injectionToken),
        [],
        [],
      )) {
        cb(payload)(...keyArray);
      }
    }
  };
