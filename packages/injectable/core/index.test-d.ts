import { expectError, expectNotType, expectType } from 'tsd';

import {
  createContainer,
  createInjectionTargetDecorator,
  createInstantiationTargetDecorator,
  DiContainer,
  DiContainerForInjection,
  getInjectable,
  getInjectableBunch,
  getInjectionToken,
  getInjectionToken2,
  getKeyedSingletonCompositeKey,
  Injectable,
  injectionDecoratorToken,
  InjectionToken,
  Instantiate,
  instantiationDecoratorToken,
  isInjectable,
  isInjectionToken,
  lifecycleEnum,
  lifecycleEnum2,
  SpecificInject,
} from '.';

const di = createContainer('some-container');

type GetNumber = () => number;
const someGetNumberInjectionToken = getInjectionToken<GetNumber>({
  id: 'some-get-number-token',
});

// // given injectable and decorator targeting a token, typing is ok
// const decoratorForToken = getInjectable({
//   id: 'decorator-for-token',
//
//   instantiate: () =>
//     createInstantiationTargetDecorator({
//       target: someGetNumberInjectionToken,
//
//       decorate: toBeDecorated => di => {
//         expectType<Instantiate<GetNumber, void>>(toBeDecorated);
//
//         const instance = toBeDecorated(di);
//
//         return instance;
//       },
//     }),
//
//   injectionToken: instantiationDecoratorToken,
// });
//
// const foo: unknown = 'number';
//
// if (isInjectable(foo)) {
//   expectType<Injectable<unknown, unknown, unknown>>(foo);
// }
//
// if (isInjectionToken(foo)) {
//   expectType<InjectionToken<unknown, unknown>>(foo);
// }
//
// const x1: boolean = isInjectable(foo);
// const x2: boolean = isInjectionToken(foo);
//
// // given injectable without instantiation paramater and decorator targeting the injectable, typing is ok
// const someInjectableToBeDecorated = getInjectable({
//   id: 'some-injectable-to-be-decorated',
//   instantiate: () => () => 42,
// });
//
// const decoratorForInjectable = getInjectable({
//   id: 'decorator-for-injectable',
//
//   instantiate: () =>
//     createInstantiationTargetDecorator({
//       target: someInjectableToBeDecorated,
//
//       decorate: toBeDecorated => di => {
//         expectType<Instantiate<() => 42, void>>(toBeDecorated);
//
//         const instance = toBeDecorated(di);
//
//         return instance;
//       },
//     }),
//
//   injectionToken: instantiationDecoratorToken,
// });
//
// // given injectable with instantiation parameter and decorator targeting the injectable, typing is ok
// const someParameterInjectableToBeDecorated = getInjectable({
//   id: 'some-parameter-injectable-to-be-decorated',
//   instantiate: (di, parameter: number) => `some-instance-${parameter}`,
//   lifecycle: lifecycleEnum.transient,
// });
//
// expectType<Injectable<string, unknown, number>>(
//   someParameterInjectableToBeDecorated,
// );
//
// const decoratorForParameterInjectable = getInjectable({
//   id: 'decorator-for-parameter-injectable',
//
//   instantiate: () =>
//     createInstantiationTargetDecorator({
//       target: someParameterInjectableToBeDecorated,
//
//       decorate: toBeDecorated => (di, param) => {
//         expectType<number>(param);
//         expectType<Instantiate<string, number>>(toBeDecorated);
//
//         const instance = toBeDecorated(di, param);
//
//         return instance;
//       },
//     }),
//
//   injectionToken: instantiationDecoratorToken,
// });
//
// const decoratorWithoutTargetInjectable = getInjectable({
//   id: 'decorator-without-target',
//
//   instantiate: () =>
//     createInstantiationTargetDecorator({
//       decorate: toBeDecorated => (di, param) => {
//         expectType<unknown>(param);
//         expectType<Instantiate<unknown, unknown>>(toBeDecorated);
//
//         const instance = toBeDecorated(di, param);
//
//         return instance;
//       },
//     }),
//
//   injectionToken: instantiationDecoratorToken,
// });
//
// const decoratorForInjectionParameterInjectable = getInjectable({
//   id: 'decorator-for-parameter-injectable',
//
//   instantiate: () =>
//     createInjectionTargetDecorator({
//       decorate: injectionToBeDecorated => (key, param) => {
//         expectType<SpecificInject<unknown, unknown>>(injectionToBeDecorated);
//         expectType<
//           | Injectable<unknown, unknown, unknown>
//           | InjectionToken<unknown, unknown>
//         >(key);
//         expectType<unknown>(param);
//
//         return injectionToBeDecorated(key, param);
//       },
//     }),
//
//   injectionToken: injectionDecoratorToken,
// });
//
// const decoratorForSpecificInjectionParameterInjectable = getInjectable({
//   id: 'decorator-for-parameter-injectable',
//
//   instantiate: () =>
//     createInjectionTargetDecorator({
//       decorate: injectionToBeDecorated => (key, param) => {
//         expectType<SpecificInject<string, number>>(injectionToBeDecorated);
//         expectType<
//           Injectable<string, unknown, number> | InjectionToken<string, number>
//         >(key);
//         expectType<number>(param);
//
//         return injectionToBeDecorated(key, param);
//       },
//       target: someParameterInjectableToBeDecorated,
//     }),
//
//   injectionToken: injectionDecoratorToken,
// });

