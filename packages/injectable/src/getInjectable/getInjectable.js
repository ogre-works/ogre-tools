import identity from 'lodash/fp/identity';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

// Note: this function exists only for typed presence in TypeScript.
// It has little purpose in JavaScript.
export default function getInjectable(rawInjectable) {
  if (!rawInjectable.lifecycle) {
    rawInjectable.lifecycle = lifecycleEnum.singleton;
  }

  return rawInjectable;
};
