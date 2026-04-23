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

export const instantiationDecoratorToken = getAbstractInjectionToken2({
  id: 'instantiate-decorator-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const injectionDecoratorToken = getAbstractInjectionToken2({
  id: 'injection-decorator-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const instancePurgeCallbackToken = getAbstractInjectionToken2({
  id: 'instance-purge-callback-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const registrationDecoratorToken = getAbstractInjectionToken2({
  id: 'registration-decorator-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});

export const deregistrationDecoratorToken = getAbstractInjectionToken2({
  id: 'deregistration-decorator-token',
  decorable: false,
  specificInjectionTokenFactory: target =>
    getSpecificInjectionToken2({ id: target.id, speciality: target }),
});