// given injectable with unspecified type for instantiation parameter, argument typing is OK
const someInjectableForTypingOfInstantiate = getInjectable({
  id: 'some-injectable',

  instantiate: (di, instantiationParameter) => {
    expectType<DiContainerForInjection>(di);
    // Todo: should be unknown?
    expectType<any>(instantiationParameter);
  },

  lifecycle: lifecycleEnum2.keyedSingleton({
    getInstanceKey: di => instantiationParameter => {
      expectType<DiContainerForInjection>(di);
      // Todo: should be unknown?
      expectType<any>(instantiationParameter);
    },
  }),
});

const someInjectableWithMatchingInstantiationParameters = getInjectable({
  id: 'some-injectable',

  instantiate: (di, instantiationParameter: string) => {
    expectType<string>(instantiationParameter);
  },

  // Todo: restore lifecycleEnum1
  lifecycle: {
    getInstanceKey: di => instantiationParameter => {
      expectType<string>(instantiationParameter);
    },
  },
});

// given injectable with mismatching types for instantiation parameter, typing is not OK
expectError(
  getInjectable({
    id: 'some-injectable',

    instantiate: (di, instantiationParameter: number) => {},

    lifecycle: {
      getInstanceKey: di => (instantiationParameter: string) =>
        instantiationParameter,
    },
  }),
);

const someInjectableWithoutInstantiationParameter = getInjectable({
  id: 'some-injectable',
  instantiate: di => 'some string',
  lifecycle: lifecycleEnum2.transient,
});

// given injectable without instantiation parameters, when injected without parameter, typing is OK
expectType<string>(di.inject(someInjectableWithoutInstantiationParameter));

// given injectable without instantiation parameters, when injected with parameter, typing is not OK
expectError(di.inject(someInjectableWithoutInstantiationParameter, 42));

const someInjectableWithInstantiationParameter = getInjectable({
  id: 'some-other-injectable',
  instantiate: (di, instantiationParameter: number) => instantiationParameter,
  lifecycle: lifecycleEnum.transient,
});

// given injectable with instantiation parameters, when injected with parameter, typing is OK
expectType<number>(di.inject(someInjectableWithInstantiationParameter, 42));

// given injectable with instantiation parameters, when injected without parameter, typing is not OK
expectError(di.inject(someInjectableWithInstantiationParameter));

// given injectable with instantiation parameters, when injected with parameter of wrong type, typing is not OK
expectError(
  di.inject(someInjectableWithInstantiationParameter, 'some-not-number'),
);

const someInjectionToken = getInjectionToken<{
  requiredProperty: string;
  optionalProperty?: number;
}>({
  id: 'some-injection-token',
});

// given injection token, when creating implementation with wrong interface, typing is not OK
expectError(
  getInjectable({
    id: 'some-injectable',
    instantiate: () => ({}),
    injectionToken: someInjectionToken,
  }),
);

// given injection token, when creating implementation with incomplete interface, typing is not OK
expectError(
  getInjectable({
    id: 'some-injectable',
    instantiate: () => ({ requiredProperty: 42 }),
    injectionToken: someInjectionToken,
  }),
);

