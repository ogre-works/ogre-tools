import { getAbstractInjectionToken2 } from '@lensapp/injectable';
import { getInjectionTokenComponent } from './getInjectionTokenComponent';

export const getAbstractInjectionTokenComponent = ({
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
        getInjectionTokenComponent({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })),
  });
