import React from 'react';

import { expectAssignable, expectError, expectType } from 'tsd';
import {
  getInjectionTokenComponent2,
  getInjectableComponent2,
  SpecificInjectionTokenComponent2,
} from '../../index';
import {
  createContainer,
  getTypedSpecifier,
  InjectionToken2,
  TypedSpecifierType,
  TypedSpecifierWithType,
} from '@ogre-tools/injectable';

// given no type parameter, result is assignable to React.ComponentType and InjectionToken2
const SomeTokenComponent = getInjectionTokenComponent2({
  id: 'irrelevant',
})();

expectAssignable<React.ComponentType>(SomeTokenComponent);
expectAssignable<InjectionToken2<() => React.ComponentType>>(
  SomeTokenComponent,
);

// given typed as component with props, result is assignable to React.ComponentType<Props> and InjectionToken2<() => Component>
const SomeTokenComponentWithProps = getInjectionTokenComponent2<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
})();

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeTokenComponentWithProps,
);

expectAssignable<
  InjectionToken2<() => React.ComponentType<{ someProp: string }>>
>(SomeTokenComponentWithProps);

// di.inject returns the correct component type
const di = createContainer('irrelevant');

expectType<React.ComponentType<{ someProp: string }>>(
  di.inject(SomeTokenComponentWithProps),
);

// can be used as injectionToken in getInjectableComponent2
const SomeComponentWithProps: React.ComponentType<{ someProp: string }> = ({
  someProp,
}) => <div>{someProp}</div>;

const SomeInjectableComponent = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeComponentWithProps,
  injectionToken: SomeTokenComponentWithProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponent,
);

// given contradictory component, typing is not ok
const SomeComponentWithWrongProps: React.ComponentType<{
  someProp: number;
}> = ({ someProp }) => <div>{someProp}</div>;

expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeComponentWithWrongProps,
    injectionToken: SomeTokenComponentWithProps,
  }),
);

// given placeholder component, typing is ok
const SomeTokenComponentWithPlaceholder = getInjectionTokenComponent2<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
  PlaceholderComponent: ({ someProp }) => <div>{someProp}</div>,
})();

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeTokenComponentWithPlaceholder,
);

// given placeholder with wrong props, typing is not ok
expectError(
  getInjectionTokenComponent2<React.ComponentType<{ someProp: string }>>({
    id: 'irrelevant',
    PlaceholderComponent: ({ wrongProp }: { wrongProp: number }) => (
      <div>{wrongProp}</div>
    ),
  })(),
);

// .for() returns a SpecificInjectionTokenComponent — a separate, abstract
// (factory-bearing) token component, since SomeTokenComponentWithProps above
// has no factory and so no `.for()` at all
const SomeAbstractTokenComponentWithProps = getInjectionTokenComponent2<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant-abstract',
})(specId =>
  getInjectionTokenComponent2<
    React.ComponentType<{ someProp: string }>
  >({
    id: specId,
    speciality: specId,
  })(),
);

const SomeSpecificToken =
  SomeAbstractTokenComponentWithProps.for('some-specific');

expectAssignable<
  SpecificInjectionTokenComponent2<React.ComponentType<{ someProp: string }>>
>(SomeSpecificToken);

// specific token is injectable
expectType<React.ComponentType<{ someProp: string }>>(
  di.inject(SomeSpecificToken),
);

// specific token works as injectionToken in getInjectableComponent2
getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeComponentWithProps,
  injectionToken: SomeSpecificToken,
});

// given typed specifier, .for() returns a specific token with typed props, and InjectableComponent2 using it has correct props
const SomeTokenComponentWithTypedSpecifier = getInjectionTokenComponent2<
  React.ComponentType<unknown>,
  <T extends TypedSpecifierWithType<'someSpecifier'>>(
    specifier: T,
  ) => SpecificInjectionTokenComponent2<
    React.ComponentType<TypedSpecifierType<'someSpecifier', T>>
  >
>({ id: 'irrelevant' })();