// given injection token, when creating implementation with mandatory but no optional properties, typing is OK
expectNotType<any>(
  getInjectable({
    id: 'some-injectable',
    instantiate: () => ({ requiredProperty: 'some string' }),
    injectionToken: someInjectionToken,
  }),
);

// given injection token, when creating implementation with mandatory and optional properties, typing is OK
expectNotType<any>(
  getInjectable({
    id: 'some-injectable',

    instantiate: () => ({
      requiredProperty: 'some string',
      optionalProperty: 42,
    }),

    injectionToken: someInjectionToken,
  }),
);

const someTokenWithGeneralProperty = getInjectionToken<{
  someGeneralProperty: string;
}>({
  id: 'some-token-with-general-property',
});

const someInjectableWithAlsoSpecificProperty = getInjectable({
  id: 'some-injectable',

  instantiate: di => ({
    someGeneralProperty: 'some string',
    someSpecificProperty: 42,
  }),

  injectionToken: someTokenWithGeneralProperty,
});

// given injection token and implementation which is more specific than the token, when injected as injectable, typing is specific
expectType<{ someGeneralProperty: string; someSpecificProperty: number }>(
  di.inject(someInjectableWithAlsoSpecificProperty),
);

// given injection token and implementation which is more specific than the token, when injected using injection token, typing is not specific
expectType<{ someGeneralProperty: string }>(
  di.inject(someTokenWithGeneralProperty),
);

// given injection token and implementation which is more specific than the token, when injecting many, typing is not specific
expectType<{ someGeneralProperty: string }[]>(
  di.injectMany(someTokenWithGeneralProperty),
);

// given injecting many with meta, typing is OK
expectType<
  {
    instance: {
      requiredProperty: string;
      optionalProperty?: number;
    };

    meta: { id: string };
  }[]
>(di.injectManyWithMeta(someInjectionToken));

// given injecting with meta, typing is OK
expectType<{
  instance: {
    requiredProperty: string;
    optionalProperty?: number;
  };

  meta: { id: string };
}>(di.injectWithMeta(someInjectionToken));

const someOtherInjectionToken = getInjectionToken<{ someProperty: number }>({
  id: 'some-other-injection-token',
});

const someInjectableForOverrides = getInjectable({
  id: 'some-injectable',
  instantiate: () => ({ someProperty: 42 }),
  injectionToken: someOtherInjectionToken,
});

// given injectable, when overriding with matching instantiate, typing is OK
expectType<void>(
  di.override(someInjectableForOverrides, () => ({ someProperty: 84 })),
);

// given injectable, when overriding with not matching instantiate, typing is not OK
expectError(
  di.override(someInjectableForOverrides, () => ({
    someProperty: 'some-not-number',
  })),
);

// given injectable, when early-overriding with matching instantiate, typing is OK
expectType<void>(
  di.earlyOverride(someInjectableForOverrides, () => ({ someProperty: 84 })),
);

// given injectable, when early-overriding with not matching instantiate, typing is not OK
expectError(
  di.earlyOverride(someInjectableForOverrides, () => ({
    someProperty: 'some-not-number',
  })),
);

// given injectable, when overriding with a more specific matching instantiate, typing is OK
expectType<void>(
  di.override(someInjectableForOverrides, () => ({
    someProperty: 84,
    someSpecificProperty: 42,
  })),
);

// given injectable with injection token, when overriding with injection token, typing is OK
expectType<void>(
  di.override(someOtherInjectionToken, () => ({ someProperty: 84 })),
);

// given injectable with injection token, when overriding with injection token, but wrong type of override, typing is not OK
expectError(
  di.override(someOtherInjectionToken, () => ({
    someProperty: 'not a number',
  })),
);

// given injectable, when getting instances using injectable, typing is OK
expectType<string[]>(
  di.getInstances(
    getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    }),
  ),
);

// given token, when getting instances using token, typing is OK
expectType<number[]>(
  di.getInstances(
    getInjectionToken<number>({
      id: 'some-token',
    }),
  ),
);

// given token with instantiation parameter, when used to inject a factory, typing is ok
expectType<(instantiationParameter: string) => number>(
  di.injectFactory(
    getInjectionToken<number, string>({
      id: 'some-token',
    }),
  ),
);

// given injectable that is keyed singleton, when used to inject a factory, typing is ok
expectType<(instantiationParameter: string) => number>(
  di.injectFactory(
    getInjectable({
      id: 'some-injectable',
      instantiate: (di, key: string) => 42,

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, key: string) => key,
      }),
    }),
  ),
);

