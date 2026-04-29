import { instancePurgeCallbackToken } from './tokens';

export const firePurgeCallbacksFor =
  ({ getApplicableDecorators }) =>
  (injectable, instance, keyArray) => {
    const payload = { instance };

    const callbacks = getApplicableDecorators({
      decoratorToken: instancePurgeCallbackToken,
      target: injectable,
      injectingInjectable: injectable,
    });

    for (const cb of callbacks) {
      cb(payload)(...keyArray);
    }
  };
