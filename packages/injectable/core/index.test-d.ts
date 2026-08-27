import { expectAssignable, expectError, expectNotType, expectType } from 'tsd';
import {
  createContainer,
  DiContainer,
  DiContainerForInjection,
  getInjectable,
  getInjectableBunch,
  getInjectionToken,
  getKeyedSingletonCompositeKey,
  injectionTokenTag,
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
} from '.';

const di = createContainer('some-container');

type GetNumber = () => number;
const someGetNumberInjectionToken = getInjectionToken<GetNumber>({
  id: 'some-get-number-token',
});

const foo: unknown = 'number';

if (isInjectable(foo)) {
  expectType<Injectable<unknown, unknown, unknown>>(foo);
}

if (isInjectionToken(foo)) {
  expectType<InjectionToken<unknown, unknown>>(foo);
}

if (isInjectableBunch(foo)) {
  expectType<InjectableBunch>(foo);
}

const x1: boolean = isInjectable(foo);
const x2: boolean = isInjectionToken(foo);

const someInjectableToBeDecorated = getInjectable({
  id: 'some-injectable-to-be-decorated',
  instantiate: () => () => 42,
});

const someParameterInjectableToBeDecorated = getInjectable({
  id: 'some-parameter-injectable-to-be-decorated',
  instantiate: (di, parameter: number) => `some-instance-${parameter}`,
  lifecycle: lifecycleEnum.transient,
});

expectType<Injectable<string, unknown, number>>(
  someParameterInjectableToBeDecorated,
);

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

// given injectable, typing for "number of registrations for alias" is ok
expectType<number>(di.getNumberOfRegistrations(someInjectable));

// given token, typing for "number of registrations for alias" is ok
expectType<number>(di.getNumberOfRegistrations(someInjectionToken));

// given injectable, typing for "alias registered in local scope" is ok
expectType<boolean>(di.registeredInLocalScope(someInjectable));

// given token, typing for "alias registered in local scope" is ok
expectType<boolean>(di.registeredInLocalScope(someInjectionToken));

// given injectable, typing for "alias registered in local scope subtree" is ok
expectType<boolean>(di.registeredInLocalScopeSubtree(someInjectable));

// given token, typing for "alias registered in local scope subtree" is ok
expectType<boolean>(di.registeredInLocalScopeSubtree(someInjectionToken));

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

const typedSpecifier = getTypedSpecifier<{ someSpeciality: 'some-type' }>()(
  'irrelevant',
);

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
  SingleInjectionToken2,
  Consumption,
  ConsumptionDi,
  ValidationReport,
  UnverifiableConsumption,
  MaybeInjectionToken2,
  ManyInjectionToken2,
  NonEmptyManyInjectionToken2,
  Cardinality,
  MaybeResultFactory,
  NonEmptyManyFactory,
  Injectable2,
  InjectionToken2,
  SpecificInjectionToken2,
  DiContainerForInjection2,
  AnyConsumptionFactory,
} from '.';

// Shared default `.for(id)` factory, for tests that need a token with a
// real, working `.for()` — a token built with no factory at all now has no
// `.for` in its type, so tests that exercise `.for()` chaining must give one
// explicitly. Matches `getInjectionToken2`'s speciality-carrying overload's
// own leaf shape — no further `.for()` of its own.
const idBasedSpecificToken2 = <
  F extends (...args: any[]) => any,
  MF extends AnyConsumptionFactory<F>,
  C extends Cardinality,
>() => null as any as (id: string) => SpecificInjectionToken2<F, MF, undefined, C>;

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

// A token's cardinality decides which consumption API accepts it, so a token
// consumed both singly and as a group is two tokens.
const handlerToken2 = getInjectionToken2<() => string>({
  id: 'handler',
  cardinality: 'one',
})();

const handlerManyToken2 = getInjectionToken2<() => string>({
  id: 'handler-many',
  cardinality: 'zero-or-many',
})();

// The bare annotation means "a token of some cardinality", so a declared token
// is assignable to it but not identical to it.
expectAssignable<InjectionToken2<() => string>>(handlerToken2);
expectAssignable<SingleInjectionToken2<() => string>>(handlerToken2);
expectAssignable<ManyInjectionToken2<() => string>>(handlerManyToken2);

// public di.inject returns instance
expectType<string>(di.inject(handlerToken2));

// public di.injectMany returns instance array
expectType<string[]>(di.injectMany(handlerManyToken2));

// each token is rejected by the other's consumption API
expectError(di.injectMany(handlerToken2));
expectError(di.inject(handlerManyToken2));

// --- InjectionToken2: parametric ---

const userServiceToken2 = getInjectionToken2<
  (userId: string) => { id: string }
>({
  id: 'user-service',
  cardinality: 'one',
})();

const userServiceManyToken2 = getInjectionToken2<
  (userId: string) => { id: string }
>({
  id: 'user-service-many',
  cardinality: 'zero-or-many',
})();

expectType<{ id: string }>(di.inject(userServiceToken2, 'user-123'));
expectType<{ id: string }[]>(di.injectMany(userServiceManyToken2, 'user-123'));

// wrong args are type errors
expectError(di.inject(userServiceToken2));
expectError(di.inject(userServiceToken2, 42));

// --- InjectionToken2: ManyFactory auto-derived for non-generic ---

// For non-generic, ManyFactory is auto-derived: (() => string) becomes (() => string[])
const autoManyToken = getInjectionToken2<(x: number) => string>({
  cardinality: 'zero-or-many',
  id: 'auto-many',
})();

// --- InjectionToken2: explicit ManyFactory for generic ---

type WrapperFactory = <T>(value: T) => { wrapped: T };
type WrapperManyFactory = <T>(value: T) => { wrapped: T }[];

const wrapperToken2 = getInjectionToken2<WrapperFactory, WrapperManyFactory>({
  cardinality: 'zero-or-many',
  id: 'wrapper',
})();

// --- InjectionToken2: ManyFactory constraint prevents disagreement ---

expectError(
  getInjectionToken2<
    (x: string) => number,
    (x: number) => number[] // Error: number param doesn't match string param
  >({
    id: 'bad-many',
    cardinality: 'zero-or-many',
  })(),
);

// --- InjectionToken2: implementing with getInjectable2 ---

const handlerImpl = getInjectable2({
  id: 'handler-impl',
  injectionToken: handlerToken2,
  instantiate: () => () => 'hello',
});

// --- getInjectable2: injectionToken accepts a narrower implementation ---

// Repro for the inference defect where TS used to reject a wider
// injectionToken against an inline factory literal of narrower shape. The
// implementation must keep its narrow F (so direct-injectable injection
// returns the narrow factory) while the token's wider contract is enforced.

interface BroadComponent {
  (): unknown;
}

interface NarrowComponent extends BroadComponent {
  readonly __narrow: 'narrow';
}

interface Item {
  Component: BroadComponent;
  orderNumber: number;
}

const itemToken2 = getInjectionToken2<() => Item>({
  id: 'item',
  cardinality: 'one',
})();

declare const myNarrowComponent: NarrowComponent;

const myItemImpl = getInjectable2({
  id: 'my-item',
  injectionToken: itemToken2,
  instantiate: () => () => ({
    Component: myNarrowComponent,
    orderNumber: 50,
  }),
});

// Direct-injectable injection preserves the narrower factory return shape.
expectType<NarrowComponent>(di.inject2(myItemImpl)().Component);

// Token injection returns the wider contract.
expectType<BroadComponent>(di.inject2(itemToken2)().Component);

// A factory genuinely incompatible with the token is still a type error.
expectError(
  getInjectable2({
    id: 'wrong-shape',
    injectionToken: itemToken2,
    instantiate: () => () => ({ wrong: true }),
  }),
);

// --- getInjectable (v1): same narrow-vs-wide behavior at inject sites ---

// Same Item / NarrowComponent / BroadComponent fixtures, v1 API: the token's
// generic is the instance type (not a factory) and `di.inject` returns the
// instance directly.

