import createContainer from './src/dependency-injection-container/createContainer';

import getInjectable from './src/getInjectable/getInjectable';
import getInjectable2 from './src/getInjectable2/getInjectable2';
import isInjectable from './src/getInjectable/isInjectable';
import lifecycleEnum from './src/dependency-injection-container/lifecycleEnum';

import {
  getInjectionToken,
  getSpecificInjectionToken,
} from './src/getInjectionToken/getInjectionToken';

import {
  getInjectionToken2,
  getSpecificInjectionToken2,
} from './src/getInjectionToken2/getInjectionToken2';

import { getAbstractInjectionToken2 } from './src/getInjectionToken2/getAbstractInjectionToken2';

import isInjectionToken from './src/getInjectionToken/isInjectionToken';

import getInjectableBunch from './src/getInjectableBunch/getInjectableBunch';
import isInjectableBunch from './src/getInjectableBunch/isInjectableBunch';
import toFlatInjectables from './src/dependency-injection-container/toFlatInjectables';
import { getCompositeKey } from './src/getCompositeKey/getCompositeKey';

export { getTypedSpecifier } from './src/getInjectionToken/getTypedSpecifier';

export const getKeyedSingletonCompositeKey = getCompositeKey;

export { createInstantiationTargetDecorator } from './src/dependency-injection-container/createInstantiationTargetDecorator';
export { createInjectionTargetDecorator } from './src/dependency-injection-container/createInjectionTargetDecorator';
export { createInstancePurgeTargetCallback } from './src/dependency-injection-container/createInstancePurgeTargetCallback';

export {
  deregistrationCallbackToken,
  deregistrationDecoratorToken,
  injectionDecoratorToken,
  instancePurgeCallbackToken,
  instantiationDecoratorToken,
  registrationCallbackToken,
  registrationDecoratorToken,
} from './src/dependency-injection-container/tokens';

export {
  createContainer,
  getInjectable,
  getInjectable2,
  isInjectable,
  getInjectableBunch,
  isInjectableBunch,
  getInjectionToken,
  getInjectionToken2,
  getAbstractInjectionToken2,
  getSpecificInjectionToken,
  getSpecificInjectionToken2,
  isInjectionToken,
  lifecycleEnum,
  toFlatInjectables,
};
