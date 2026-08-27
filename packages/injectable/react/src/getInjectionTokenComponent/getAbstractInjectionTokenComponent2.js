import { getAbstractInjectionToken2 } from '@ogre-tools/injectable';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';

const buildAbstractTokenComponent = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  tags,
}) =>
  getAbstractInjectionToken2({
    id,
    tags,

    // Specific component tokens derived from this family are implemented by
    // exactly one component each.
    cardinality: 'one',
  })(
    specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent2({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })()),
  );

export const getAbstractInjectionTokenComponent2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getAbstractInjectionTokenComponent2(options)(factory),
  // or getAbstractInjectionTokenComponent2(options)() for the default
  // factory. The explicit-SF escape hatch
  // (getAbstractInjectionTokenComponent2<Component, SpecificFactory>(options))
  // uses this exact same shape — see the comment on core's getInjectionToken2.
  if (args.length !== 1) {
    throw new Error(
      `Tried to create abstract injection token component${
        args[0]?.id ? ` "${args[0].id}"` : ''
      } with ${
        args.length
      } arguments; getAbstractInjectionTokenComponent2 takes exactly one (options).`,
    );
  }

  const [options] = args;

  return specificInjectionTokenFactory =>
    buildAbstractTokenComponent({ ...options, specificInjectionTokenFactory });
};
