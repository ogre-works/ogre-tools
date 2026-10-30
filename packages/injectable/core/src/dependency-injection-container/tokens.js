import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

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

// A token2, so that an injectable2 can be one. Old-style injectables can be
// one too, as the container gathers them the same.
export const deregistrationCallbackToken = untagged(
  getInjectionToken2({
    id: 'deregistration-callback-token',
    cardinality: 'zero-or-many',
  })(),
);

export const instantiationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'instantiate-decorator-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);

export const injectionDecoratorToken = untagged(
  getInjectionToken2({
    id: 'injection-decorator-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);

export const instancePurgeCallbackToken = untagged(
  getInjectionToken2({
    id: 'instance-purge-callback-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);

export const registrationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'registration-decorator-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);

export const deregistrationDecoratorToken = untagged(
  getInjectionToken2({
    id: 'deregistration-decorator-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);

export const preInjectCallbackToken = untagged(
  getInjectionToken2({
    id: 'pre-inject-callback-token',
    cardinality: 'zero-or-many',
  })(target => getInjectionToken2({ id: target.id, speciality: target })()),
);