// given injectable that is transient, when used to inject a factory, typing is ok
expectType<(instantiationParameter: { some: string }) => number>(
  di.injectFactory(
    getInjectable({
      id: 'some-injectable',
      instantiate: (di, instantiationParameter: { some: string }) => 42,

      lifecycle: lifecycleEnum.transient,
    }),
  ),
);

// given injectable that creates a factory as part of instantiate, typing is ok
getInjectable({
  id: 'some-injectable',
  instantiate: di => {
    const factory = di.injectFactory(
      getInjectionToken<number, string>({
        id: 'some-token',
      }),
    );

    expectType<(instantiationParameter: string) => number>(factory);
  },
});

// given injectable that is singleton, when used to inject a factory, typing is not ok
expectError(
  di.injectFactory(
    getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    }),
  ),
);

// Overrides and unoverrides
const someStringInjectionToken = getInjectionToken<string>({
  id: 'irrelevant',
});

const someInjectable = getInjectable({
  id: 'some-injectable',
  instantiate: di => 'some-string',
  injectionToken: someStringInjectionToken,
});

// given injectable, when overridden using injectable, typing is ok.
di.override(someInjectable, () => 'some-other-string');

// given injectable, when overridden using injectionToken, typing is ok.
di.override(someStringInjectionToken, () => 'some-other-string');

// given injectable, when unoverridden using injectable, typing is ok.
di.unoverride(someInjectable);

// given injectable, when unoverridden using injectionToken, typing is ok.
di.unoverride(someStringInjectionToken);

// given keyed singleton with sourceNamespace as key, typing is ok
const someKeyedSingletonWithSourceNamespaceAsKey = getInjectable({
  id: 'some-keyed-singleton-with-source-namespace-as-key',

  instantiate: di => {
    expectType<string | undefined>(di.sourceNamespace);

    return di.sourceNamespace;
  },

  lifecycle: {
    getInstanceKey: di => () => {
      expectType<string | undefined>(di.sourceNamespace);

      return di.sourceNamespace;
    },
  },
});

// given injectable, when unoverridden using injectionToken, typing is ok.
di.permitSideEffects(someInjectionToken);

// given injectable bunch, typing is ok
const someInjectableBunch = getInjectableBunch({
  someInjectable: {
    id: 'irrelevant',
    instantiate: (di: DiContainerForInjection, parameter: number) =>
      `some-instance-${parameter}`,
    lifecycle: lifecycleEnum.transient,
  },
});

expectType<{ someInjectable: Injectable<string, unknown, number> }>(
  someInjectableBunch,
);

expectType<{ keys: [1, 2, 3] }>(getKeyedSingletonCompositeKey(1, 2, 3));

// API 2.0

// given injectionToken with parameter using generics, and injectable implementing it, when injected, typing is ok
const someInjectionTokenWithGenerics = getInjectionToken2<
  <T>(someParameter: T) => { someProperty: T },
  <T>(someParameter: T) => { someProperty: T }[]
>({
  id: 'irrelevant',
});

const someInjectableUsingGenerics = getInjectable({
  id: 'irrelevant',

  instantiateFor:
    () =>
    <T>(param: T) => ({
      someProperty: param,
      someValueMoreSpecificThanToken: 'some-specific-value',
    }),

  injectionToken: someInjectionTokenWithGenerics,
  lifecycle: lifecycleEnum2.transient,
});

expectType<{ someProperty: 'some-string' }>(
  di.injectFor(someInjectionTokenWithGenerics)('some-string'),
);

expectType<{ someProperty: 42 }>(
  di.injectFor(someInjectionTokenWithGenerics)(42),
);

expectType<{
  someProperty: boolean;
  someValueMoreSpecificThanToken: string;
}>(di.injectFor(someInjectableUsingGenerics)(true));

expectType<{ someProperty: string }[]>(
  di.injectManyFor(someInjectionTokenWithGenerics)(String('some-string')),
);

expectType<{ someProperty: 42 }[]>(
  di.injectManyFor(someInjectionTokenWithGenerics)(42),
);

