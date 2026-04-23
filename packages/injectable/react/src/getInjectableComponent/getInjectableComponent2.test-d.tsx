import React from 'react';

import { expectAssignable, expectError, expectType } from 'tsd';
import { getInjectableComponent2 } from '../../index';
import {
  createContainer,
  getInjectionToken2,
  getTypedSpecifier,
  Injectable2,
  lifecycleEnum,
  SpecificInjectionToken2,
  TypedSpecifierType,
  TypedSpecifierWithType,
} from '@lensapp/injectable';

const someInjectionTokenUsingProps = getInjectionToken2<
  () => React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
});

const SomeFunctionalComponentNotUsingProps = () => <div>irrelevant</div>;

const SomeFunctionalComponentNotUsingPropsAsComponentType: React.ComponentType =
  () => <div>irrelevant</div>;

const SomeFunctionalComponentUsingProps = ({
  someProp,
}: {
  someProp: string;
}) => <div>irrelevant</div>;

const SomeFunctionalComponentUsingPropsAsComponentType: React.ComponentType<{
  someProp: string;
}> = ({ someProp }) => <div>irrelevant</div>;

class SomeClassComponentNotUsingProps extends React.Component {
  render() {
    return <div>irrelevant</div>;
  }
}

class SomeClassComponentUsingProps extends React.Component<{
  someProp: string;
}> {
  render() {
    return <div>irrelevant</div>;
  }
}

// given functional component not using props, typing is ok
const InjectableComponentNotUsingProps = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
});
expectAssignable<React.ComponentType>(InjectableComponentNotUsingProps);

expectAssignable<Injectable2<() => React.ComponentType>>(
  InjectableComponentNotUsingProps,
);

// given injection token, and functional component not using props, typing is ok
const someInjectionTokenNotUsingProps = getInjectionToken2<
  () => React.ComponentType
>({
  id: 'irrelevant',
});

const InjectableComponentUsingInjectionToken = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingPropsAsComponentType,
  injectionToken: someInjectionTokenNotUsingProps,
});

expectAssignable<React.ComponentType>(InjectableComponentUsingInjectionToken);

expectAssignable<Injectable2<() => React.ComponentType>>(
  InjectableComponentUsingInjectionToken,
);

// given a placeholder, typing is ok
const InjectableComponentUsingPlaceholder = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
  PlaceholderComponent: () => <div>irrelevant</div>,
});

// given a null placeholder, typing is ok
const InjectableComponentUsingNullPlaceholder = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentUsingProps,
  PlaceholderComponent: () => null,
});

expectAssignable<React.ComponentType>(InjectableComponentUsingPlaceholder);

expectAssignable<Injectable2<() => React.ComponentType>>(
  InjectableComponentUsingPlaceholder,
);

// given a placeholder that uses props, typing is ok
const InjectableComponentUsingPlaceholderThatUsesProps =
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    PlaceholderComponent: ({ someProp }) => <div>{someProp}</div>,
  });

expectAssignable<React.ComponentType<{ someProp: string }>>(
  InjectableComponentUsingPlaceholderThatUsesProps,
);

expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    PlaceholderComponent: ({ someProp2 }) => <div>{someProp2}</div>,
  }),
);

// given causing a side-effect, typing is ok
const InjectableComponentCausingSideEffect = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
  causesSideEffects: true,
});

expectAssignable<React.ComponentType>(InjectableComponentCausingSideEffect);

expectAssignable<Injectable2<() => React.ComponentType>>(
  InjectableComponentCausingSideEffect,
);

// given injection token, and functional component using props, typing is ok
const SomeInjectableComponentUsingInjectionToken = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentUsingPropsAsComponentType,
  injectionToken: someInjectionTokenUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponentUsingInjectionToken,
);

expectAssignable<Injectable2<() => React.ComponentType<{ someProp: string }>>>(
  SomeInjectableComponentUsingInjectionToken,
);

const di = createContainer('irrelevant');
expectType<React.ComponentType<{ someProp: string }>>(
  di.inject(SomeInjectableComponentUsingInjectionToken),
);

// given injection token, and component with contradictory props, typing is not ok
const SomeFunctionalComponentUsingContradictoryPropsAsComponentType: React.ComponentType<{
  someProp: number;
}> = ({ someProp }) => <div>{someProp}</div>;

expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingContradictoryPropsAsComponentType,
    injectionToken: someInjectionTokenUsingProps,
  }),
);

// given injection token, and contradictory functional component using props, typing is not ok
const someInjectionTokenUsingContradictoryProps = getInjectionToken2<
  () => React.ComponentType<{ someProp: number }>
>({
  id: 'irrelevant',
});

expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    injectionToken: someInjectionTokenUsingContradictoryProps,
  }),
);

// given non-sensical injection token, and functional component, typing is not ok
const someNonSensicalInjectionToken = getInjectionToken2<
  () => 'some-non-component'
>({
  id: 'irrelevant',
});

expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    injectionToken: someNonSensicalInjectionToken,
  }),
);

// given functional component using props, typing is ok
const SomeInjectableComponentUsingProps = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeFunctionalComponentUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponentUsingProps,
);

expectAssignable<Injectable2<() => React.ComponentType<{ someProp: string }>>>(
  SomeInjectableComponentUsingProps,
);

// given class component not using props, typing is ok
const SomeClassInjectableComponentNotUsingProps = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeClassComponentNotUsingProps,
});

expectAssignable<React.ComponentType>(
  SomeClassInjectableComponentNotUsingProps,
);

expectAssignable<Injectable2<() => React.ComponentType>>(
  SomeClassInjectableComponentNotUsingProps,
);

// given class component using props, typing is ok
const SomeClassInjectableComponentUsingProps = getInjectableComponent2({
  id: 'irrelevant',
  Component: SomeClassComponentUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeClassInjectableComponentUsingProps,
);

expectAssignable<Injectable2<() => React.ComponentType<{ someProp: string }>>>(
  SomeClassInjectableComponentUsingProps,
);

// given custom instantiate, typing is not ok
expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    instantiate: () => ({ someProp: 'irrelevant' }),
  }),
);

// given custom lifecycle, typing is not ok
expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    lifecycle: lifecycleEnum.transient,
  }),
);

// given scope, typing is not ok
expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    scope: true,
  }),
);

// given decorable, typing is not ok
expectError(
  getInjectableComponent2({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    decorable: false,
  }),
);

// given injection token with typed specifier, and functional component using props, typing is ok
const someInjectionTokenWithTypedSpecifier = getInjectionToken2<
  () => React.ComponentType<unknown>,
  () => React.ComponentType<unknown>[],
  <T extends TypedSpecifierWithType<'someSpecifier'>>(
    specifier: T,
  ) => SpecificInjectionToken2<
    () => React.ComponentType<TypedSpecifierType<'someSpecifier', T>>
  >
>({ id: 'irrelevant' });

const someTypedSpecifier =
  getTypedSpecifier<{ someSpecifier: { someProp: 'some-type' } }>()(
    'irrelevant',
  );

const SomeInjectableComponentForTypedSpecifier = getInjectableComponent2({
  id: 'irrelevant',
  Component: props => {
    expectType<{ someProp: 'some-type' }>(props);

    return <div>irrelevant</div>;
  },

  injectionToken: someInjectionTokenWithTypedSpecifier.for(someTypedSpecifier),
});

expectAssignable<React.ComponentType<{ someProp: 'some-type' }>>(
  SomeInjectableComponentForTypedSpecifier,
);

expectAssignable<
  Injectable2<() => React.ComponentType<{ someProp: 'some-type' }>>
>(SomeInjectableComponentForTypedSpecifier);

expectType<React.ComponentType<{ someProp: 'some-type' }>>(
  di.inject(someInjectionTokenWithTypedSpecifier.for(someTypedSpecifier)),
);

const SomeGenericInjectableComponent = getInjectableComponent2({
  id: 'some-generic',

  Component: <T extends { someOtherProp: unknown }>({
    someProp,
    someOtherProp,
  }: {
    someProp: T;
    someOtherProp: T['someOtherProp'];
  }) => <div />,
});

expectError(
  <SomeGenericInjectableComponent
    someProp={{ someOtherProp: 42 }}
    someOtherProp="some-string"
  />,
);

const SomeGenericComponent = <T extends { someOtherProp: unknown }>({
  someProp,
  someOtherProp,
}: {
  someProp: T;
  someOtherProp: T['someOtherProp'];
}) => <div />;

expectError(
  <SomeGenericComponent
    someProp={{ someOtherProp: 42 }}
    someOtherProp="some-string"
  />,
);
