import { expectAssignable, expectError, expectNotType, expectType } from 'tsd';

import {
  createContainer,
  createInjectionTargetDecorator,
  createInstantiationTargetDecorator,
  DiContainer,
  DiContainerForInjection,
  getInjectable,
  getInjectableBunch,
  getInjectionToken,
  getKeyedSingletonCompositeKey,
  getSpecificInjectionToken,
  getTypedSpecifier,
  instancePurgeCallbackToken,
  Lifecycle,
  Injectable,
  InjectableBunch,
  injectionDecoratorToken,
  InjectionToken,
  Instantiate,
  instantiationDecoratorToken,
  isInjectable,
  isInjectableBunch,
  isInjectionToken,
  lifecycleEnum,
  SpecificInject,
  SpecificInjectionToken,
  InjectionInstanceWithMeta,
  TypedSpecifier,
  TypedSpecifierType,
  TypedSpecifierWithType,
  getAbstractInjectionToken2,
  AbstractInjectionToken2,
} from '.';

const di = createContainer('some-container');

type GetNumber = () => number;
const someGetNumberInjectionToken = getInjectionToken<GetNumber>({
  id: 'some-get-number-token',
});

// given injectable and decorator targeting a token, typing is ok
const decoratorForToken = getInjectable({
  id: 'decorator-for-token',

  instantiate: () =>
    createInstantiationTargetDecorator({
      target: someGetNumberInjectionToken,

      decorate: toBeDecorated => di => {
        expectType<Instantiate<GetNumber>>(toBeDecorated);

        const instance = toBeDecorated(di);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

const foo: unknown = 'number';

if (isInjectable(foo)) {
  expectType<Injectable<unknown, unknown, unknown>>(foo);
}

if (isInjectionToken(foo)) {
  expectType<InjectionToken<unknown, unknown>>(foo);
}

if (isInjectableBunch(foo)) {
  expectType<InjectableBunch<any>>(foo);
}

const x1: boolean = isInjectable(foo);
const x2: boolean = isInjectionToken(foo);

// given injectable without instantiation paramater and decorator targeting the injectable, typing is ok
const someInjectableToBeDecorated = getInjectable({
  id: 'some-injectable-to-be-decorated',
  instantiate: () => () => 42,
});

const decoratorForInjectable = getInjectable({
  id: 'decorator-for-injectable',

  instantiate: () =>
    createInstantiationTargetDecorator({
      target: someInjectableToBeDecorated,

      decorate: toBeDecorated => di => {
        expectType<Instantiate<() => 42>>(toBeDecorated);

        const instance = toBeDecorated(di);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

// given injectable with instantiation parameter and decorator targeting the injectable, typing is ok
const someParameterInjectableToBeDecorated = getInjectable({
  id: 'some-parameter-injectable-to-be-decorated',
  instantiate: (di, parameter: number) => `some-instance-${parameter}`,
  lifecycle: lifecycleEnum.transient,
});

expectType<Injectable<string, unknown, number>>(
  someParameterInjectableToBeDecorated,
);

const decoratorForParameterInjectable = getInjectable({
  id: 'decorator-for-parameter-injectable',

  instantiate: () =>
    createInstantiationTargetDecorator({
      target: someParameterInjectableToBeDecorated,

      decorate: toBeDecorated => (di, param) => {
        expectType<number>(param);
        expectType<Instantiate<string, number>>(toBeDecorated);

        const instance = toBeDecorated(di, param);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

const decoratorWithoutTargetInjectable = getInjectable({
  id: 'decorator-without-target',

  instantiate: () =>
    createInstantiationTargetDecorator({
      decorate: toBeDecorated => (di, param) => {
        expectType<unknown>(param);
        expectType<Instantiate<unknown, unknown>>(toBeDecorated);

        const instance = toBeDecorated(di, param);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

const decoratorForInjectionParameterInjectable = getInjectable({
  id: 'decorator-for-parameter-injectable',

  instantiate: () =>
    createInjectionTargetDecorator({
      decorate: injectionToBeDecorated => (key, param) => {
        expectType<SpecificInject<unknown, unknown>>(injectionToBeDecorated);
        expectType<
          | Injectable<unknown, unknown, unknown>
          | InjectionToken<unknown, unknown>
        >(key);
        expectType<unknown>(param);

        return injectionToBeDecorated(key, param);
      },
    }),

  injectionToken: injectionDecoratorToken,
});

type SomeKey<T, P> = TypedSpecifier<string, { value: T; param: P }>;

const somethingInjectionToken = getInjectionToken<
  unknown,
  unknown,
  <T, P>(id: SomeKey<T, P>) => SpecificInjectionToken<(item: T) => number, P>
>({
  id: 'something',
});

const injectableFor = <T, P>(id: SomeKey<T, P>, lifecycle: Lifecycle<P>) =>
  getInjectable({
    id: `something-for(${id})`,
    instantiate: (di, param) => {
      expectType<P>(param);

      return item => 10;
    },
    injectionToken: somethingInjectionToken.for(id),
    lifecycle,
  });

const decoratorForSpecificInjectionParameterInjectable = getInjectable({
  id: 'decorator-for-parameter-injectable',

  instantiate: () =>
    createInjectionTargetDecorator({
      decorate: injectionToBeDecorated => (key, param) => {
        expectType<SpecificInject<string, number>>(injectionToBeDecorated);
        expectType<
          Injectable<string, unknown, number> | InjectionToken<string, number>
        >(key);
        expectType<number>(param);

        return injectionToBeDecorated(key, param);
      },
      target: someParameterInjectableToBeDecorated,
    }),

  injectionToken: injectionDecoratorToken,
});

// given injectable with unspecified type for instantiation parameter, argument typing is OK
const someInjectableForTypingOfInstantiate = getInjectable({
  id: 'some-injectable',

  instantiate: (di, instantiationParameter) => {
    expectType<DiContainerForInjection>(di);
    expectType<void>(instantiationParameter);
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, instantiationParameter) => {
      expectType<DiContainer>(di);
      expectType<void>(instantiationParameter);
    },
  }),
});

const someInjectableWithMatchingInstantiationParameters = getInjectable({
  id: 'some-injectable',

  instantiate: (di, instantiationParameter) => {
    expectType<string>(instantiationParameter);
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, instantiationParameter: string) => {
      expectType<string>(instantiationParameter);
    },
  }),
});

// given injectable with mismatching types for instantiation parameter, typing is not OK
expectError(
  getInjectable({
    id: 'some-injectable',

    instantiate: (di, instantiationParameter: number) => {},

    lifecycle: lifecycleEnum.keyedSingleton({
      getInstanceKey: (di, instantiationParameter: string) =>
        instantiationParameter,
    }),
  }),
);

const someInjectableWithoutInstantiationParameter = getInjectable({
  id: 'some-injectable',
  instantiate: () => 'some string',
  lifecycle: lifecycleEnum.transient,
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

  instantiate: () => ({
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

// given injectable that is singleton, when used to inject a factory, typing is ok
expectType<() => string>(
  di.injectFactory(
    getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    }),
  ),
);

// given token without instantiation parameter, when used to inject a factory, typing is ok
expectType<() => number>(
  di.injectFactory(
    getInjectionToken<number>({
      id: 'some-token',
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

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: di => {
      expectType<string | undefined>(di.sourceNamespace);

      return di.sourceNamespace;
    },
  }),
});

// given injectable, when unoverridden using injectionToken, typing is ok.
di.permitSideEffects(someInjectionToken);

// when purging all but overrides, typing is ok.
di.purgeAllButOverrides();

// given injectable bunch, typing is ok
const someInjectableBunch = getInjectableBunch({
  someInjectable: getInjectable({
    id: 'some-injectable',

    instantiate: (di: DiContainerForInjection, parameter: number) =>
      `some-instance-${parameter}`,

    lifecycle: lifecycleEnum.transient,
  }),
});

expectType<{ someInjectable: Injectable<string, unknown, number> }>(
  someInjectableBunch,
);

// given injectable bunch with unrelated, non-injectable properties, typing is ok and still contains all properties
const bunchContent = {
  someCompletelyUnrelatedProperty: 'irrelevant',
};

const someInjectableBunch2 = getInjectableBunch(bunchContent);

expectType<typeof bunchContent>(someInjectableBunch2);

expectType<{ keys: [1, 2, 3] }>(getKeyedSingletonCompositeKey(1, 2, 3));

// given injectable, typing for "alias has registrations" is ok
expectType<boolean>(di.hasRegistrations(someInjectable));

// given token, typing for "alias has registrations" is ok
expectType<boolean>(di.hasRegistrations(someInjectionToken));

// given general injection token without generics, and a more specific token created by it, typing is ok
const someGeneralInjectionTokenWithoutGenerics = getInjectionToken<number>({
  id: 'some-general-token-without-generics',
});

expectAssignable<{
  id: string;
  for: (id: string) => SpecificInjectionToken<number>;
}>(someGeneralInjectionTokenWithoutGenerics);

const someSpecificInjectionTokenWithoutGenerics =
  someGeneralInjectionTokenWithoutGenerics.for('some-specific-token');

expectAssignable<{
  id: string;
  for: (id: string) => SpecificInjectionToken<number>;
}>(someSpecificInjectionTokenWithoutGenerics);

// given general injection token with generics, and a more specific token created by it, typing is ok
const someGeneralInjectionTokenWithGenerics = getInjectionToken<
  { someProperty: unknown },
  void,
  <Speciality>(
    speciality: Speciality,
  ) => SpecificInjectionToken<{ someProperty: Speciality }>
>({
  id: 'some-general-token',

  specificInjectionTokenFactory: <Speciality>(speciality: Speciality) =>
    getSpecificInjectionToken<{ someProperty: Speciality }>({
      id: 'some-specific-token',
      speciality,
    }),
});

expectType<
  InjectionToken<
    { someProperty: unknown },
    void,
    <Speciality>(
      speciality: Speciality,
    ) => SpecificInjectionToken<{ someProperty: Speciality }>
  >
>(someGeneralInjectionTokenWithGenerics);

const someSpecificInjectionToken = someGeneralInjectionTokenWithGenerics.for(
  'some-specific-token-as-string',
);

expectType<SpecificInjectionToken<{ someProperty: string }>>(
  someSpecificInjectionToken,
);

const someMoreSpecificInjectionToken = someSpecificInjectionToken.for(
  'some-more-specific-token-as-string',
);

expectType<SpecificInjectionToken<{ someProperty: string }>>(
  someMoreSpecificInjectionToken,
);

expectType<{ someProperty: string }>(
  di.inject(someGeneralInjectionTokenWithGenerics.for('some-string')),
);

expectType<{ someProperty: number }>(
  di.inject(someGeneralInjectionTokenWithGenerics.for(42)),
);

expectType<{ someProperty: number }>(
  di.inject(
    someGeneralInjectionTokenWithGenerics.for(42).for('some-deeper-speciality'),
  ),
);

// given general injection token with generics and instantiation parameter, and a more specific token created by it, typing is ok
const someGeneralInjectionTokenWithGenericsAndParameter = getInjectionToken<
  { someProperty: unknown },
  { someInstantiationParameter: unknown },
  <Speciality>(
    speciality: Speciality,
  ) => SpecificInjectionToken<
    { someProperty: Speciality },
    { someInstantiationParameter: Speciality }
  >
>({
  id: 'some-general-token',

  specificInjectionTokenFactory: <Speciality>(speciality: Speciality) =>
    getSpecificInjectionToken<
      { someProperty: Speciality },
      { someInstantiationParameter: Speciality }
    >({
      id: 'some-specific-token',
      speciality,
    }),
});

expectType<{ someProperty: number }>(
  di.inject(someGeneralInjectionTokenWithGenericsAndParameter.for(42), {
    someInstantiationParameter: 37,
  }),
);

expectType<{ someProperty: number }[]>(
  di.injectMany(someGeneralInjectionTokenWithGenericsAndParameter.for(42), {
    someInstantiationParameter: 37,
  }),
);

// given array of injectables and bunches, when registering, is ok
const someArrayOfInjectablesAndBunches = [someInjectable, someInjectableBunch];

expectType<void>(di.register(someInjectable));
expectType<void>(di.register(someInjectableBunch));
expectType<void>(di.register(someInjectable, someInjectableBunch));
expectType<void>(di.register(...someArrayOfInjectablesAndBunches));

// given array of injectables and bunches, when deregistering, is ok
expectType<void>(di.deregister(someInjectable));
expectType<void>(di.deregister(someInjectableBunch));
expectType<void>(di.deregister(someInjectable, someInjectableBunch));
expectType<void>(di.deregister(...someArrayOfInjectablesAndBunches));

const someInjectable1 = getInjectable({
  id: 'some-injectable',

  instantiate: di => {
    expectType<void>(di.register(someInjectable));
    expectType<void>(di.register(someInjectableBunch));
    expectType<void>(di.register(someInjectable, someInjectableBunch));
    expectType<void>(di.register(...someArrayOfInjectablesAndBunches));

    // given array of injectables and bunches, when deregistering, is ok
    expectType<void>(di.deregister(someInjectable));
    expectType<void>(di.deregister(someInjectableBunch));
    expectType<void>(di.deregister(someInjectable, someInjectableBunch));
    expectType<void>(di.deregister(...someArrayOfInjectablesAndBunches));
  },
});

// given general injection token and a typed specifier, typing is ok
const someGeneralTokenWithTypedSpecifier = getInjectionToken<
  // For general case, the arg is still unknown
  (arg: unknown) => boolean,
  void,
  <S extends TypedSpecifierWithType<'someTypeNameOfSpecifier'>>(
    specifier: S,
  ) => SpecificInjectionToken<
    (arg: TypedSpecifierType<'someTypeNameOfSpecifier', S>) => boolean
  >
>({
  id: 'some-general-token-with-typed-specifier',
});

const someTypedSpecifier = getTypedSpecifier<{
  someTypeNameOfSpecifier: string;
  someUnrelatedTypeName: boolean;
}>()('some-typed-specifier');

const actualTypedInstance = di.inject(
  someGeneralTokenWithTypedSpecifier.for(someTypedSpecifier),
);

expectType<(arg: string) => boolean>(actualTypedInstance);

// given injectable implementing general injection token with a typed specifier, typing is ok
getInjectable({
  id: 'some-injectable',

  instantiate: di => arg => {
    expectType<string>(arg);

    return true;
  },

  injectionToken: someGeneralTokenWithTypedSpecifier.for(someTypedSpecifier),
});

// given general injection token with a typed specifier, and a typed specifier for a non-matching type, typing is not ok
const someTypedSpecifierWithNonMatchingTypes = getTypedSpecifier<{
  someNonMatchingTypeNameOfSpecifier: string;
}>()('some-non-matching-typed-specifier');

expectError(
  someGeneralTokenWithTypedSpecifier.for(
    someTypedSpecifierWithNonMatchingTypes,
  ),
);

// given general injection token and with contradictory typed specifier, typing is not ok
expectError(
  getInjectionToken<
    unknown,
    void,
    <S extends TypedSpecifierWithType<'someTypeNameOfSpecifier'>>(
      specifier: S,
    ) => SpecificInjectionToken<
      (
        arg: TypedSpecifierType<'someContradictoryTypeNameOfSpecifier', S>,
      ) => boolean
    >
  >({
    id: 'some-general-token-with-contradictory-typed-specifier',
  }),
);

// given general injection token and with contradictory typed specifier for return type, typing is not ok
expectError(
  getInjectionToken<
    (arg: unknown) => boolean,
    void,
    <S extends TypedSpecifierWithType<'someTypeNameOfSpecifier'>>(
      specifier: S,
    ) => SpecificInjectionToken<
      (arg: TypedSpecifierType<'someTypeNameOfSpecifier', S>) => string
    >
  >({
    id: 'some-general-token-with-contradictory-typed-specifier-for-return-type',
  }),
);

// given general injection token and with typed specifier that is more specific, when injected, typing is ok
const tokenWithMoreSpecificInstance = getInjectionToken<
  (arg: unknown) => boolean | string,
  void,
  <S extends TypedSpecifierWithType<'someTypeNameOfSpecifier'>>(
    specifier: S,
  ) => SpecificInjectionToken<
    // Note: just string is more specific than boolean | string
    (arg: TypedSpecifierType<'someTypeNameOfSpecifier', S>) => string
  >
>({
  id: 'some-general-token-with-contradictory-typed-specifier-for-return-type',
});

const actualSpecificInstance = di.inject(
  tokenWithMoreSpecificInstance.for(someTypedSpecifier),
);

expectType<(arg: string) => string>(actualSpecificInstance);

// Todo: this is broken and needs to be fixed!
// Given general injection token with a typed specifier, when injected without specifier, typing is ok
// const minimalTokenWithSpecifics = getInjectionToken<
//   (arg: unknown) => boolean,
//   void,
//   (specifier: string) => SpecificInjectionToken<(arg: number) => boolean>
// >({
//   id: 'some-general-token-with-typed-specifier',
// });
//
// expectType<(arg: unknown) => boolean>(di.inject(minimalTokenWithSpecifics));

const someInjectableForHasRegistrations = getInjectable({
  id: 'irrelevant',

  instantiate: di => {
    // given injectable, typing for "alias has registrations" is ok
    expectType<boolean>(di.hasRegistrations(someInjectable));

    // given token, typing for "alias has registrations" is ok
    expectType<boolean>(di.hasRegistrations(someInjectionToken));
  },
});

const typedSpecifier =
  getTypedSpecifier<{ someSpeciality: 'some-type' }>()('irrelevant');

// given typed specifier, TypedSpecifier is compatible with "extends" and type inference
expectAssignable<TypedSpecifier<string, { someSpeciality: 'some-type' }>>(
  typedSpecifier,
);

// given typed specifier, TypedSpecifierWithType is compatible with "extends" and type inference
expectAssignable<TypedSpecifierWithType<'someSpeciality', 'some-type'>>(
  typedSpecifier,
);

// given some factory that produces injectables with some generic lifecycle it works and typing is okay
const someInjectableFactory = <P>(id: string, lifecycle: Lifecycle<P>) =>
  getInjectable({
    id,
    instantiate: () => 10,
    lifecycle,
  });

// ======================================================================
// Injectable2 / InjectionToken2 type tests
// ======================================================================

import {
  getInjectable2,
  getInjectionToken2,
  getSpecificInjectionToken2,
  Injectable2,
  InjectionToken2,
  SpecificInjectionToken2,
  DiContainerForInjection2,
} from '.';

// --- getInjectable2: non-parametric singleton ---

const nonParametricInjectable2 = getInjectable2({
  id: 'non-parametric',
  instantiate: () => () => 42 as number,
});

expectType<Injectable2<() => number>>(nonParametricInjectable2);

// public di.inject returns instance (factory called internally)
expectType<number>(di.inject(nonParametricInjectable2));

// --- getInjectable2: parametric keyed singleton ---

const parametricInjectable2 = getInjectable2({
  id: 'parametric',
  instantiate: () => (name: string, age: number) => ({ name, age }),
});

expectType<
  Injectable2<(name: string, age: number) => { name: string; age: number }>
>(parametricInjectable2);

// public di.inject with correct params returns instance
expectType<{ name: string; age: number }>(
  di.inject(parametricInjectable2, 'Alice', 30),
);

// wrong number of args is a type error
expectError(di.inject(parametricInjectable2, 'Alice'));
expectError(di.inject(parametricInjectable2));
expectError(di.inject(parametricInjectable2, 'Alice', 30, 'extra'));

// wrong arg type is a type error
expectError(di.inject(parametricInjectable2, 42, 30));

// --- getInjectable2: transient ---

const transientInjectable2 = getInjectable2({
  id: 'transient',
  instantiate: () => () => new Date(),
  transient: true,
});

expectType<Date>(di.inject(transientInjectable2));

// --- getInjectable2: instance is a function (wrapped in zero-arg factory) ---

const functionInstanceInjectable2 = getInjectable2({
  id: 'doubler',
  instantiate: () => () => (x: number) => x * 2,
});

expectType<(x: number) => number>(di.inject(functionInstanceInjectable2));

// --- InjectionToken2: non-parametric ---

const handlerToken2 = getInjectionToken2<() => string>({ id: 'handler' });

expectType<InjectionToken2<() => string>>(handlerToken2);

// public di.inject returns instance
expectType<string>(di.inject(handlerToken2));

// public di.injectMany returns instance array
expectType<string[]>(di.injectMany(handlerToken2));

// --- InjectionToken2: parametric ---

const userServiceToken2 = getInjectionToken2<
  (userId: string) => { id: string }
>({
  id: 'user-service',
});

expectType<{ id: string }>(di.inject(userServiceToken2, 'user-123'));
expectType<{ id: string }[]>(di.injectMany(userServiceToken2, 'user-123'));

// wrong args are type errors
expectError(di.inject(userServiceToken2));
expectError(di.inject(userServiceToken2, 42));

// --- InjectionToken2: ManyFactory auto-derived for non-generic ---

// For non-generic, ManyFactory is auto-derived: (() => string) becomes (() => string[])
const autoManyToken = getInjectionToken2<(x: number) => string>({
  id: 'auto-many',
});

// --- InjectionToken2: explicit ManyFactory for generic ---

type WrapperFactory = <T>(value: T) => { wrapped: T };
type WrapperManyFactory = <T>(value: T) => { wrapped: T }[];

const wrapperToken2 = getInjectionToken2<WrapperFactory, WrapperManyFactory>({
  id: 'wrapper',
});

// --- InjectionToken2: ManyFactory constraint prevents disagreement ---

expectError(
  getInjectionToken2<
    (x: string) => number,
    (x: number) => number[] // Error: number param doesn't match string param
  >({ id: 'bad-many' }),
);

// --- InjectionToken2: implementing with getInjectable2 ---

const handlerImpl = getInjectable2({
  id: 'handler-impl',
  injectionToken: handlerToken2,
  instantiate: () => () => 'hello',
});

// --- DiContainerForInjection2: inject returns factories inside new-style instantiate ---

const innerInjectable2 = getInjectable2({
  id: 'inner',
  instantiate: (di: DiContainerForInjection2) => {
    // new-style injectable2 → returns factory directly
    const getParametric = di.inject(parametricInjectable2);
    expectType<(name: string, age: number) => { name: string; age: number }>(
      getParametric,
    );

    // new-style token2 → returns factory directly
    const getHandler = di.inject(handlerToken2);
    expectType<() => string>(getHandler);

    // old-style injectable without param → wrapped in () => I factory
    const getOldSingleton = di.inject(someInjectableToBeDecorated);
    expectType<() => () => 42>(getOldSingleton);

    // old-style injectable with param → wrapped in (param: P) => I factory
    const getOldParam = di.inject(someParameterInjectableToBeDecorated);
    expectType<(param: number) => string>(getOldParam);

    // old-style token without param → wrapped in () => I factory
    const getOldTokenValue = di.inject(someGetNumberInjectionToken);
    expectType<() => GetNumber>(getOldTokenValue);

    return () => 'result';
  },
});

// --- DiContainerForInjection2: injectMany returns ManyFactory inside new-style ---

const innerWithInjectMany = getInjectable2({
  id: 'inner-many',
  instantiate: (di: DiContainerForInjection2) => {
    // token2 → returns ManyFactory
    const getHandlers = di.injectMany(handlerToken2);
    expectType<() => string[]>(getHandlers);

    // token2 with explicit ManyFactory → returns the explicit ManyFactory
    const getWrappers = di.injectMany(wrapperToken2);
    expectType<WrapperManyFactory>(getWrappers);

    // old-style token without param → returns () => I[]
    const getOldMany = di.injectMany(someGetNumberInjectionToken);
    expectType<() => GetNumber[]>(getOldMany);

    return () => 'result';
  },
});

// --- DiContainerForInjection2: hasRegistrations ---

const innerWithHasRegistrations = getInjectable2({
  id: 'inner-has-reg',
  instantiate: (di: DiContainerForInjection2) => {
    expectType<boolean>(di.hasRegistrations(parametricInjectable2));
    expectType<boolean>(di.hasRegistrations(handlerToken2));
    expectType<boolean>(di.hasRegistrations(someInjectable));
    expectType<boolean>(di.hasRegistrations(someInjectionToken));

    return () => {};
  },
});

// --- register/deregister accept both old and new ---

expectType<void>(di.register(nonParametricInjectable2));
expectType<void>(di.register(nonParametricInjectable2, someInjectable));
expectType<void>(di.deregister(nonParametricInjectable2));

// --- SpecificInjectionToken2 with typed specifiers ---

const generalToken2WithSpecifier = getInjectionToken2<
  (arg: unknown) => boolean,
  (arg: unknown) => boolean[],
  <S extends TypedSpecifierWithType<'someType'>>(
    specifier: S,
  ) => SpecificInjectionToken2<
    (arg: TypedSpecifierType<'someType', S>) => boolean,
    (arg: TypedSpecifierType<'someType', S>) => boolean[]
  >
>({
  id: 'general-token2-with-specifier',
});

const someTypedSpecifier2 = getTypedSpecifier<{
  someType: string;
}>()('some-specifier');

const specificToken2 = generalToken2WithSpecifier.for(someTypedSpecifier2);

// public inject with specific token returns instance
expectType<boolean>(di.inject(specificToken2, 'hello'));

// public injectMany returns instance array
expectType<boolean[]>(di.injectMany(specificToken2, 'hello'));

// wrong arg type is a type error
expectError(di.inject(specificToken2, 42));

// --- WithMeta variants: work for non-generic, lose generics for generic tokens ---

// Non-generic: injectWithMeta returns correctly typed meta wrapper
expectType<InjectionInstanceWithMeta<number>>(
  di.injectWithMeta(nonParametricInjectable2),
);
expectType<InjectionInstanceWithMeta<{ name: string; age: number }>>(
  di.injectWithMeta(parametricInjectable2, 'Alice', 30),
);

// Non-generic token: injectManyWithMeta returns correctly typed meta wrapper array
expectType<InjectionInstanceWithMeta<string>[]>(
  di.injectManyWithMeta(handlerToken2),
);

// Non-generic token with params: injectManyWithMeta works
expectType<InjectionInstanceWithMeta<{ id: string }>[]>(
  di.injectManyWithMeta(userServiceToken2, 'user-123'),
);

// Inside new-style: injectWithMeta for non-generic returns factory for meta wrapper
const innerWithMeta = getInjectable2({
  id: 'inner-with-meta',
  instantiate: (di: DiContainerForInjection2) => {
    const getHandlerMeta = di.injectWithMeta(handlerToken2);
    expectType<() => InjectionInstanceWithMeta<string>>(getHandlerMeta);

    const getHandlersMeta = di.injectManyWithMeta(handlerToken2);
    expectType<() => InjectionInstanceWithMeta<string>[]>(getHandlersMeta);

    return () => {};
  },
});

// Known limitation: generic tokens lose type info in WithMeta variants.
// Use non-meta inject/injectMany for generic types instead.

// --- Purge typing ---

// purge with no args (purge entire branch)
di.purge();

// purge non-parametric injectable2 (no key parts)
di.purge(nonParametricInjectable2);

// purge non-parametric injectable2 with key parts is a type error
expectError(di.purge(nonParametricInjectable2, 'extra'));

// purge parametric injectable2 with correct key parts
di.purge(parametricInjectable2, 'Alice', 30);

// purge parametric injectable2 with partial key (prefix purge)
di.purge(parametricInjectable2, 'Alice');

// purge parametric injectable2 with no key (purge all instances)
di.purge(parametricInjectable2);

// purge parametric injectable2 with wrong key type is a type error
expectError(di.purge(parametricInjectable2, 42, 30));

// purge parametric injectable2 with too many key parts is a type error
expectError(di.purge(parametricInjectable2, 'Alice', 30, 'extra'));

// purge parametric token2 with correct key parts
di.purge(userServiceToken2, 'user-123');

// purge parametric token2 with no key (purge all)
di.purge(userServiceToken2);

// purge parametric token2 with wrong key type is a type error
expectError(di.purge(userServiceToken2, 42));

// purge non-parametric token2 (no key parts)
di.purge(handlerToken2);

// purge non-parametric token2 with key parts is a type error
expectError(di.purge(handlerToken2, 'extra'));

// purge old-style injectable with matching param
di.purge(someInjectableWithMatchingInstantiationParameters, 'some-key');

// purge old-style injectable with no key (purge all)
di.purge(someInjectableWithMatchingInstantiationParameters);

// purge old-style injectable without instantiation parameter (no key parts)
di.purge(someInjectableWithoutInstantiationParameter);

// purge old-style injectable without instantiation parameter with key is a type error
expectError(di.purge(someInjectableWithoutInstantiationParameter, 'extra'));

// --- Override typing for injectable2 / token2 ---

// non-parametric injectable2: matching curried stub is OK
expectType<void>(di.override(nonParametricInjectable2, () => () => 42));

// non-parametric injectable2: wrong return type is a type error
expectError(di.override(nonParametricInjectable2, () => () => 'not-a-number'));

// parametric injectable2: matching curried stub is OK
expectType<void>(
  di.override(parametricInjectable2, () => (name, age) => ({ name, age })),
);

// parametric injectable2: stub params are typed from the factory signature
di.override(parametricInjectable2, () => (name, age) => {
  expectType<string>(name);
  expectType<number>(age);
  return { name, age };
});

// parametric injectable2: wrong arg type is a type error
expectError(
  di.override(parametricInjectable2, () => (name: number, age) => ({
    name: String(name),
    age,
  })),
);

// parametric injectable2: wrong return type is a type error
expectError(
  di.override(parametricInjectable2, () => (name, age) => ({
    name,
    age: String(age),
  })),
);

// injectable2: stub receives DiContainerForInjection2 (inject returns factories)
di.override(parametricInjectable2, di => {
  const getHandler = di.inject(handlerToken2);
  expectType<() => string>(getHandler);
  return (name, age) => ({ name, age });
});

// non-parametric token2: matching stub is OK
expectType<void>(di.override(handlerToken2, () => () => 'hello'));

// non-parametric token2: wrong return type is a type error
expectError(di.override(handlerToken2, () => () => 42));

// parametric token2: matching stub is OK
expectType<void>(
  di.override(userServiceToken2, () => userId => ({ id: userId })),
);

// parametric token2: wrong arg type is a type error
expectError(
  di.override(userServiceToken2, () => (userId: number) => ({
    id: String(userId),
  })),
);

// parametric token2: wrong return shape is a type error
expectError(di.override(userServiceToken2, () => userId => ({ userId })));

// earlyOverride carries the same injectable2 typing
expectType<void>(
  di.earlyOverride(parametricInjectable2, () => (name, age) => ({ name, age })),
);
expectError(
  di.earlyOverride(parametricInjectable2, () => (name, age) => ({
    name,
    age: String(age),
  })),
);

// curried stub preserves generics: wrapperToken2's factory is <T>(value: T) => { wrapped: T },
// and the override stub must itself return a function retaining that generic — something
// the old flat shape could not express because Parameters<F> collapsed T to unknown.
expectType<void>(
  di.override(wrapperToken2, () => <T>(value: T) => ({ wrapped: value })),
);

// inside the generic inner arrow, `value` is a free T — so string-only operations fail.
// this would not error under the old flat shape, where `value` had already been widened to unknown.
expectError(
  di.override(wrapperToken2, () => <T>(value: T) => ({
    wrapped: value.toUpperCase(),
  })),
);

// monomorphized inner arrow with a contradictory return shape fails the generic contract
expectError(
  di.override(wrapperToken2, () => (value: string) => ({
    wrapped: 42,
  })),
);

// --- Combined: typed specifier of InjectionToken2 + generic injectable2 factory ---

// A general token whose `.for(specifier)` monomorphizes a `brand` dimension from the
// specifier's type while the factory itself stays generic in `T`.
const generalBrandedWrapperToken2 = getInjectionToken2<
  <T>(value: T) => { wrapped: T; brand: unknown },
  <T>(value: T) => { wrapped: T; brand: unknown }[],
  <S extends TypedSpecifierWithType<'brand'>>(
    specifier: S,
  ) => SpecificInjectionToken2<
    <T>(value: T) => { wrapped: T; brand: TypedSpecifierType<'brand', S> },
    <T>(value: T) => { wrapped: T; brand: TypedSpecifierType<'brand', S> }[]
  >
>({ id: 'general-branded-wrapper' });

const primaryBrandSpecifier = getTypedSpecifier<{ brand: 'primary' }>()(
  'primary-brand',
);

const primaryWrapperToken =
  generalBrandedWrapperToken2.for(primaryBrandSpecifier);

// `.for(specifier)` yields a token whose factory has `brand` pinned to 'primary'
// while `T` remains free.
expectAssignable<
  SpecificInjectionToken2<<T>(value: T) => { wrapped: T; brand: 'primary' }>
>(primaryWrapperToken);

// An injectable2 implementing the specific token must honor both: the
// specifier's `brand: 'primary'` AND the factory's free `T`.
getInjectable2({
  id: 'primary-wrapper-impl',
  injectionToken: primaryWrapperToken,
  instantiate:
    () =>
    <T>(value: T) => ({
      wrapped: value,
      brand: 'primary' as const,
    }),
});

// Wrong brand violates the specifier-fixed type
expectError(
  getInjectable2({
    id: 'bad-brand-wrapper-impl',
    injectionToken: primaryWrapperToken,
    instantiate:
      () =>
      <T>(value: T) => ({
        wrapped: value,
        brand: 'secondary' as const,
      }),
  }),
);

// Override of the specifier-produced token preserves both brand and `T`
expectType<void>(
  di.override(
    primaryWrapperToken,
    () =>
      <T>(value: T) => ({
        wrapped: value,
        brand: 'primary' as const,
      }),
  ),
);

// Override with the wrong brand fails the specifier-fixed type
expectError(
  di.override(
    primaryWrapperToken,
    () =>
      <T>(value: T) => ({
        wrapped: value,
        brand: 'secondary' as const,
      }),
  ),
);

// unoverride accepts injectable2 and token2
di.unoverride(nonParametricInjectable2);
di.unoverride(parametricInjectable2);
di.unoverride(handlerToken2);
di.unoverride(userServiceToken2);

// ======================================================================
// instancePurgeCallbackToken type tests
// ======================================================================

// --- old-style targets are rejected at type level ---

const someOldStyleInjectableForPurge = getInjectable({
  id: 'some-old-style-for-purge',
  instantiate: () => 'irrelevant',
});

expectError(instancePurgeCallbackToken.for(someOldStyleInjectableForPurge));

const someOldStyleTokenForPurge = getInjectionToken<boolean, number>({
  id: 'some-old-style-token-for-purge',
});

expectError(instancePurgeCallbackToken.for(someOldStyleTokenForPurge));

// --- injectable2 target: curried callback, instance from ReturnType<F> ---

getInjectable2({
  id: 'purge-callback-for-parametric-2',
  injectionToken: instancePurgeCallbackToken.for(parametricInjectable2),
  instantiate: () => () => ({ instance }) => (name, age) => {
    expectType<{ name: string; age: number }>(instance);
    expectType<string>(name);
    expectType<number>(age);
    return { name, age };
  },
});

// Wrong inner arrow arg type → type error
expectError(
  getInjectable2({
    id: 'purge-callback-wrong-arg',
    injectionToken: instancePurgeCallbackToken.for(parametricInjectable2),
    instantiate:
      () => () =>
      ({ instance }) =>
      (name: number, age) => ({
        name: String(name),
        age,
      }),
  }),
);

// Wrong inner arrow return shape → type error
expectError(
  getInjectable2({
    id: 'purge-callback-wrong-return',
    injectionToken: instancePurgeCallbackToken.for(parametricInjectable2),
    instantiate: () => () => ({ instance }) => (name, age) => ({
      name,
      age: String(age),
    }),
  }),
);

// Non-parametric injectable2: inner arrow takes no args
getInjectable2({
  id: 'purge-callback-for-nonparametric-2',
  injectionToken: instancePurgeCallbackToken.for(nonParametricInjectable2),
  instantiate: () => () => ({ instance }) => () => {
    expectType<number>(instance);
    return 0;
  },
});

// --- injectable2 target: injection token2 ---

getInjectable2({
  id: 'purge-callback-for-user-service-token-2',
  injectionToken: instancePurgeCallbackToken.for(userServiceToken2),
  instantiate: () => () => ({ instance }) => userId => {
    expectType<{ id: string }>(instance);
    expectType<string>(userId);
    return { id: userId };
  },
});

// --- generic factory target preserves T on the inner arrow ---

getInjectable2({
  id: 'purge-callback-for-wrapper-token',
  injectionToken: instancePurgeCallbackToken.for(wrapperToken2),
  instantiate:
    () => () =>
    ({ instance }) =>
    <T>(value: T) => ({ wrapped: value }),
});

// Inside the generic inner arrow, value stays T — string-only ops fail
expectError(
  getInjectable2({
    id: 'purge-callback-wrapper-bad-t',
    injectionToken: instancePurgeCallbackToken.for(wrapperToken2),
    instantiate:
      () => () =>
      ({ instance }) =>
      <T>(value: T) => ({ wrapped: value.toUpperCase() }),
  }),
);

// --- abstract base is not directly injectable/registrable ---

// direct inject of the abstract base is a type error
expectError(di.inject(instancePurgeCallbackToken));

// registering a callback against the abstract base (not .for(target)) is a type error
expectError(
  getInjectable2({
    id: 'bad-direct-registration',
    injectionToken: instancePurgeCallbackToken,
    instantiate: () => () => undefined,
  }),
);

// ---- AbstractInjectionToken2 ----

const abstractHandlerToken = getAbstractInjectionToken2<(name: string) => void>({
  id: 'abstract-handler',
});

// abstract token has correct type
expectType<AbstractInjectionToken2<(name: string) => void>>(abstractHandlerToken);

// .for() returns a non-abstract SpecificInjectionToken2
const specificFromAbstract = abstractHandlerToken.for('click');

// injecting specific token derived from abstract is OK
di.inject(specificFromAbstract, 'test');

// injecting abstract token directly is a TYPE ERROR
expectError(di.inject(abstractHandlerToken, 'test'));

// injectMany on abstract token is a TYPE ERROR
expectError(di.injectMany(abstractHandlerToken, 'test'));

// injectWithMeta on abstract token is a TYPE ERROR
expectError(di.injectWithMeta(abstractHandlerToken, 'test'));

// injectManyWithMeta on abstract token is a TYPE ERROR
expectError(di.injectManyWithMeta(abstractHandlerToken, 'test'));

// implementing abstract token directly is a TYPE ERROR
expectError(getInjectable2({
  id: 'bad-impl',
  injectionToken: abstractHandlerToken,
  instantiate: () => (name: string) => {},
}));

// implementing specific token from abstract is OK
getInjectable2({
  id: 'good-impl',
  injectionToken: specificFromAbstract,
  instantiate: () => (name: string) => {},
});