// given injectionToken with parameter using partial generics (ie. no kludge for injectMany), and injectable implementing it, when injected, typing is ok, but with lost generics
const someInjectionTokenWithPartialGenerics = getInjectionToken2<
  <T>(someParameter: T) => T
  // Note: missing this makes the generics partial.
  // <T>(someParameter: T) => T[],
>({
  id: 'irrelevant',
});

const someInjectableUsingTokenWithPartialGenerics = getInjectable({
  id: 'irrelevant',

  instantiateFor:
    () =>
    <T>(param: T) =>
      param,

  injectionToken: someInjectionTokenWithPartialGenerics,
  lifecycle: lifecycleEnum2.transient,
});

expectType<'some-string'>(
  di.injectFor(someInjectionTokenWithPartialGenerics)('some-string'),
);

expectType<42>(di.injectFor(someInjectionTokenWithPartialGenerics)(42));

expectType<unknown[]>(
  di.injectManyFor(someInjectionTokenWithPartialGenerics)(
    String('some-string'),
  ),
);

expectType<unknown[]>(
  di.injectManyFor(someInjectionTokenWithPartialGenerics)(42),
);

// given injectionTokens with contradicting templates, typing is not ok
expectError(
  getInjectionToken2<
    <T>(someParameter: T) => T,
    // Note: string instead of T is the contradiction
    <T>(someParameter: string) => T[]
  >({
    id: 'irrelevant',
  }),
);

expectError(
  getInjectionToken2<
    // Note: string instead of T is the contradiction
    <T>(someParameter: T) => string,
    <T>(someParameter: T) => T[]
  >({
    id: 'irrelevant',
  }),
);

expectError(
  getInjectionToken2<
    <T>(someParameter: T) => T,
    // Note: this not being array is the contradiction
    <T>(someParameter: T) => T
  >({
    id: 'irrelevant',
  }),
);

// given injectionToken with parameter using generics, and injectable implementing it but with wrongly typed instantiate, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      <T>(param: T) => ({
        someProperty: 'some-string-despite-what-param-is',
      }),

    injectionToken: someInjectionTokenWithGenerics,
    lifecycle: lifecycleEnum2.transient,
  }),
);

// given injectionToken with parameter without generics, and injectable implementing it, when injected, typing is ok
const someInjectionTokenWithNoGenerics = getInjectionToken2<
  (someParameter: string) => number
>({
  id: 'irrelevant',
});

const someInjectableNotUsingGenerics = getInjectable({
  id: 'irrelevant',

  instantiateFor: di => parameter => {
    expectType<DiContainerForInjection>(di);
    expectType<string>(parameter);

    return 42;
  },

  injectionToken: someInjectionTokenWithNoGenerics,
  lifecycle: lifecycleEnum2.transient,
});

expectType<number>(di.injectFor(someInjectableNotUsingGenerics)('some-string'));
expectError(di.injectFor(someInjectableNotUsingGenerics)(42));

expectType<number>(
  di.injectFor(someInjectionTokenWithNoGenerics)('some-string'),
);

expectError(di.injectFor(someInjectionTokenWithNoGenerics)(42));

expectType<number[]>(
  di.injectManyFor(someInjectionTokenWithNoGenerics)('some-string'),
);

// given injectionToken without parameter, and injectable implementing it, when injected, typing is ok
const someInjectionTokenWithNoParameter = getInjectionToken2<() => number>({
  id: 'irrelevant',
});

const someInjectableWithNoParameter = getInjectable({
  id: 'irrelevant',

  instantiateFor: di => () => {
    expectType<DiContainerForInjection>(di);

    return 42;
  },

  injectionToken: someInjectionTokenWithNoParameter,
  lifecycle: lifecycleEnum2.transient,
});

expectType<number>(di.injectFor(someInjectableWithNoParameter)());
expectError(di.injectFor(someInjectableWithNoParameter)(42));

expectType<number>(di.injectFor(someInjectionTokenWithNoParameter)());
expectError(di.injectFor(someInjectionTokenWithNoParameter)(42));

// given no injectionToken, and transient injectable with generics, when injected, typing is ok
const someTransientUsingGenericsButWithoutToken = getInjectable({
  id: 'irrelevant',

  instantiateFor:
    () =>
    <T>(parameter: T) =>
      parameter,
  lifecycle: lifecycleEnum2.transient,
});

expectType<string>(
  di.injectFor(someTransientUsingGenericsButWithoutToken)(
    String('some-string'),
  ),
);