const someTypedSpecifier = getTypedSpecifier<{
  someSpecifier: { someProp: 'some-type' };
}>()('irrelevant');

const SomeInjectableComponentForTypedSpecifier = getInjectableComponent2({
  id: 'irrelevant',
  Component: props => {
    expectType<{ someProp: 'some-type' }>(props);

    return <div>irrelevant</div>;
  },

  injectionToken: SomeTokenComponentWithTypedSpecifier.for(someTypedSpecifier),
});

expectAssignable<React.ComponentType<{ someProp: 'some-type' }>>(
  SomeInjectableComponentForTypedSpecifier,
);

expectType<React.ComponentType<{ someProp: 'some-type' }>>(
  di.inject(SomeTokenComponentWithTypedSpecifier.for(someTypedSpecifier)),
);

// given a real generic factory value (not the TypedSpecifier escape hatch
// above, which never supplies one), .for() narrows the component's own
// props per specifier, decided at the call site
const SomeTokenComponentWithGenericFactory = getInjectionTokenComponent2<
  React.ComponentType<{ someProp: string }>
>({ id: 'irrelevant' })(<Speciality extends string>(speciality: Speciality) =>
  getInjectionTokenComponent2<
    React.ComponentType<{ someProp: Speciality }>
  >({
    id: speciality,
    speciality,
  })(),
);

const SomeSpecificFromGenericFactory = SomeTokenComponentWithGenericFactory.for(
  'some-generic-specific',
);

expectAssignable<
  SpecificInjectionTokenComponent2<
    React.ComponentType<{ someProp: 'some-generic-specific' }>
  >
>(SomeSpecificFromGenericFactory);

expectType<React.ComponentType<{ someProp: 'some-generic-specific' }>>(
  di.inject(SomeSpecificFromGenericFactory),
);

// multi-level .for() through nested abstract families. Level1/Level2 are
// deliberately plain `string`, not generic type parameters like
// SomeTokenComponentWithGenericFactory above: an *intermediate* level's
// factory going through getInjectionTokenComponent2's speciality overload
// while itself returning another generic factory hits a real TS inference
// limit — the outer call's generic gets widened to its constraint instead
// of narrowed per specifier (same limitation noted on core's analogous
// two-level test in index.test-d.ts). Generic-specifier narrowing itself is
// already covered by SomeTokenComponentWithGenericFactory above; this test
// is about multi-level nesting and abstractness, so it doesn't need to
// double as that demonstration too.
const SomeAbstractTokenComponentWithTwoLevels =
  getInjectionTokenComponent2<
    React.ComponentType<{ level1: string; level2: string }>
  >({ id: 'irrelevant' })((level1: string) =>
    getInjectionTokenComponent2<
      React.ComponentType<{ level1: string; level2: string }>
    >({ id: `irrelevant-${level1}`, speciality: level1 })((level2: string) =>
      getInjectionTokenComponent2<
        React.ComponentType<{ level1: string; level2: string }>
      >({
        id: level2,
        speciality: level2,
      })(),
    ),
  );

// the family itself is abstract — not identifiable as a React component at
// all, regardless of props (React.ComponentType<any>, not just a mismatched
// props shape, so a props mismatch can't be mistaken for this)
expectError<React.ComponentType<any>>(SomeAbstractTokenComponentWithTwoLevels);

// resolving only the first of two levels still isn't enough: the result is
// itself another abstract family, not yet a renderable component
const SomeIntermediateFromTwoLevels =
  SomeAbstractTokenComponentWithTwoLevels.for('some-level1');

expectError<React.ComponentType<any>>(SomeIntermediateFromTwoLevels);

const SomeSpecificFromTwoLevels =
  SomeIntermediateFromTwoLevels.for('some-level2');

// only once both levels are resolved is the result a renderable component
expectAssignable<
  React.ComponentType<{ level1: string; level2: string }>
>(SomeSpecificFromTwoLevels);

expectType<React.ComponentType<{ level1: string; level2: string }>>(
  di.inject(SomeSpecificFromTwoLevels),
);

