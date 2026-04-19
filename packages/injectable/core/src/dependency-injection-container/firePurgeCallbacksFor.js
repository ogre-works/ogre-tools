import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';
import { storedInstanceKey } from './lifecycleEnum';
import { instancePurgeCallbackToken } from './tokens';

export const firePurgeCallbacksFor =
  ({ injectMany }) =>
  (injectable, instance, keyArray) => {
    const descriptors = injectMany(instancePurgeCallbackToken, [], []);
    const relevant = descriptors.filter(isRelevantDecoratorFor(injectable));

    if (relevant.length === 0) return;

    if (injectable.aliasType === injectableSymbol2) {
      for (const { callback } of relevant) callback(instance)(...keyArray);
    } else {
      const param = keyArray[0] === storedInstanceKey ? undefined : keyArray[0];
      for (const { callback } of relevant) callback(instance, param);
    }
  };