// given no injectionToken, and keyedSingleton with generics, when injected, typing is ok
const someKeyedSingletonUsingGenericsButWithoutToken = getInjectable({
  id: 'irrelevant',

  instantiateFor:
    () =>
    <T extends string>(parameter: T) =>
      parameter,

  lifecycle: lifecycleEnum2.keyedSingleton({
    getInstanceKey: di => {
      expectType<DiContainerForInjection>(di);

      return <T extends string>(param: T) => 'some-key';
    },
  }),
});

expectType<string>(
  di.injectFor(someKeyedSingletonUsingGenericsButWithoutToken)(
    String('some-string'),
  ),
);

// given no injectionToken, and keyedSingleton with generics, when constraints of instantiationParameter for instantiation and getting of key contradict, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      // Note: string vs. boolean is the contradiction.
      <T extends string>(parameter: T) =>
        parameter,

    lifecycle: lifecycleEnum2.keyedSingleton({
      getInstanceKey:
        () =>
        // Note: string vs. boolean is the contradiction.
        <T extends boolean>(param: T) =>
          param,
    }),
  }),
);

// given injectionToken with constrained generics, and keyedSingleton with generics, when injected, typing is ok
const someInjectionTokenWithConstrainedGenerics = getInjectionToken2<
  <
    // Note: this is the constraint
    T extends string,
  >(
    someParameter: T,
  ) => T
>({
  id: 'irrelevant',
});

const someKeyedSingletonUsingGenericsButWithConstrainedToken = getInjectable({
  id: 'irrelevant',

  instantiateFor:
    () =>
    <T extends string>(parameter: T) =>
      parameter,

  lifecycle: lifecycleEnum2.keyedSingleton({
    getInstanceKey:
      () =>
      <T extends string>(param: T) =>
        'some-key',
  }),

  injectionToken: someInjectionTokenWithConstrainedGenerics,
});

expectType<string>(
  di.injectFor(someKeyedSingletonUsingGenericsButWithConstrainedToken)(
    String('some-string'),
  ),
);

expectError<string>(
  di.injectFor(someKeyedSingletonUsingGenericsButWithConstrainedToken)(42),
);

// given injectionToken with constrained generics, and keyedSingleton with generics, but constraint of instantiate contradicts, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      <
        // Note: boolean instead of string is the contradiction.
        T extends boolean,
      >(
        parameter: T,
      ) =>
        parameter,

    lifecycle: lifecycleEnum2.keyedSingleton({
      getInstanceKey:
        () =>
        <T extends string>(param: T) =>
          'some-key',
    }),

    injectionToken: someInjectionTokenWithConstrainedGenerics,
  }),
);

// given injectionToken with constrained generics, and keyedSingleton with generics, but constraint of getInstanceKey contradicts, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      <T extends string>(parameter: T) =>
        parameter,

    lifecycle: lifecycleEnum2({
      getInstanceKey:
        () =>
        <
          // Note: boolean instead of string is the contradiction.
          T extends boolean,
        >(
          param: T,
        ) =>
          'some-key',
    }),

    injectionToken: someInjectionTokenWithConstrainedGenerics,
  }),
);

// given no injectionToken, and keyedSingleton with generics, when constraints of instantiationParameter for instantiation and getting of key contradict, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      // Note: string vs. boolean is the contradiction.
      <T extends string>(parameter: T) =>
        parameter,

    lifecycle: lifecycleEnum2({
      getInstanceKey:
        () =>
        // Note: string vs. boolean is the contradiction.
        <T extends boolean>(param: T) =>
          param,
    }),
  }),
);

// given injectable with instantiation parameter, but default lifecycle of singleton having no support for parameters, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor: () => (parameter: string) => parameter,
  }),
);

// given injectable with instantiation parameter, but no lifecycle to justify it, typing is not ok
expectError(
  getInjectable({
    id: 'irrelevant',

    instantiateFor: () => (parameter: string) => parameter,

    lifecycle: lifecycleEnum2.singleton,
  }),
);

// given injectable with no instantiation parameter, and default lifecycle, typing is ok
const someInjectableWithDefaultLifecycle = getInjectable({
  id: 'irrelevant',

  instantiateFor: di => () => Number(42),
});

expectType<number>(di.injectFor(someInjectableWithDefaultLifecycle)());

