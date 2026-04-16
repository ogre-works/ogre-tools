import React from 'react';

import { expectAssignable, expectError, expectType } from 'tsd';
import {
  getInjectionTokenComponent,
  getInjectableComponent,
} from '../../index';
import {
  createContainer,
  getTypedSpecifier,
  InjectionToken,
  SpecificInjectionToken,
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
const SomeInjectableComponent = getInjectableComponent({
  id: 'irrelevant',
  Component: ({ someProp }: { someProp: string }) => <div>{someProp}</div>,
  injectionToken: SomeTokenComponentWithProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponent,
);

// given contradictory component, typing is not ok
expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: ({ someProp }: { someProp: number }) => <div>{someProp}</div>,
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

// .for() returns a SpecificInjectionToken
const SomeSpecificToken = SomeTokenComponentWithProps.for('some-specific');

expectAssignable<
  SpecificInjectionToken<React.ComponentType<{ someProp: string }>>
>(SomeSpecificToken);

// given typed specifier, .for() returns a specific token with typed props, and InjectableComponent using it has correct props
const SomeTokenComponentWithTypedSpecifier = getInjectionTokenComponent<
  React.ComponentType<unknown>,
  <T extends TypedSpecifierWithType<'someSpecifier'>>(
    specifier: T,
  ) => SpecificInjectionToken<
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

// given non-sensical type (not a component), typing is not ok
expectError(
  getInjectionTokenComponent<'some-non-component'>({
    id: 'irrelevant',
  }),
);
