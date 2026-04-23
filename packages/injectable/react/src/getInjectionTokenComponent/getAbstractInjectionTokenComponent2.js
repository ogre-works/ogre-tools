import { getAbstractInjectionToken2 } from '@lensapp/injectable';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';

export const getAbstractInjectionTokenComponent2 = ({
  PlaceholderComponent,
  id,
  decorable,
  specificInjectionTokenFactory,
}) =>
  getAbstractInjectionToken2({
    id,
    decorable,

    specificInjectionTokenFactory:
      specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent2({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })),
  });