// ---- Direct JSX rendering (without injecting first) ----

// token component without props renders in JSX
<SomeTokenComponent />;

// token component with props renders in JSX with correct props
<SomeTokenComponentWithProps someProp="some-value" />;

// token component with props errors when required prop is missing
expectError(<SomeTokenComponentWithProps />);

// token component with props errors when prop has wrong type
expectError(<SomeTokenComponentWithProps someProp={42} />);

// specific token from .for() renders in JSX with correct props
<SomeSpecificToken someProp="some-value" />;

// specific token from .for() errors when required prop is missing
expectError(<SomeSpecificToken />);

// typed specifier specific token renders in JSX with typed props
const SomeTypedSpecificToken =
  SomeTokenComponentWithTypedSpecifier.for(someTypedSpecifier);
<SomeTypedSpecificToken someProp="some-type" />;

// typed specifier specific token errors when prop has wrong type
expectError(<SomeTypedSpecificToken someProp={42} />);

// specific token from a real generic factory renders in JSX with its prop
// narrowed to the specifier's own literal type
<SomeSpecificFromGenericFactory someProp="some-generic-specific" />;

// errors when the prop doesn't match the specifier's own literal type
expectError(<SomeSpecificFromGenericFactory someProp="some-other-specific" />);

// errors when the prop is missing entirely
expectError(<SomeSpecificFromGenericFactory />);

// two-level .for() renders once both levels are resolved (level1/level2 are
// plain `string` here, not narrowed per specifier — see the comment on
// SomeAbstractTokenComponentWithTwoLevels above)
<SomeSpecificFromTwoLevels level1="some-level1" level2="some-level2" />;

// ---- Abstract token component (getInjectionTokenComponent2 with a factory) ----

const SomeAbstractTokenComponent = getInjectionTokenComponent2<
  React.ComponentType<{ someProp: string }>
>({ id: 'irrelevant' })(specId =>
  getInjectionTokenComponent2<
    React.ComponentType<{ someProp: string }>
  >({
    id: specId,
    speciality: specId,
  })(),
);

// abstract token component is not identifiable as a React component at all,
// regardless of props (cannot be rendered)
expectError<React.ComponentType<any>>(SomeAbstractTokenComponent);

// .for() returns a renderable specific token component
const SomeConcreteFromAbstract =
  SomeAbstractTokenComponent.for('some-specific');

// concrete specific token from .for() CAN be rendered as JSX
<SomeConcreteFromAbstract someProp="value" />;

// concrete specific token errors on missing required prop
expectError(<SomeConcreteFromAbstract />);

// concrete specific token errors on wrong prop type
expectError(<SomeConcreteFromAbstract someProp={42} />);

// abstract token component cannot be injected
expectError(di.inject(SomeAbstractTokenComponent));

// concrete specific token can be injected
di.inject(SomeConcreteFromAbstract);

// abstract token component cannot be used as injectionToken in getInjectableComponent2
expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeComponentWithProps,
    injectionToken: SomeAbstractTokenComponent,
  }),
);

// concrete specific token can be used as injectionToken
getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeComponentWithProps,
  injectionToken: SomeConcreteFromAbstract,
});

// given non-sensical type (not a component), typing is not ok
expectError(
  getInjectionTokenComponent2<'some-non-component'>({
    id: 'irrelevant',
  })(),
);

// given tags, typing is ok
getInjectionTokenComponent2({
  id: 'irrelevant',
  tags: ['some-tag'],
})();

getInjectionTokenComponent2({
  id: 'irrelevant',
  tags: ['some-tag'],
})(specId =>
  getInjectionTokenComponent2({ id: specId, speciality: specId })(),
);

// given non-string tags, typing is not ok
expectError(
  getInjectionTokenComponent2({
    id: 'irrelevant',
    tags: [42],
  })(),
);

expectError(
  getInjectionTokenComponent2({
    id: 'irrelevant',
    tags: [42],
  })(),
);
