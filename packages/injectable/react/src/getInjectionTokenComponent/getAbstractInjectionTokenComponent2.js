import { getAbstractInjectionToken2 } from '@ogre-tools/injectable';

const buildAbstractTokenComponent = ({
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
  })(specificInjectionTokenFactory);

export const getAbstractInjectionTokenComponent2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getAbstractInjectionTokenComponent2(options)(factory).
  // The factory is mandatory: an abstract token component is a family by
  // definition, so getAbstractInjectionToken2 itself throws if it is
  // omitted. The explicit-SF escape hatch
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
