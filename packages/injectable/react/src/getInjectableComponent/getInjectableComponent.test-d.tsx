import React from 'react';

import { expectAssignable, expectError, printType } from 'tsd';
import { getInjectableComponent } from '../../index';
import {
  getInjectionToken,
  Injectable,
  lifecycleEnum,
} from '@lensapp/injectable';

const someInjectionTokenUsingProps = getInjectionToken<
  React.ComponentType<{ someProp: string }>
>({
  id: 'irrelevant',
});

const SomeFunctionalComponentNotUsingProps = () => <div>irrelevant</div>;

const SomeFunctionalComponentUsingProps = ({
  someProp,
}: {
  someProp: string;
}) => <div>irrelevant</div>;

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
const InjectableComponentNotUsingProps = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
});
expectAssignable<React.ComponentType>(InjectableComponentNotUsingProps);

expectAssignable<Injectable<React.ComponentType>>(
  InjectableComponentNotUsingProps,
);

// given injection token, and functional component not using props, typing is ok
const someInjectionTokenNotUsingProps = getInjectionToken<React.ComponentType>({
  id: 'irrelevant',
});

const InjectableComponentUsingInjectionToken = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
  injectionToken: someInjectionTokenNotUsingProps,
});

expectAssignable<React.ComponentType>(InjectableComponentUsingInjectionToken);

expectAssignable<Injectable<React.ComponentType>>(
  InjectableComponentUsingInjectionToken,
);

// given a placeholder, typing is ok
const InjectableComponentUsingPlaceholder = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
  PlaceholderComponent: () => <div>irrelevant</div>,
});

expectAssignable<React.ComponentType>(InjectableComponentUsingPlaceholder);

expectAssignable<Injectable<React.ComponentType>>(
  InjectableComponentUsingPlaceholder,
);

// given a placeholder that uses props, typing is ok
const InjectableComponentUsingPlaceholderThatUsesProps = getInjectableComponent(
  {
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    PlaceholderComponent: ({ someProp }) => <div>{someProp}</div>,
  },
);

expectAssignable<React.ComponentType<{ someProp: string }>>(
  InjectableComponentUsingPlaceholderThatUsesProps,
);

expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    PlaceholderComponent: ({ someProp2 }) => <div>{someProp2}</div>,
  }),
);

// given causing a side-effect, typing is ok
const InjectableComponentCausingSideEffect = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentNotUsingProps,
  causesSideEffects: true,
});

expectAssignable<React.ComponentType>(InjectableComponentCausingSideEffect);

expectAssignable<Injectable<React.ComponentType>>(
  InjectableComponentCausingSideEffect,
);

// given injection token, and functional component using props, typing is ok
const SomeInjectableComponentUsingInjectionToken = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentUsingProps,
  injectionToken: someInjectionTokenUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponentUsingInjectionToken,
);

expectAssignable<Injectable<React.ComponentType<{ someProp: string }>>>(
  SomeInjectableComponentUsingInjectionToken,
);

// given injection token, and functional component using less props than token, typing is still ok
const SomeInjectableComponentUsingLessPropsThanInjectionToken =
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    injectionToken: someInjectionTokenUsingProps,
  });

expectAssignable<React.ComponentType>(
  SomeInjectableComponentUsingLessPropsThanInjectionToken,
);

expectAssignable<Injectable<React.ComponentType>>(
  SomeInjectableComponentUsingLessPropsThanInjectionToken,
);

// given injection token, and contradictory functional component using props, typing is not ok
const someInjectionTokenUsingContradictoryProps = getInjectionToken<
  React.ComponentType<{ someProp: number }>
>({
  id: 'irrelevant',
});

expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentUsingProps,
    injectionToken: someInjectionTokenUsingContradictoryProps,
  }),
);

// given non-sensical injection token, and functional component, typing is not ok
const someNonSensicalInjectionToken = getInjectionToken<'some-non-component'>({
  id: 'irrelevant',
});

expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    injectionToken: someNonSensicalInjectionToken,
  }),
);

// given functional component using props, typing is ok
const SomeInjectableComponentUsingProps = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeFunctionalComponentUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeInjectableComponentUsingProps,
);

expectAssignable<Injectable<React.ComponentType<{ someProp: string }>>>(
  SomeInjectableComponentUsingProps,
);

// given class component not using props, typing is ok
const SomeClassInjectableComponentNotUsingProps = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeClassComponentNotUsingProps,
});

expectAssignable<React.ComponentType>(
  SomeClassInjectableComponentNotUsingProps,
);

expectAssignable<Injectable<React.ComponentType>>(
  SomeClassInjectableComponentNotUsingProps,
);

// given class component using props, typing is ok
const SomeClassInjectableComponentUsingProps = getInjectableComponent({
  id: 'irrelevant',
  Component: SomeClassComponentUsingProps,
});

expectAssignable<React.ComponentType<{ someProp: string }>>(
  SomeClassInjectableComponentUsingProps,
);

expectAssignable<Injectable<React.ComponentType<{ someProp: string }>>>(
  SomeClassInjectableComponentUsingProps,
);

// given custom instantiate, typing is not ok
expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    instantiate: () => ({ someProp: 'irrelevant' }),
  }),
);

// given custom lifecycle, typing is not ok
expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    lifecycle: lifecycleEnum.transient,
  }),
);

// given scope, typing is not ok
expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    scope: true,
  }),
);

// given decorable, typing is not ok
expectError(
  getInjectableComponent({
    id: 'irrelevant',
    Component: SomeFunctionalComponentNotUsingProps,
    decorable: false,
  }),
);
