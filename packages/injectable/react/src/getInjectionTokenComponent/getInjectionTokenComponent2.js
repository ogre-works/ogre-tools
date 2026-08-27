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
  })(specificInjectionTokenFactory);

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
  // its own trailing call — getInjectionTokenComponent2(options)(factory), or
  // getInjectionTokenComponent2(options)() for a token component with no
  // `.for` at all. Passing a factory also makes the token component
  // abstract — not directly renderable, only reachable via `.for()` — same
  // as core's getInjectionToken2. The explicit-SF escape hatch
  // (getInjectionTokenComponent2<Component, SpecificFactory>(options)) uses
  // this exact same shape.
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

  // A `speciality` in options builds a specific token component directly —
  // this is how getSpecificInjectionTokenComponent2 used to be its own
  // function; folded in here since buildTokenComponent already threads
  // `speciality` through to core's getInjectionToken2 regardless of which
  // creator is called.
  return specificInjectionTokenFactory =>
    buildTokenComponent({ ...options, specificInjectionTokenFactory });
};
