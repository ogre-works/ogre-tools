import createContainer from './src/dependency-injection-container/createContainer';

import getInjectable from './src/getInjectable/getInjectable';
import isInjectable from './src/getInjectable/isInjectable';
import lifecycleEnum from './src/dependency-injection-container/lifecycleEnum';

import getInjectionToken from './src/getInjectionToken/getInjectionToken';
import isInjectionToken from './src/getInjectionToken/isInjectionToken';

import getInjectableBunch from './src/getInjectableBunch/getInjectableBunch';
import isInjectableBunch from './src/getInjectableBunch/isInjectableBunch';
import toFlatInjectables from './src/dependency-injection-container/toFlatInjectables';
import { getCompositeKey } from './src/getCompositeKey/getCompositeKey';

export const getKeyedSingletonCompositeKey = getCompositeKey;

export { createInstantiationTargetDecorator } from './src/dependency-injection-container/createInstantiationTargetDecorator';
export { createInjectionTargetDecorator } from './src/dependency-injection-container/createInjectionTargetDecorator';

export {
  deregistrationCallbackToken,
  injectionDecoratorToken,
  instantiationDecoratorToken,
  registrationCallbackToken,
} from './src/dependency-injection-container/tokens';

export {
  createContainer,
  getInjectable,
  isInjectable,
  getInjectableBunch,
  isInjectableBunch,
  getInjectionToken,
  isInjectionToken,
  lifecycleEnum,
  toFlatInjectables,
};
