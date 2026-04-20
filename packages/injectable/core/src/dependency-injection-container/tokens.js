import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getSpecificInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { getAbstractInjectionToken2 } from '../getInjectionToken2/getAbstractInjectionToken2';

export const registrationCallbackToken = getInjectionToken({
  id: 'registration-callback-token',
  decorable: false,
});

export const deregistrationCallbackToken = getInjectionToken({
  id: 'deregistration-callback-token',
  decorable: false,
});

export const instantiationDecoratorToken = getInjectionToken({
  id: 'instantiate-decorator-token',
  decorable: false,
});

export const injectionDecoratorToken = getInjectionToken({
  id: 'injection-decorator-token',
  decorable: false,
});

export const registrationDecoratorToken = getInjectionToken({
  id: 'registration-decorator-token',
  decorable: false,
});

export const deregistrationDecoratorToken = getInjectionToken({
  id: 'deregistration-decorator-token',
  decorable: false,
});

export const instancePurgeCallbackToken = getAbstractInjectionToken2({
  id: 'instance-purge-callback-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target.id }),
});
