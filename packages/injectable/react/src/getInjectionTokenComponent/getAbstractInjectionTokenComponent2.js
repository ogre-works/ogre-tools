import { getAbstractInjectionToken2 } from '@lensapp/injectable';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';

export const getAbstractInjectionTokenComponent2 = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  tags,
}) =>
  getAbstractInjectionToken2({
    id,
    tags,

    specificInjectionTokenFactory:
      specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent2({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })),
  });
