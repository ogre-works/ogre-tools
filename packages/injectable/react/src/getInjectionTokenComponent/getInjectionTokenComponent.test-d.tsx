import React from 'react';

import { expectAssignable, expectError, expectType } from 'tsd';
import {
  getInjectionTokenComponent,
  getInjectableComponent,
  SpecificInjectionTokenComponent,
} from '../../index';
import {
  createContainer,
  getTypedSpecifier,
  InjectionToken,
  TypedSpecifierType,
  TypedSpecifierWithType,
} from '@lensapp/injectable';

// given no type parameter, result is assignable to React.ComponentType and InjectionToken
const SomeTokenComponent = getInjectionTokenComponent({
  id: 'irrelevant',
});

expectAssignable<React.ComponentType>(SomeTokenComponent);
expectAssignable<InjectionToken<React.ComponentType>>(SomeTokenComponent);

// given typed as component with props, result is assignable to React.ComponentType<Props> and InjectionToken<Component>
const SomeTokenComponentWithProps = getInjectionTokenComponent<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeTokenComponentWithProps,
);

expectAssignable<InjectionToken<React.ComponentType<{ someProp: string }>>>(
  SomeTokenComponentWithProps,
);

// di.inject returns the correct component type
const di = createContainer('irrelevant');

expectType<React.ComponentType<{ someProp: string }>>(
  di.inject(SomeTokenComponentWithProps),
);

// can be used as injectionToken in getInjectableComponent
const SomeComponentWithProps: React.ComponentType<{ someProp: string }> = ({
  someProp,
}) => <div>{someProp}</div>;

const SomeInjectableComponent = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeComponentWithProps,
  injectionToken: SomeTokenComponentWithProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponent,
);

// given contradictory component, typing is not ok
const SomeComponentWithWrongProps: React.ComponentType<{ someProp: number }> =
  ({ someProp }) => <div>{someProp}</div>;

expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeComponentWithWrongProps,
    injectionToken: SomeTokenComponentWithProps,
  }),
);

// given placeholder component, typing is ok
const SomeTokenComponentWithPlaceholder = getInjectionTokenComponent<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
  PlaceholderComponent: ({ someProp }) => <div>{someProp}</div>,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeTokenComponentWithPlaceholder,
);

// given placeholder with wrong props, typing is not ok
expectError(
  getInjectionTokenComponent<React.ComponentType<{ someProp: string }>>({
    id: 'irrelevant',
    PlaceholderComponent: ({ wrongProp }: { wrongProp: number }) => (
      <div>{wrongProp}</div>
    ),
  }),
);

// .for() returns a SpecificInjectionTokenComponent
const SomeSpecificToken = SomeTokenComponentWithProps.for('some-specific');

expectAssignable<
  SpecificInjectionTokenComponent<React.ComponentType<{ someProp: string }>>
>(SomeSpecificToken);

// specific token is injectable
expectType<React.ComponentType<{ someProp: string }>>(
  di.inject(SomeSpecificToken),
);

// specific token works as injectionToken in getInjectableComponent
getInjectableComponent({
  id: 'irrelevant',
  Component: SomeComponentWithProps,
  injectionToken: SomeSpecificToken,
});

// given typed specifier, .for() returns a specific token with typed props, and InjectableComponent using it has correct props
const SomeTokenComponentWithTypedSpecifier = getInjectionTokenComponent<
  React.ComponentType<unknown>,
  <T extends TypedSpecifierWithType<'someSpecifier'>>(
    specifier: T,
  ) => SpecificInjectionTokenComponent<
    React.ComponentType<TypedSpecifierType<'someSpecifier', T>>
  >
>({ id: 'irrelevant' });

const someTypedSpecifier =
  getTypedSpecifier<{ someSpecifier: { someProp: 'some-type' } }>()(
    'irrelevant',
  );

const SomeInjectableComponentForTypedSpecifier = getInjectableComponent({
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

// given non-sensical type (not a component), typing is not ok
expectError(
  getInjectionTokenComponent<'some-non-component'>({
    id: 'irrelevant',
  }),
);

// --- Narrow function component with InjectionTokenComponent token ---

// given a narrow function component (not annotated as ComponentType) with an
// InjectionTokenComponent<ComponentType<{}>> token, typing is ok
const NarrowFunctionComponentNoProps = () => <div>irrelevant</div>;

getInjectableComponent({
  id: 'irrelevant',
  Component: NarrowFunctionComponentNoProps,
  injectionToken: SomeTokenComponent,
});

// given a narrow function component with props with an
// InjectionTokenComponent<ComponentType<Props>> token, typing is ok
const NarrowFunctionComponentWithProps = ({
  someProp,
}: {
  someProp: string;
}) => <div>{someProp}</div>;

getInjectableComponent({
  id: 'irrelevant',
  Component: NarrowFunctionComponentWithProps,
  injectionToken: SomeTokenComponentWithProps,
});

// given a narrow function component with a .for()-specific token, typing is ok
getInjectableComponent({
  id: 'irrelevant',
  Component: NarrowFunctionComponentWithProps,
  injectionToken: SomeSpecificToken,
});
