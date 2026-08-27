import React, { forwardRef, Suspense } from 'react';
import { getInjectionToken2 } from '@ogre-tools/injectable';
import { useInject } from '../useInject/useInject';

const buildTokenComponent = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  speciality,
  tags,
}) => {
  let TokenComponent;

  const ComponentForReact = forwardRef((props, ref) => {
    const InjectedComponent = useInject(TokenComponent);

    return PlaceholderComponent ? (
      <Suspense fallback={<PlaceholderComponent {...props} />}>
        <InjectedComponent {...props} ref={ref} />
      </Suspense>
    ) : (
      <InjectedComponent {...props} ref={ref} />
    );
  });

  TokenComponent = getInjectionToken2({
    id,
    target: ComponentForReact,
    speciality,
    tags,

    // A component token is implemented by exactly one component; its
    // `.for()` children inherit that.
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

  Object.defineProperty(TokenComponent, 'displayName', {
    get() {
      return `InjectionTokenComponent(${this.id})`;
    },
    configurable: true,
  });

  return TokenComponent;
};

export const getInjectionTokenComponent2 = (...args) => {
  // A single, non-curried call: options given directly, factory curried as
  // its own trailing call — getInjectionTokenComponent2(options)(factory),
  // or getInjectionTokenComponent2(options)() for the default factory. The
  // explicit-SF escape hatch (getInjectionTokenComponent2<Component, SpecificFactory>(options))
  // uses this exact same shape — see the comment on core's getInjectionToken2.
  if (args.length !== 1) {
    throw new Error(
      `Tried to create injection token component${
        args[0]?.id ? ` "${args[0].id}"` : ''
      } with ${
        args.length
      } arguments; getInjectionTokenComponent2 takes exactly one (options).`,
    );
  }

  const [options] = args;

  return specificInjectionTokenFactory =>
    buildTokenComponent({ ...options, specificInjectionTokenFactory });
};

export const getSpecificInjectionTokenComponent2 = (...args) => {
  // A single call, no curry needed: unlike getSpecificInjectionToken2 in the
  // core package, there's no generic cardinality to protect from collapsing
  // here — a component token's cardinality is always 'one'.
  if (args.length !== 1) {
    throw new Error(
      `Tried to create specific injection token component${
        args[0]?.id ? ` "${args[0].id}"` : ''
      } with ${
        args.length
      } arguments; getSpecificInjectionTokenComponent2 takes exactly one (options).`,
    );
  }

  const [options] = args;

  return buildTokenComponent(options);
};
