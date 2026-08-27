import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  getInjectionToken2,
  getSpecificInjectionToken2,
} from '../getInjectionToken2/getInjectionToken2';

// Machinery tokens carry no tags: tag dispatch reads the target's token
// chain, so a decorator registered under e.g.
// `instantiationDecoratorToken.for('injectionToken')` would otherwise be
// found via its own registration token during its own instantiation —
// infinite recursion. `.for()` children copy the general token's tags at
// creation, so the exemption propagates to them. (Same role the removed
// `decorable: false` flag had.)
const untagged = token => {
  token.tags = undefined;
  return token;
};

export const registrationCallbackToken = untagged(
  getInjectionToken({
    id: 'registration-callback-token',
  }),
);

export const deregistrationCallbackToken = untagged(
  getInjectionToken({
    id: 'deregistration-callback-token',
  }),
);

export const instantiationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'instantiate-decorator-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);

export const injectionDecoratorToken = untagged(
  getInjectionToken2({
    id: 'injection-decorator-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);

export const instancePurgeCallbackToken = untagged(
  getInjectionToken2({
    id: 'instance-purge-callback-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);

export const registrationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'registration-decorator-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);

export const deregistrationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'deregistration-decorator-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);

export const preInjectCallbackToken = untagged(
  getInjectionToken2({
    id: 'pre-inject-callback-token',
    cardinality: 'zero-or-many',
  })(target =>
    getSpecificInjectionToken2()({ id: target.id, speciality: target }),
  ),
);
