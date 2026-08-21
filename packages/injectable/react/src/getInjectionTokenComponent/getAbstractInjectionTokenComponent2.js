import { getAbstractInjectionToken2 } from '@ogre-tools/injectable';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';

export const getAbstractInjectionTokenComponent2 = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  tags,
}) =>
  getAbstractInjectionToken2()({
    id,
    tags,

    // Specific component tokens derived from this family are implemented by
    // exactly one component each.
    cardinality: 'one',

    specificInjectionTokenFactory:
      specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent2({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })),
  });