// given injectable with no instantiation parameter, and lifecycle which could use the paramater but doesn't, typing is ok
const someInjectableChoosingNotToUseParamater = getInjectable({
  id: 'irrelevant',
  instantiateFor: () => () => Number(42),
  lifecycle: lifecycleEnum2.transient,
});

expectType<number>(di.injectFor(someInjectableChoosingNotToUseParamater)());

// given injectionToken with no generics, and keyedSingleton using it, when injected, typing is ok
const someKeyedSingletonUsingTokenWithNoGenerics = getInjectable({
  id: 'irrelevant',

  instantiateFor: () => parameter => {
    expectType<string>(parameter);

    return 42;
  },

  lifecycle: {
    // Todo: for some reason, wrapping this with lifecycleEnum2.keyedSingleton
    //  makes the type inference break. Solve.
    getInstanceKey: di => param => {
      expectType<DiContainerForInjection>(di);
      expectType<string>(param);

      return 'some-key';
    },
  },

  injectionToken: someInjectionTokenWithNoGenerics,
});

expectType<number>(
  di.injectFor(someKeyedSingletonUsingTokenWithNoGenerics)('some-string'),
);

expectError<string>(
  di.injectFor(someKeyedSingletonUsingGenericsButWithConstrainedToken)(42),
);

expectError<string>(
  di.injectFor(someKeyedSingletonUsingGenericsButWithConstrainedToken)(),
);

// given injectionToken with generics and multiple parameters, and keyedSingleton using it, when injected, typing is ok
const someInjectionTokenWithGenericsAndMultipleParameters = getInjectionToken2<
  <T, T2>(
    someParameter: T,
    someOtherParameter: T2,
  ) => { someValue: T; someOtherValue: T2 }
>({
  id: 'irrelevant',
});

const someKeyedSingletonUsingTokenWithGenericsAndMultipleParameters =
  getInjectable({
    id: 'irrelevant',

    instantiateFor:
      () =>
      <T, T2>(someParameter: T, someOtherParameter: T2) => ({
        someValue: someParameter,
        someOtherValue: someOtherParameter,
      }),

    lifecycle: {
      getInstanceKey:
        di =>
        <T>(param: T) => {
          expectType<DiContainerForInjection>(di);

          return 'some-key';
        },
    },

    injectionToken: someInjectionTokenWithGenericsAndMultipleParameters,
  });

expectType<{ someValue: string; someOtherValue: 42 }>(
  di.injectFor(someKeyedSingletonUsingTokenWithGenericsAndMultipleParameters)(
    'some-string',
    42,
  ),
);

expectError<string>(
  di.injectFor(someKeyedSingletonUsingTokenWithGenericsAndMultipleParameters)(
    'only-one-parameter',
  ),
);

expectError<string>(
  // no parameters
  di.injectFor(someKeyedSingletonUsingTokenWithGenericsAndMultipleParameters)(),
);

expectType<{ someValue: string; someOtherValue: 42 }>(
  di.injectFor(someInjectionTokenWithGenericsAndMultipleParameters)(
    'some-string',
    42,
  ),
);

expectError<string>(
  di.injectFor(someInjectionTokenWithGenericsAndMultipleParameters)(
    'only-one-parameter',
  ),
);

expectError<string>(
  // no parameters
  di.injectFor(someInjectionTokenWithGenericsAndMultipleParameters)(),
);

// API 1.5
// given keyedSingleton with non-factory instantiate, when injected using factory, typing is ok
const someKeyedSingletonUsingNoInstantiateFactory = getInjectable({
  id: 'irrelevant',

  instantiate: (di, param: string) => {
    expectType<DiContainerForInjection>(di);

    return 42;
  },

  lifecycle: {
    getInstanceKey: di => param => {
      expectType<DiContainerForInjection>(di);
      expectType<string>(param);

      return 'some-key';
    },
  },
});

expectType<number>(
  di.injectFor(someKeyedSingletonUsingNoInstantiateFactory)('some-string'),
);

expectError<number>(
  di.injectFor(someKeyedSingletonUsingNoInstantiateFactory)(
    'too',
    'many',
    'paramaters',
  ),
);

expectError<string>(
  // no parameters
  di.injectFor(someKeyedSingletonUsingNoInstantiateFactory)(),
);
