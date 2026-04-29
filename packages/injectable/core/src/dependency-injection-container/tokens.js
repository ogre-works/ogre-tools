import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getSpecificInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { getAbstractInjectionToken2 } from '../getInjectionToken2/getAbstractInjectionToken2';

export const registrationCallbackToken = getInjectionToken({
  id: 'registration-callback-token',
});

export const deregistrationCallbackToken = getInjectionToken({
  id: 'deregistration-callback-token',
});

export const instantiationDecoratorToken = getAbstractInjectionToken2({
  id: 'instantiate-decorator-token',
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const injectionDecoratorToken = getAbstractInjectionToken2({
  id: 'injection-decorator-token',
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const instancePurgeCallbackToken = getAbstractInjectionToken2({
  id: 'instance-purge-callback-token',
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const registrationDecoratorToken = getAbstractInjectionToken2({
  id: 'registration-decorator-token',
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const deregistrationDecoratorToken = getAbstractInjectionToken2({
  id: 'deregistration-decorator-token',
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});