const itemToken1 = getInjectionToken<Item>({ id: 'item-1' });

const myItemImpl1 = getInjectable({
  id: 'my-item-1',
  injectionToken: itemToken1,
  instantiate: () => ({
    Component: myNarrowComponent,
    orderNumber: 50,
  }),
});

// Direct-injectable injection preserves the narrower instance shape.
expectType<NarrowComponent>(di.inject(myItemImpl1).Component);

// Token injection returns the wider contract.
expectType<BroadComponent>(di.inject(itemToken1).Component);

// An instance genuinely incompatible with the token is still a type error.
expectError(
  getInjectable({
    id: 'wrong-shape-1',
    injectionToken: itemToken1,
    instantiate: () => ({ wrong: true }),
  }),
);

// --- DiContainerForInjection2: inject2 returns factories inside new-style instantiate ---

const innerInjectable2 = getInjectable2({
  id: 'inner',
  consumptions: [handlerToken2, someGetNumberInjectionToken],
  instantiate: di => {
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
  consumptions: [handlerManyToken2, wrapperToken2, someGetNumberInjectionToken],
  instantiate: di => {
    // token2 → returns ManyFactory
    const getHandlers = di.injectMany(handlerManyToken2);
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
  instantiate: di => {
    expectType<boolean>(di.hasRegistrations(parametricInjectable2));
    expectType<boolean>(di.hasRegistrations(handlerToken2));
    expectType<boolean>(di.hasRegistrations(someInjectable));
    expectType<boolean>(di.hasRegistrations(someInjectionToken));

    return () => {};
  },
});

// --- DiContainerForInjection2: getNumberOfRegistrations ---

const innerWithGetNumberOfRegistrations = getInjectable2({
  id: 'inner-get-number-of-reg',
  instantiate: di => {
    expectType<number>(di.getNumberOfRegistrations(parametricInjectable2));
    expectType<number>(di.getNumberOfRegistrations(handlerToken2));
    expectType<number>(di.getNumberOfRegistrations(wrapperToken2));
    expectType<number>(di.getNumberOfRegistrations(someInjectable));
    expectType<number>(di.getNumberOfRegistrations(someInjectionToken));

    return () => {};
  },
});

// --- DiContainerForInjection2: registeredInLocalScope ---

const innerWithRegisteredInLocalScope = getInjectable2({
  id: 'inner-registered-in-local-scope',
  instantiate: di => {
    expectType<boolean>(di.registeredInLocalScope(parametricInjectable2));
    expectType<boolean>(di.registeredInLocalScope(handlerToken2));
    expectType<boolean>(di.registeredInLocalScope(wrapperToken2));
    expectType<boolean>(di.registeredInLocalScope(someInjectable));
    expectType<boolean>(di.registeredInLocalScope(someInjectionToken));

    return () => {};
  },
});

// --- DiContainerForInjection2: registeredInLocalScopeSubtree ---

const innerWithRegisteredInLocalScopeSubtree = getInjectable2({
  id: 'inner-registered-in-local-scope-subtree',
  instantiate: di => {
    expectType<boolean>(
      di.registeredInLocalScopeSubtree(parametricInjectable2),
    );
    expectType<boolean>(di.registeredInLocalScopeSubtree(handlerToken2));
    expectType<boolean>(di.registeredInLocalScopeSubtree(someInjectable));
    expectType<boolean>(di.registeredInLocalScopeSubtree(someInjectionToken));

    return () => {};
  },
});

// --- register/deregister accept both old and new ---

expectType<void>(di.register(nonParametricInjectable2));
expectType<void>(di.register(nonParametricInjectable2, someInjectable));
expectType<void>(di.deregister(nonParametricInjectable2));

// --- SpecificInjectionToken2 with typed specifiers ---

// A `.for()` factory that narrows the general contract per specifier mentions
// the specifier's own type parameter in its return type, which inference from
// the value cannot reconstruct — so its type is given at the outer call.
const generalToken2WithSpecifier = getInjectionToken2<
  (arg: unknown) => boolean,
  (arg: unknown) => boolean[],
  <S extends TypedSpecifierWithType<'someType'>>(
    specifier: S,
  ) => SpecificInjectionToken2<
    (arg: TypedSpecifierType<'someType', S>) => boolean,
    (arg: TypedSpecifierType<'someType', S>) => boolean[],
    undefined,
    // Children of this family are consumed singly, whatever the general
    // token's own cardinality is.
    'one'
  >
>({
  id: 'general-token2-with-specifier',
  cardinality: 'zero-or-many',
})();

const someTypedSpecifier2 = getTypedSpecifier<{
  someType: string;
}>()('some-specifier');

const specificToken2 = generalToken2WithSpecifier.for(someTypedSpecifier2);

// public inject with specific token returns instance
expectType<boolean>(di.inject(specificToken2, 'hello'));

// the specific token's own cardinality is 'one', so it is not injectMany-able
// even though the general token it came from is a many-token
expectError(di.injectMany(specificToken2, 'hello'));
expectType<boolean[]>(di.injectMany(generalToken2WithSpecifier, 'hello'));

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
  di.injectManyWithMeta(handlerManyToken2),
);

// Non-generic token with params: injectManyWithMeta works
expectType<InjectionInstanceWithMeta<{ id: string }>[]>(
  di.injectManyWithMeta(userServiceManyToken2, 'user-123'),
);

// Inside new-style: injectWithMeta for non-generic returns factory for meta wrapper
const innerWithMeta = getInjectable2({
  id: 'inner-with-meta',
  instantiate: di => {
    const getHandlerMeta = di.injectWithMeta(handlerToken2);
    expectType<() => InjectionInstanceWithMeta<string>>(getHandlerMeta);

    const getHandlersMeta = di.injectManyWithMeta(handlerManyToken2);
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

// --- Override2 typing for injectable2 / token2 (v2-shape stub) ---

// non-parametric injectable2: matching curried stub is OK
expectType<void>(di.override2(nonParametricInjectable2, () => () => 42));

// non-parametric injectable2: wrong return type is a type error
expectError(di.override2(nonParametricInjectable2, () => () => 'not-a-number'));

// parametric injectable2: matching curried stub is OK
expectType<void>(
  di.override2(parametricInjectable2, () => (name, age) => ({ name, age })),
);

// parametric injectable2: stub params are typed from the factory signature
di.override2(parametricInjectable2, () => (name, age) => {
  expectType<string>(name);
  expectType<number>(age);
  return { name, age };
});

// parametric injectable2: wrong arg type is a type error
expectError(
  di.override2(parametricInjectable2, () => (name: number, age) => ({
    name: String(name),
    age,
  })),
);

// parametric injectable2: wrong return type is a type error
expectError(
  di.override2(parametricInjectable2, () => (name, age) => ({
    name,
    age: String(age),
  })),
);

// injectable2: stub receives DiContainerForInjection2 (inject returns factories)
di.override2(parametricInjectable2, di => {
  const getHandler = di.inject(handlerToken2);
  expectType<() => string>(getHandler);
  return (name, age) => ({ name, age });
});

// non-parametric token2: matching stub is OK
expectType<void>(di.override2(handlerToken2, () => () => 'hello'));

// non-parametric token2: wrong return type is a type error
expectError(di.override2(handlerToken2, () => () => 42));

// parametric token2: matching stub is OK
expectType<void>(
  di.override2(userServiceToken2, () => userId => ({ id: userId })),
);

// parametric token2: wrong arg type is a type error
expectError(
  di.override2(userServiceToken2, () => (userId: number) => ({
    id: String(userId),
  })),
);

// parametric token2: wrong return shape is a type error
expectError(di.override2(userServiceToken2, () => userId => ({ userId })));

// earlyOverride2 carries the same injectable2 typing
expectType<void>(
  di.earlyOverride2(parametricInjectable2, () => (name, age) => ({
    name,
    age,
  })),
);
expectError(
  di.earlyOverride2(parametricInjectable2, () => (name, age) => ({
    name,
    age: String(age),
  })),
);

// curried stub preserves generics: wrapperToken2's factory is <T>(value: T) => { wrapped: T },
// and the override stub must itself return a function retaining that generic — something
// the old flat shape could not express because Parameters<F> collapsed T to unknown.
expectType<void>(
  di.override2(wrapperToken2, () => <T>(value: T) => ({ wrapped: value })),
);

// inside the generic inner arrow, `value` is a free T — so string-only operations fail.
// this would not error under the old flat shape, where `value` had already been widened to unknown.
expectError(
  di.override2(wrapperToken2, () => <T>(value: T) => ({
    wrapped: value.toUpperCase(),
  })),
);

// monomorphized inner arrow with a contradictory return shape fails the generic contract
expectError(
  di.override2(wrapperToken2, () => (value: string) => ({
    wrapped: 42,
  })),
);

// --- Override (v1-shape) cross-compat with injectable2 / token2 ---

// non-parametric injectable2 with v1-shape stub: (di, ...params) => instance
expectType<void>(di.override(nonParametricInjectable2, () => 42));

// non-parametric injectable2 with v1-shape: wrong return type is a type error
expectError(di.override(nonParametricInjectable2, () => 'not-a-number'));

// parametric injectable2 with v1-shape stub
expectType<void>(
  di.override(parametricInjectable2, (di, name, age) => ({ name, age })),
);

// parametric injectable2 with v1-shape: params typed from factory signature
di.override(parametricInjectable2, (di, name, age) => {
  expectType<string>(name);
  expectType<number>(age);
  return { name, age };
});

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
>({
  id: 'general-branded-wrapper',
  cardinality: 'zero-or-many',
})();

const primaryBrandSpecifier = getTypedSpecifier<{ brand: 'primary' }>()(
  'primary-brand',
);

const primaryWrapperToken = generalBrandedWrapperToken2.for(
  primaryBrandSpecifier,
);

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
  di.override2(primaryWrapperToken, () => <T>(value: T) => ({
    wrapped: value,
    brand: 'primary' as const,
  })),
);

// Override with the wrong brand fails the specifier-fixed type
expectError(
  di.override2(primaryWrapperToken, () => <T>(value: T) => ({
    wrapped: value,
    brand: 'secondary' as const,
  })),
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
  instantiate:
    () =>
    () =>
    ({ instance }) =>
    (name, age) => {
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
      () =>
      () =>
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
    instantiate:
      () =>
      () =>
      ({ instance }) =>
      (name, age) => ({
        name,
        age: String(age),
      }),
  }),
);

// Non-parametric injectable2: inner arrow takes no args
getInjectable2({
  id: 'purge-callback-for-nonparametric-2',
  injectionToken: instancePurgeCallbackToken.for(nonParametricInjectable2),
  instantiate:
    () =>
    () =>
    ({ instance }) =>
    () => {
      expectType<number>(instance);
      return 0;
    },
});

// --- injectable2 target: injection token2 ---

getInjectable2({
  id: 'purge-callback-for-user-service-token-2',
  injectionToken: instancePurgeCallbackToken.for(userServiceToken2),
  instantiate:
    () =>
    () =>
    ({ instance }) =>
    userId => {
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
    () =>
    () =>
    ({ instance }) =>
    <T>(value: T) => ({ wrapped: value }),
});

// Inside the generic inner arrow, value stays T — string-only ops fail
expectError(
  getInjectable2({
    id: 'purge-callback-wrapper-bad-t',
    injectionToken: instancePurgeCallbackToken.for(wrapperToken2),
    instantiate:
      () =>
      () =>
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

// ---- Abstract tokens (getInjectionToken2 with a factory) ----

const abstractHandlerToken = getInjectionToken2<(name: string) => void>(
  {
    id: 'abstract-handler',
    cardinality: 'zero-or-many',
  },
)(
  // Each specific token of this family is implemented once, which the factory
  // that builds those tokens declares.
  (specifier: string) =>
    getInjectionToken2<(name: string) => void>({
      id: specifier,
      speciality: specifier,
      cardinality: 'one',
    })(),
);

// abstract token has correct type
expectAssignable<InjectionToken2<(name: string) => void>>(
  abstractHandlerToken,
);

// .for() returns a non-abstract SpecificInjectionToken2
const specificFromAbstract = abstractHandlerToken.for('click');

// injecting specific token derived from abstract is OK
di.inject(specificFromAbstract, 'test');

// injecting abstract token directly is a TYPE ERROR
expectError(di.inject(abstractHandlerToken, 'test'));

// injectMany on abstract token is OK (returns empty array at runtime when no
// injectables are registered against the abstract token itself)
expectType<void[]>(di.injectMany(abstractHandlerToken, 'test'));

// registration introspection accepts abstract, specific-from-abstract and
// specifier-derived tokens as plain aliases
expectType<number>(di.getNumberOfRegistrations(abstractHandlerToken));
expectType<number>(di.getNumberOfRegistrations(specificFromAbstract));
expectType<number>(di.getNumberOfRegistrations(specificToken2));
expectType<boolean>(di.registeredInLocalScope(abstractHandlerToken));
expectType<boolean>(di.registeredInLocalScope(specificFromAbstract));
expectType<boolean>(di.registeredInLocalScope(specificToken2));
expectType<boolean>(di.registeredInLocalScopeSubtree(abstractHandlerToken));
expectType<boolean>(di.registeredInLocalScopeSubtree(specificFromAbstract));
expectType<boolean>(di.registeredInLocalScopeSubtree(specificToken2));

// injectWithMeta on abstract token is a TYPE ERROR
expectError(di.injectWithMeta(abstractHandlerToken, 'test'));

// injectManyWithMeta on abstract token is OK
expectType<InjectionInstanceWithMeta<void>[]>(
  di.injectManyWithMeta(abstractHandlerToken, 'test'),
);

// --- same operations via the v2, factory-returning inject surface ---

// inject2 on specific-from-abstract returns the factory itself
const getSpecificFromAbstract2 = di.inject2(specificFromAbstract);
expectType<void>(getSpecificFromAbstract2('test'));

// inject2 on abstract token directly is a TYPE ERROR
expectError(di.inject2(abstractHandlerToken));

// injectMany2 on abstract token returns its many-factory verbatim
expectType<void[]>(di.injectMany2(abstractHandlerToken)('test'));

// injectWithMeta2 on abstract token directly is a TYPE ERROR
expectError(di.injectWithMeta2(abstractHandlerToken));

// injectManyWithMeta2 on abstract token returns its many-factory, meta-wrapped
expectType<InjectionInstanceWithMeta<void>[]>(
  di.injectManyWithMeta2(abstractHandlerToken)('test'),
);

// implementing abstract token directly is a TYPE ERROR
expectError(
  getInjectable2({
    id: 'bad-impl',
    injectionToken: abstractHandlerToken,
    instantiate: () => (name: string) => {},
  }),
);

// implementing specific token from abstract is OK
getInjectable2({
  id: 'good-impl',
  injectionToken: specificFromAbstract,
  instantiate: () => (name: string) => {},
});

// --- Abstract token (has a factory) with a `.for()` that narrows per specifier ---

// Same shape as `generalToken2WithSpecifier`, but through the explicit-SF
// overload with a real factory: it lets a `.for()` factory mention the
// specifier's own type parameter, which inference from the value alone
// cannot reconstruct — and since a real factory type is given, the token is
// abstract.
const abstractTokenWithSpecifier = getInjectionToken2<
  (arg: unknown) => boolean,
  (arg: unknown) => boolean[],
  <S extends TypedSpecifierWithType<'someAbstractType'>>(
    specifier: S,
  ) => SpecificInjectionToken2<
    (arg: TypedSpecifierType<'someAbstractType', S>) => boolean,
    (arg: TypedSpecifierType<'someAbstractType', S>) => boolean[],
    undefined,
    'one'
  >
>({
  id: 'abstract-token2-with-specifier',
  cardinality: 'zero-or-many',
})();

const someAbstractTypedSpecifier = getTypedSpecifier<{
  someAbstractType: string;
}>()('some-abstract-specifier');

const specificFromAbstractWithSpecifier = abstractTokenWithSpecifier.for(
  someAbstractTypedSpecifier,
);

// .for() returns a non-abstract token, narrowed to the specifier's own type
expectType<boolean>(di.inject(specificFromAbstractWithSpecifier, 'hello'));

// wrong arg type is a type error
expectError(di.inject(specificFromAbstractWithSpecifier, 42));

// the specific token's own cardinality is 'one', so it is not injectMany-able
// even though the abstract token it came from is a many-token
expectError(di.injectMany(specificFromAbstractWithSpecifier, 'hello'));
expectType<boolean[]>(di.injectMany(abstractTokenWithSpecifier, 'hello'));

// injecting the abstract token directly is still a TYPE ERROR
expectError(di.inject(abstractTokenWithSpecifier, 'hello'));

// --- same operations via the v2, factory-returning inject surface ---

// inject2 on the specific token returns the narrowed factory itself
const getSpecificFromAbstractWithSpecifier2 = di.inject2(
  specificFromAbstractWithSpecifier,
);
expectType<boolean>(getSpecificFromAbstractWithSpecifier2('hello'));
expectError(getSpecificFromAbstractWithSpecifier2(42));

// injectMany2 on the abstract token returns its many-factory verbatim
expectType<boolean[]>(di.injectMany2(abstractTokenWithSpecifier)('hello'));

// injectMany2 on the specific token is a TYPE ERROR — its own cardinality is 'one'
expectError(di.injectMany2(specificFromAbstractWithSpecifier));

// inject2 on the abstract token directly is still a TYPE ERROR
expectError(di.inject2(abstractTokenWithSpecifier));

// --- getInjectionToken2(options)(specificInjectionTokenFactory): abstract, since a real factory is given ---

const abstractTokenWithCurriedFactory = getInjectionToken2<
  () => unknown
>({
  id: 'abstract-token-with-curried-factory',
  cardinality: 'zero-or-many',
})(<Speciality extends string>(speciality: Speciality) =>
  getInjectionToken2<() => { someProperty: Speciality }>({
    id: speciality,
    speciality,
    cardinality: 'one',
  })(),
);

expectType<{ someProperty: 'some-speciality' }>(
  di.inject(abstractTokenWithCurriedFactory.for('some-speciality')),
);

// a widened `string` implementation no longer satisfies the specific token
expectError(
  getInjectable2({
    id: 'bad-impl-non-curried',
    injectionToken: abstractTokenWithCurriedFactory.for('some-speciality'),
    instantiate: () => (): { someProperty: string } => ({
      someProperty: 'anything',
    }),
  }),
);

// multi-level specificity, each level supplying its own factory — each
// intermediate level is abstract, since it carries its own factory:
// `.for('some-specifier-1').for(42)`. Level1/Level2 are deliberately plain
// `string`/`number` here, not generic type parameters like the single-level
// tests above: an *intermediate* level's factory going through
// getInjectionToken2's speciality overload while itself returning another
// generic factory (Level2) hits a real TS inference limit — the outer
// call's generic gets widened to its constraint instead of narrowed per
// specifier. Generic-specifier narrowing itself is already covered by the
// single-level tests above; this one is about multi-level nesting and the
// speciality fix, so it doesn't need to double as that demonstration too.
const abstractTokenWithTwoLevels = getInjectionToken2<() => unknown>({
  id: 'abstract-token-with-two-levels',
  cardinality: 'zero-or-many',
})((level1: string) =>
  getInjectionToken2<() => unknown>({
    id: `abstract-token-with-two-levels-${level1}`,
    speciality: level1,
    cardinality: 'zero-or-many',
  })((level2: number) =>
    getInjectionToken2<() => { level1: string; level2: number }>({
      id: String(level2),
      speciality: level2,
      cardinality: 'one',
    })(),
  ),
);

expectType<{ level1: string; level2: number }>(
  di.inject(abstractTokenWithTwoLevels.for('some-specifier-1').for(42)),
);

// ======================================================================
// Disciplined type parameters: Factory alias, defaults, Alias union, exports
// ======================================================================

import {
  Factory,
  Alias,
  Alias1,
  Alias2,
  ManyFactory,
  InjectMany,
  InjectMany2,
  InjectWithMeta,
  InjectWithMeta2,
  InjectManyWithMeta,
  InjectManyWithMeta2,
  HasRegistrations2,
  Meta,
  ToWithMetaFactory,
  ToWithMetaManyFactory,
} from '.';

// --- Defaults: bare types resolve to the Factory default ---

const anyInjectable2: Injectable2 = nonParametricInjectable2;
expectAssignable<Injectable2>(parametricInjectable2);
expectAssignable<Injectable2>(transientInjectable2);

expectAssignable<InjectionToken2>(handlerToken2);
expectAssignable<InjectionToken2>(userServiceToken2);

expectAssignable<InjectionToken2>(abstractHandlerToken);

// Abstract tokens are built by the same creator as concrete ones, so they
// carry the same alias type; `__abstract` is what tells them apart.
expectType<'injection-token2'>(abstractHandlerToken.aliasType);
expectType<true>(abstractHandlerToken.__abstract);

// Heterogeneous v2 collection — previously required Injectable2<any>
const everyInjectable2: Injectable2[] = [
  nonParametricInjectable2,
  parametricInjectable2,
  transientInjectable2,
];

// --- Factory alias ---

expectAssignable<Factory>((x: number) => x);
expectAssignable<Factory>(() => 'hi');
expectAssignable<Factory>((name: string, age: number) => ({ name, age }));

// --- ManyFactory<F> ---

type _AutoManySimple = ManyFactory<(name: string) => number>;
expectAssignable<_AutoManySimple>((name: string) => [1, 2]);

type _AutoManyZeroArg = ManyFactory<() => string>;
expectAssignable<_AutoManyZeroArg>(() => ['a', 'b']);

// --- Meta ---

const sampleMeta: Meta = { id: 'hello' };
expectType<string>(sampleMeta.id);

// --- Exported helper interfaces are nominally usable as types ---

type _Im = InjectMany;
type _Im2 = InjectMany2;
type _Iwm = InjectWithMeta;
type _Iwm2 = InjectWithMeta2;
type _Imwm = InjectManyWithMeta;
type _Imwm2 = InjectManyWithMeta2;
type _Hr2 = HasRegistrations2;
type _Twmf = ToWithMetaFactory<(x: number) => string>;
type _Twmmf = ToWithMetaManyFactory<(x: number) => string>;

// --- Alias / Alias1 / Alias2 ---

const v1Aliases: Alias1[] = [
  someInjectable,
  someStringInjectionToken,
  someInjectableWithInstantiationParameter,
  someInjectableWithMatchingInstantiationParameters,
];

const v2Aliases: Alias2[] = [
  nonParametricInjectable2,
  handlerToken2,
  abstractHandlerToken,
];

const everyAlias: Alias[] = [...v1Aliases, ...v2Aliases];

// permitSideEffects accepts any Alias member:
di.permitSideEffects(handlerToken2);
di.permitSideEffects(someInjectable);
di.permitSideEffects(abstractHandlerToken);

// hasRegistrations accepts any Alias member:
di.hasRegistrations(handlerToken2);
di.hasRegistrations(someInjectable);

// --- tags is now string[] ---

getInjectable2({
  id: 'tagged',
  instantiate: () => () => 1,
  tags: ['some-tag', 'another'],
});

expectError(
  getInjectable2({
    id: 'badly-tagged',
    instantiate: () => () => 1,
    tags: [42],
  }),
);

// --- injection tokens carry tags ---

const taggedV1Token = getInjectionToken<string>({
  id: 'tagged-v1-token',
  tags: ['some-tag'],
});

expectType<string[] | undefined>(taggedV1Token.tags);

expectError(
  getInjectionToken<string>({
    id: 'badly-tagged-v1-token',
    tags: [42],
  }),
);

const taggedV2Token = getInjectionToken2<() => string>({
  cardinality: 'zero-or-many',
  id: 'tagged-v2-token',
  tags: ['some-tag'],
})();

expectType<string[] | undefined>(taggedV2Token.tags);

expectError(
  getInjectionToken2<() => string>({
    cardinality: 'zero-or-many',
    id: 'badly-tagged-v2-token',
    tags: [42],
  })(),
);

const taggedAbstractToken = getInjectionToken2<() => string>({
  cardinality: 'zero-or-many',
  id: 'tagged-abstract-token',
  tags: ['some-tag'],
})(idBasedSpecificToken2<() => string, ManyFactory<() => string>, 'zero-or-many'>());

expectType<string[] | undefined>(taggedAbstractToken.tags);

expectError(
  getInjectionToken2<() => string>({
    cardinality: 'zero-or-many',
    id: 'badly-tagged-abstract-token',
    tags: [42],
  })(),
);

expectType<'injectionToken'>(injectionTokenTag);

// --- createContainer takes no options bag; injection decorators are always available ---

expectError(createContainer('some-container', { injectionDecorators: true }));

// --- preInjectCallbackToken ---

import {
  preInjectCallbackToken,
  ContainerRoot,
  PreInjectCallback,
  PreInjectCallbackKind,
  PreInjectCallbackSpecificFactory,
} from '.';

expectAssignable<
  InjectionToken2<
    Factory,
    ManyFactory,
    PreInjectCallbackSpecificFactory
  >
>(preInjectCallbackToken);

const somePreInjectCallback: PreInjectCallback = (
  alias,
  kind,
  injectingInjectable,
) => {
  expectType<Alias | ContainerRoot>(injectingInjectable);
  expectType<Alias>(alias);
  expectType<PreInjectCallbackKind>(kind);
};

expectType<'inject' | 'injectMany'>(null as unknown as PreInjectCallbackKind);

// A callback registers against a .for-scoped token; the factory is curried.
getInjectable2({
  id: 'some-pre-inject-callback',
  injectionToken: preInjectCallbackToken.for(someStringInjectionToken),
  instantiate: () => () => somePreInjectCallback,
});

// .for accepts an injectable, tokens (v1 and v2), and a string tag.
preInjectCallbackToken.for(someInjectable);
preInjectCallbackToken.for(handlerToken2);
preInjectCallbackToken.for('some-tag');

// Mis-typed callbacks are rejected.
expectError(
  getInjectable2({
    id: 'badly-typed-pre-inject-callback',
    injectionToken: preInjectCallbackToken.for('some-tag'),
    instantiate: () => () => (alias: string, kind: number) => {},
  }),
);

expectError(
  getInjectable2({
    id: 'not-a-callback',
    injectionToken: preInjectCallbackToken.for('some-tag'),
    instantiate: () => () => 42,
  }),
);

// instantiationDecoratorToken is typed correctly for v1 injectables and injection tokens

const someFunctionInjectableToBeDecorated = getInjectable({
  id: 'some-function-injectable-to-be-decorated',
  instantiate: (di, param) => (arg1: string, arg2: boolean) => {},
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, param: number) => param,
  }),
});

const someFunctionDecoration = getInjectable2({
  id: 'some-function-injectable-to-be-decorated',
  instantiate: di => () => instantiate => (di, param) => (arg1, arg2) => {
    expectType<Instantiate<(arg1: string, arg2: boolean) => void, number>>(
      instantiate,
    );
    expectType<number>(param);
    expectType<string>(arg1);
    expectType<boolean>(arg2);
  },
  injectionToken: instantiationDecoratorToken.for(
    someFunctionInjectableToBeDecorated,
  ),
});

// instantiationDecoratorToken is typed correctly when decorating based on tags

// expect single params to be an error since it could be an arbitrary number of params
const someTagDecoration = expectError(
  getInjectable2({
    id: 'some-tag-decoration',
    instantiate: di => () => instantiate => (di, param) =>
      instantiate(di, param),
    injectionToken: instantiationDecoratorToken.for('some-tag'),
  }),
);

// works as expected with spreading of arguments
const someTagDecoration2 = getInjectable2({
  id: 'some-tag-decoration2',
  instantiate:
    di =>
    () =>
    instantiate =>
    (di, ...param) =>
      instantiate(di, ...param),
  injectionToken: instantiationDecoratorToken.for('some-tag'),
});

// Trying to map the collected from spread args as a single argument is wrong
const someTagDecoration3 = expectError(
  getInjectable2({
    id: 'some-tag-decoration3',
    instantiate:
      di =>
      () =>
      instantiate =>
      (di, ...param) =>
        instantiate(di, param),
    injectionToken: instantiationDecoratorToken.for('some-tag'),
  }),
);

// returning a wrong type in the decorator is considered an error
const someTagDecoration4 = expectError(
  getInjectable2({
    id: 'some-tag-decoration4',
    instantiate:
      di =>
      () =>
      instantiate =>
      (di, ...param) =>
        10,
    injectionToken: instantiationDecoratorToken.for('some-tag'),
  }),
);

// ==== Cardinality of injection tokens ====

type GetGreeting = (name: string) => string;

const cardinalityOneToken = getInjectionToken2<GetGreeting>({
  id: 'cardinality-one',
  cardinality: 'one',
})();

const cardinalityMaybeToken = getInjectionToken2<GetGreeting>({
  id: 'cardinality-maybe',
  cardinality: 'zero-or-one',
})();

const cardinalityManyToken = getInjectionToken2<GetGreeting>({
  id: 'cardinality-many',
  cardinality: 'zero-or-many',
})();

const cardinalityNonEmptyManyToken = getInjectionToken2<GetGreeting>({
  id: 'cardinality-non-empty-many',
  cardinality: 'one-or-many',
})();

// --- cardinality is mandatory ---

// given no cardinality, creating a token is not OK
expectError(getInjectionToken2<GetGreeting>({ id: 'no-cardinality' })());

// given an unknown cardinality, creating a token is not OK
expectError(
  getInjectionToken2<GetGreeting>({
    id: 'unknown-cardinality',
    cardinality: 'sometimes',
  })(),
);

// given a specific token built with an unknown cardinality, it is not OK
expectError(
  getInjectionToken2<GetGreeting>({
    id: 'unknown-specific-cardinality',
    speciality: 'some-speciality',
    cardinality: 'sometimes',
  })(),
);

// a specific token may omit the cardinality, inheriting its family's
expectType<Cardinality | undefined>(
  getInjectionToken2<GetGreeting>({
    id: 'inheriting-specific',
    speciality: 'some-speciality',
  })().cardinality,
);

// given options built up separately, whose cardinality widened to `string`,
// creating a token is not OK
const widenedOptions = { id: 'widened', cardinality: 'one' };
expectError(getInjectionToken2<GetGreeting>(widenedOptions)());

// given options frozen as literals, creating a token is OK
const constOptions = { id: 'const-options', cardinality: 'one' } as const;
expectType<'one' | undefined>(
  getInjectionToken2<GetGreeting>(constOptions)().cardinality,
);

// --- the declared cardinality is carried on the token ---

expectType<'one' | undefined>(cardinalityOneToken.cardinality);
expectType<'zero-or-one' | undefined>(cardinalityMaybeToken.cardinality);
expectType<'zero-or-many' | undefined>(cardinalityManyToken.cardinality);
expectType<'one-or-many' | undefined>(cardinalityNonEmptyManyToken.cardinality);

// --- each cardinality gets the consumption shape it declares ---

expectType<ManyFactory<GetGreeting>>(cardinalityManyToken.manyTemplate);
expectType<MaybeResultFactory<GetGreeting>>(cardinalityMaybeToken.manyTemplate);
expectType<NonEmptyManyFactory<GetGreeting>>(
  cardinalityNonEmptyManyToken.manyTemplate,
);

// --- only the matching consumption API accepts each token ---

// given cardinality 'one', injecting singly is OK and injecting many is not
expectType<string>(di.inject(cardinalityOneToken, 'some-name'));
expectError(di.injectMany(cardinalityOneToken, 'some-name'));

// given the many-cardinalities, injecting many is OK and injecting singly is not
expectType<string[]>(di.injectMany(cardinalityManyToken, 'some-name'));
expectError(di.inject(cardinalityManyToken, 'some-name'));

expectType<string[]>(di.injectMany(cardinalityNonEmptyManyToken, 'some-name'));
expectError(di.inject(cardinalityNonEmptyManyToken, 'some-name'));

// given cardinality 'zero-or-one', neither single nor many injection accepts it
expectError(di.inject(cardinalityMaybeToken, 'some-name'));
expectError(di.injectMany(cardinalityMaybeToken, 'some-name'));

// the same gating applies to the factory-returning and with-meta variants
expectType<GetGreeting>(di.inject2(cardinalityOneToken));
expectError(di.inject2(cardinalityManyToken));
expectType<ManyFactory<GetGreeting>>(di.injectMany2(cardinalityManyToken));
expectError(di.injectMany2(cardinalityOneToken));
expectError(di.injectWithMeta(cardinalityManyToken, 'some-name'));
expectError(di.injectManyWithMeta(cardinalityOneToken, 'some-name'));

// --- a token of unknown cardinality cannot be consumed at all ---

// given a token annotated without a cardinality, it holds a token of any
// cardinality — which is enough to register it, but not to consume it
declare const tokenOfUnknownCardinality: InjectionToken2<GetGreeting>;

expectType<boolean>(di.hasRegistrations(tokenOfUnknownCardinality));
expectType<boolean>(di.registeredInLocalScope(tokenOfUnknownCardinality));
expectType<number>(di.getNumberOfRegistrations(tokenOfUnknownCardinality));
expectType<void>(di.purge(tokenOfUnknownCardinality));
expectError(di.inject(tokenOfUnknownCardinality, 'some-name'));
expectError(di.injectMany(tokenOfUnknownCardinality, 'some-name'));

// every declared cardinality is assignable to that wide annotation
expectAssignable<InjectionToken2<GetGreeting>>(cardinalityOneToken);
expectAssignable<InjectionToken2<GetGreeting>>(cardinalityMaybeToken);
expectAssignable<InjectionToken2<GetGreeting>>(cardinalityManyToken);
expectAssignable<InjectionToken2<GetGreeting>>(cardinalityNonEmptyManyToken);
expectAssignable<InjectionToken2>(cardinalityMaybeToken);

// --- per-cardinality annotation aliases ---

expectAssignable<SingleInjectionToken2<GetGreeting>>(cardinalityOneToken);
expectAssignable<MaybeInjectionToken2<GetGreeting>>(cardinalityMaybeToken);
expectAssignable<ManyInjectionToken2<GetGreeting>>(cardinalityManyToken);
expectAssignable<NonEmptyManyInjectionToken2<GetGreeting>>(
  cardinalityNonEmptyManyToken,
);

// --- `.for()` children carry the cardinality --- (see heteroCardinalityToken
// below — cardinalityOneToken itself has no factory, since nothing here
// consumes it via `.for()`)

// given a factory that declares a cardinality for the tokens it builds,
// `.for()` children carry that one instead of the general token's
const heteroCardinalityToken = getInjectionToken2<GetGreeting>({
  id: 'hetero-cardinality',
  cardinality: 'zero-or-many',
})((specifier: string) =>
  getInjectionToken2<GetGreeting>({
    id: specifier,
    speciality: specifier,
    cardinality: 'one',
  })(),
);

expectType<'zero-or-many' | undefined>(heteroCardinalityToken.cardinality);
expectType<'one' | undefined>(heteroCardinalityToken.for('a').cardinality);

// so the general token is injected many, and its children singly
expectType<string[]>(di.injectMany(heteroCardinalityToken, 'some-name'));
expectType<string>(di.inject(heteroCardinalityToken.for('a'), 'some-name'));
expectError(di.inject(heteroCardinalityToken, 'some-name'));
expectError(di.injectMany(heteroCardinalityToken.for('a'), 'some-name'));

// --- the `.for()` factory's type is inferred from the value it is given ---

declare function someSpecificTokenFactory(
  specifier: string,
): SpecificInjectionToken2<
  GetGreeting,
  ManyFactory<GetGreeting>,
  any,
  'zero-or-many'
>;

const tokenWithInferredSpecificFactory = getInjectionToken2<GetGreeting>({
  id: 'inferred-specific-factory',
  cardinality: 'zero-or-many',
})(someSpecificTokenFactory);

expectType<typeof someSpecificTokenFactory>(
  tokenWithInferredSpecificFactory.for,
);
expectType<string[]>(
  di.injectMany(tokenWithInferredSpecificFactory.for('a'), 'some-name'),
);

// --- generic factories keep their generic through an explicit many-factory ---

type GetWrapped = <T>(value: T) => { wrapped: T };

const genericManyToken = getInjectionToken2<
  GetWrapped,
  <T>(value: T) => { wrapped: T }[]
>({
  id: 'generic-many',
  cardinality: 'zero-or-many',
})();

const genericNonEmptyManyToken = getInjectionToken2<
  GetWrapped,
  <T>(value: T) => [{ wrapped: T }, ...{ wrapped: T }[]]
>({
  id: 'generic-non-empty-many',
  cardinality: 'one-or-many',
})();

// the explicit many-factory is returned verbatim, so `T` survives injection
const getWrappedMany = di.injectMany2(genericManyToken);
expectType<{ wrapped: string }[]>(getWrappedMany('some-string' as string));
expectType<{ wrapped: number }[]>(di.injectMany2(genericManyToken)(42));

const getWrappedNonEmptyMany = di.injectMany2(genericNonEmptyManyToken);
expectType<[{ wrapped: string }, ...{ wrapped: string }[]]>(
  getWrappedNonEmptyMany('some-string' as string),
);

// --- an abstract token (has a factory) keeps a generic factory's genericity too ---

const abstractGenericManyToken = getInjectionToken2<
  GetWrapped,
  <T>(value: T) => { wrapped: T }[]
>({
  id: 'abstract-generic-many',
  cardinality: 'zero-or-many',
})(idBasedSpecificToken2<GetWrapped, <T>(value: T) => { wrapped: T }[], 'zero-or-many'>());

// the explicit many-factory is returned verbatim through injectMany2, so `T`
// survives injection even though the token is abstract
const getAbstractWrappedMany = di.injectMany2(abstractGenericManyToken);
expectType<{ wrapped: string }[]>(
  getAbstractWrappedMany('some-string' as string),
);
expectType<{ wrapped: number }[]>(di.injectMany2(abstractGenericManyToken)(42));

// --- an explicit consumption factory must have the shape its cardinality
// --- implies, generics included

type WrappedManyFactory = <T>(value: T) => { wrapped: T }[];
type WrappedMaybeFactory = <T>(value: T) => { wrapped: T } | undefined;
type WrappedNonEmptyManyFactory = <T>(
  value: T,
) => [{ wrapped: T }, ...{ wrapped: T }[]];
// Yields a value and never nothing — the shape a maybe-token must not have.
type WrappedBareFactory = <T>(value: T) => { wrapped: T };

// given cardinality 'one', a many-shaped slot is OK and the others are not
getInjectionToken2<GetWrapped, WrappedManyFactory>({
  id: 'one-with-many-shape',
  cardinality: 'one',
})();
getInjectionToken2<GetWrapped, WrappedNonEmptyManyFactory>({
  id: 'one-with-non-empty-many-shape',
  cardinality: 'one',
})();
expectError(
  getInjectionToken2<GetWrapped, WrappedMaybeFactory>({
    id: 'one-with-maybe-shape',
    cardinality: 'one',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedBareFactory>({
    id: 'one-with-bare-shape',
    cardinality: 'one',
  })(),
);

// given cardinality 'zero-or-one', only a shape that admits undefined is OK —
// the factory is handed back verbatim, so one that always yields a value would
// deny the very absence the cardinality is about
getInjectionToken2<GetWrapped, WrappedMaybeFactory>({
  id: 'maybe-with-maybe-shape',
  cardinality: 'zero-or-one',
})();
expectError(
  getInjectionToken2<GetWrapped, WrappedBareFactory>({
    id: 'maybe-with-bare-shape',
    cardinality: 'zero-or-one',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedManyFactory>({
    id: 'maybe-with-many-shape',
    cardinality: 'zero-or-one',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedNonEmptyManyFactory>({
    id: 'maybe-with-non-empty-many-shape',
    cardinality: 'zero-or-one',
  })(),
);

// given cardinality 'zero-or-many', array-yielding shapes are OK
getInjectionToken2<GetWrapped, WrappedManyFactory>({
  id: 'many-with-many-shape',
  cardinality: 'zero-or-many',
})();
getInjectionToken2<GetWrapped, WrappedNonEmptyManyFactory>({
  id: 'many-with-non-empty-many-shape',
  cardinality: 'zero-or-many',
})();
expectError(
  getInjectionToken2<GetWrapped, WrappedMaybeFactory>({
    id: 'many-with-maybe-shape',
    cardinality: 'zero-or-many',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedBareFactory>({
    id: 'many-with-bare-shape',
    cardinality: 'zero-or-many',
  })(),
);

// given cardinality 'one-or-many', only a non-empty tuple is OK — a plain
// array would deny the guarantee that indexing the first element is safe
getInjectionToken2<GetWrapped, WrappedNonEmptyManyFactory>({
  id: 'non-empty-many-with-non-empty-many-shape',
  cardinality: 'one-or-many',
})();
expectError(
  getInjectionToken2<GetWrapped, WrappedManyFactory>({
    id: 'non-empty-many-with-many-shape',
    cardinality: 'one-or-many',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedMaybeFactory>({
    id: 'non-empty-many-with-maybe-shape',
    cardinality: 'one-or-many',
  })(),
);
expectError(
  getInjectionToken2<GetWrapped, WrappedBareFactory>({
    id: 'non-empty-many-with-bare-shape',
    cardinality: 'one-or-many',
  })(),
);

// the same holds when the `.for()` factory's type is given too
expectError(
  getInjectionToken2<
    GetWrapped,
    WrappedBareFactory,
    (
      id: string,
    ) => SpecificInjectionToken2<
      GetWrapped,
      WrappedBareFactory,
      any,
      'zero-or-one'
    >
  >({
    id: 'maybe-with-bare-shape-and-specific-factory',
    cardinality: 'zero-or-one',
  })(),
);

// and a mismatch in the parameters, not just the result, is still caught
expectError(
  getInjectionToken2<(x: string) => number, (x: number) => number[]>({
    id: 'mismatched-parameters',
    cardinality: 'zero-or-many',
  })(),
);

// --- implementing a token of any cardinality ---

// the implementation's own factory stays narrow, whatever the token's arity
const cardinalityManyImpl = getInjectable2({
  id: 'cardinality-many-impl',
  injectionToken: cardinalityManyToken,
  instantiate: () => (name: string) => `hello ${name}`,
});

expectType<string>(di.inject(cardinalityManyImpl, 'some-name'));

const cardinalityMaybeImpl = getInjectable2({
  id: 'cardinality-maybe-impl',
  injectionToken: cardinalityMaybeToken,
  instantiate: () => (name: string) => `hello ${name}`,
});

expectType<string>(di.inject(cardinalityMaybeImpl, 'some-name'));

// a factory incompatible with the token is still a type error
expectError(
  getInjectable2({
    id: 'wrong-factory-for-cardinality-token',
    injectionToken: cardinalityManyToken,
    instantiate: () => (wrong: number) => wrong,
  }),
);

// ==== injectMaybe ====

// given a token declared 'zero-or-one', injecting maybe yields the token's
// maybe-factory, whose result is the instance or undefined
expectType<MaybeResultFactory<GetGreeting>>(
  di.injectMaybe2(cardinalityMaybeToken),
);
expectType<string | undefined>(
  di.injectMaybe2(cardinalityMaybeToken)('a-name'),
);

// no tuple and no destructuring at the call site
const maybeGreeting = di.injectMaybe2(cardinalityMaybeToken)('a-name');
expectAssignable<string | undefined>(maybeGreeting);
expectNotType<string>(maybeGreeting);

// given any other cardinality, injecting maybe is not OK
expectError(di.injectMaybe2(cardinalityOneToken));
expectError(di.injectMaybe2(cardinalityManyToken));
expectError(di.injectMaybe2(cardinalityNonEmptyManyToken));
expectError(di.injectMaybe2(tokenOfUnknownCardinality));

// injectables carry no cardinality, so they are not injectable maybe either
expectError(di.injectMaybe2(nonParametricInjectable2));

// The root container suffixes its factory-returning members, and only those,
// so the unsuffixed name is not one of them there.
type RootHasUnsuffixedInjectMaybe = 'injectMaybe' extends keyof DiContainer
  ? true
  : false;
expectType<false>(false as RootHasUnsuffixedInjectMaybe);

// Inside an `instantiate` every member is factory-returning, so none carries
// the suffix.
type ScopedHasSuffixedInjectMaybe =
  'injectMaybe2' extends keyof DiContainerForInjection2 ? true : false;
expectType<false>(false as ScopedHasSuffixedInjectMaybe);

getInjectable2({
  id: 'maybe-member-naming',
  consumptions: [cardinalityMaybeToken],

  instantiate: di => {
    expectType<MaybeResultFactory<GetGreeting>>(
      di.injectMaybe(cardinalityMaybeToken),
    );

    return () => 'irrelevant';
  },
});

// `.for()` children of a 'zero-or-one' token are injectable maybe
const maybeTokenWithForChild = getInjectionToken2<GetGreeting>({
  id: 'cardinality-maybe-with-for',
  cardinality: 'zero-or-one',
})(idBasedSpecificToken2<GetGreeting, MaybeResultFactory<GetGreeting>, 'zero-or-one'>());

expectType<string | undefined>(
  di.injectMaybe2(maybeTokenWithForChild.for('a'))('a-name'),
);

// a generic factory keeps its generic through injectMaybe, given the maybe
// shape was supplied explicitly
const genericMaybeToken = getInjectionToken2<
  GetWrapped,
  <T>(value: T) => { wrapped: T } | undefined
>({
  id: 'generic-maybe',
  cardinality: 'zero-or-one',
})();

const getWrappedMaybe = di.injectMaybe2(genericMaybeToken);
expectType<{ wrapped: string } | undefined>(
  getWrappedMaybe('some-string' as string),
);
expectType<{ wrapped: number } | undefined>(getWrappedMaybe(42));

// inside an instantiate, the same gating applies
getInjectable2({
  id: 'maybe-consumer',
  consumptions: [cardinalityMaybeToken, cardinalityManyToken],

  instantiate: di => {
    expectType<MaybeResultFactory<GetGreeting>>(
      di.injectMaybe(cardinalityMaybeToken),
    );
    // declared, but its cardinality still decides the API
    expectError(di.injectMaybe(cardinalityManyToken));

    return () => 'irrelevant';
  },
});

// ==== Consumption declarations ====

const consumedOneToken = getInjectionToken2<GetGreeting>({
  id: 'consumed-one',
  cardinality: 'one',
})();

const consumedManyToken = getInjectionToken2<GetGreeting>({
  id: 'consumed-many',
  cardinality: 'zero-or-many',
})();

const consumedMaybeToken = getInjectionToken2<GetGreeting>({
  id: 'consumed-maybe',
  cardinality: 'zero-or-one',
})();

const undeclaredToken = getInjectionToken2<(count: number) => boolean>({
  id: 'undeclared',
  cardinality: 'one',
})();

const undeclaredManyToken = getInjectionToken2<(count: number) => boolean>({
  id: 'undeclared-many',
  cardinality: 'zero-or-many',
})();

const undeclaredMaybeToken = getInjectionToken2<(count: number) => boolean>({
  id: 'undeclared-maybe',
  cardinality: 'zero-or-one',
})();

declare const someConsumedInjectable: Injectable2<(n: number) => string>;

// --- what was declared is injectable, through the API its cardinality picks ---

const declaringInjectable = getInjectable2({
  id: 'declaring',
  consumptions: [consumedOneToken, consumedManyToken, consumedMaybeToken],

  instantiate: di => {
    expectType<GetGreeting>(di.inject(consumedOneToken));
    expectType<ManyFactory<GetGreeting>>(di.injectMany(consumedManyToken));
    expectType<MaybeResultFactory<GetGreeting>>(
      di.injectMaybe(consumedMaybeToken),
    );

    // a declared token is still bound to its own consumption API
    expectError(di.injectMany(consumedOneToken));
    expectError(di.inject(consumedManyToken));
    expectError(di.injectMaybe(consumedOneToken));

    // an undeclared token is rejected outright
    expectError(di.inject(undeclaredToken));
    expectError(di.injectMany(undeclaredManyToken));
    expectError(di.injectMaybe(undeclaredMaybeToken));

    // injectables need no declaration
    expectType<(n: number) => string>(di.inject(someConsumedInjectable));

    return () => 'irrelevant';
  },
});

expectType<Injectable2<() => string>>(declaringInjectable);
expectType<readonly Consumption[] | undefined>(
  declaringInjectable.consumptions,
);

// --- declaring nothing means injecting no tokens ---

getInjectable2({
  id: 'declaring-nothing',

  instantiate: di => {
    expectError(di.inject(undeclaredToken));
    expectError(di.injectMany(undeclaredManyToken));
    expectError(di.injectMaybe(undeclaredMaybeToken));

    // injectables are still injectable
    expectType<(n: number) => string>(di.inject(someConsumedInjectable));

    return () => 'irrelevant';
  },
});

// an explicitly empty declaration is the same thing
getInjectable2({
  id: 'declaring-empty',
  consumptions: [],

  instantiate: di => {
    expectError(di.inject(undeclaredToken));

    return () => 'irrelevant';
  },
});

// --- declaring a token covers its `.for()` derivatives ---

const familyToken = getInjectionToken2<GetGreeting>({
  id: 'family',
  cardinality: 'zero-or-many',
})((specifier: string) =>
  getInjectionToken2<GetGreeting>({
    id: specifier,
    speciality: specifier,
    cardinality: 'one',
  })(),
);

getInjectable2({
  id: 'declaring-family',
  consumptions: [familyToken],

  instantiate: di => {
    // the general token, as declared
    expectType<ManyFactory<GetGreeting>>(di.injectMany(familyToken));

    // and any of its children, including specifiers computed at runtime
    expectType<GetGreeting>(di.inject(familyToken.for('a')));
    expectType<GetGreeting>(di.inject(familyToken.for(['a', 'b'].join('-'))));

    return () => 'irrelevant';
  },
});

// declaring only a child does not cover the general token
getInjectable2({
  id: 'declaring-child-only',
  consumptions: [familyToken.for('a')],

  instantiate: di => {
    expectType<GetGreeting>(di.inject(familyToken.for('a')));
    expectError(di.injectMany(familyToken));

    return () => 'irrelevant';
  },
});

// --- declarations accept every kind of token ---

getInjectable2({
  id: 'declaring-mixed',

  consumptions: [
    consumedOneToken,
    consumedManyToken,
    consumedMaybeToken,
    cardinalityNonEmptyManyToken,
    abstractHandlerToken,
    someGetNumberInjectionToken,
  ],

  instantiate: di => {
    expectType<GetGreeting>(di.inject(consumedOneToken));
    expectType<NonEmptyManyFactory<GetGreeting>>(
      di.injectMany(cardinalityNonEmptyManyToken),
    );
    expectType<() => GetNumber[]>(di.injectMany(someGetNumberInjectionToken));

    return () => 'irrelevant';
  },
});

// what is not an alias at all is rejected
expectError(
  getInjectable2({
    id: 'declaring-a-string',
    consumptions: ['some-token'],
    instantiate: () => () => 'irrelevant',
  }),
);

expectError(
  getInjectable2({
    id: 'declaring-an-injectable',
    consumptions: [someConsumedInjectable],
    instantiate: () => () => 'irrelevant',
  }),
);

// --- an instantiate written as a named function annotates its di ---

const namedInstantiate = (
  di: ConsumptionDi<typeof consumedOneToken>,
): GetGreeting => {
  const getGreeting = di.inject(consumedOneToken);

  return name => getGreeting(name);
};

getInjectable2({
  id: 'declaring-with-named-instantiate',
  consumptions: [consumedOneToken],
  instantiate: namedInstantiate,
});

// --- the scope is structural, so a token of identical shape slips through ---

// This is why the container enforces declarations at runtime too: nothing at
// the type level separates two tokens with the same factory and cardinality.
const identicallyShapedToken = getInjectionToken2<GetGreeting>({
  id: 'identically-shaped',
  cardinality: 'one',
})();

getInjectable2({
  id: 'declaring-shape',
  consumptions: [consumedOneToken],

  instantiate: di => {
    expectType<GetGreeting>(di.inject(identicallyShapedToken));

    return () => 'irrelevant';
  },
});

// ==== validate ====

expectType<ValidationReport>(di.validate());
expectType<number>(di.validate().verifiedInjectables.count);
expectType<string[]>(di.validate().verifiedInjectables.ids);
expectType<number>(di.validate().unverifiedInjectables.count);
expectType<string[]>(di.validate().unverifiedInjectables.ids);
expectType<UnverifiableConsumption[]>(di.validate().unverifiableConsumptions);
expectType<string>(di.validate().unverifiableConsumptions[0].injectableId);
expectType<string>(di.validate().unverifiableConsumptions[0].consumptionId);

// validating takes no arguments
expectError(di.validate('some-argument'));

// creating a container is unchanged — validation is a container method, not an
// option
expectType<DiContainer>(createContainer('some-container'));

// injectMany works on v1 injection tokens with generic specific injection factories correctly

type SomeSpecifier<Req, Res> = TypedSpecifier<string, { req: Req; res: Res }>;

const someSpecificInjectionToken2 = getInjectionToken<
  (req: unknown) => unknown,
  void,
  <Req, Res>(
    specifier: SomeSpecifier<Req, Res>,
  ) => SpecificInjectionToken<(req: Req) => Res, void>
>({
  id: 'some-specific-2',
});

expectType<((req: unknown) => unknown)[]>(
  di.injectMany(someSpecificInjectionToken2),
);
expectType<((req: string) => number)[]>(
  di.injectMany(
    someSpecificInjectionToken2.for(
      getTypedSpecifier<{ req: string; res: number }>()('some-specifier'),
    ),
  ),
);

// injectManyWithMeta works on v1 injection tokens with generic specific injection factories correctly
expectType<InjectionInstanceWithMeta<(req: unknown) => unknown>[]>(
  di.injectManyWithMeta(someSpecificInjectionToken2),
);
expectType<InjectionInstanceWithMeta<(req: string) => number>[]>(
  di.injectManyWithMeta(
    someSpecificInjectionToken2.for(
      getTypedSpecifier<{ req: string; res: number }>()('some-specifier'),
    ),
  ),
);

// injectWithMeta works on v1 injection tokens with generic specific injection factories correctly
expectType<InjectionInstanceWithMeta<(req: unknown) => unknown>>(
  di.injectWithMeta(someSpecificInjectionToken2),
);
expectType<InjectionInstanceWithMeta<(req: string) => number>>(
  di.injectWithMeta(
    someSpecificInjectionToken2.for(
      getTypedSpecifier<{ req: string; res: number }>()('some-specifier'),
    ),
  ),
);
