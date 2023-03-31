import { expectError, expectNotType, expectType } from 'tsd';

import {
  createContainer,
  DiContainer,
  DiContainerForInjection,
  getInjectable,
  getInjectionToken,
  instantiationDecoratorToken,
  createInstantiationTargetDecorator,
  lifecycleEnum,
  Instantiate,
  Injectable,
  injectionDecoratorToken,
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
        expectType<Instantiate<GetNumber, void>>(toBeDecorated);

        const instance = toBeDecorated(di);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

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
        expectType<Instantiate<() => 42, void>>(toBeDecorated);

        const instance = toBeDecorated(di);

        return instance;
      },
    }),

  injectionToken: instantiationDecoratorToken,
});

// given injectable with instantiation paramater and decorator targeting the injectable, typing is ok
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

const decoratorForInjectionParameterInjectable = getInjectable({
  id: 'decorator-for-parameter-injectable',

  instantiate: () => ({
    decorate: toBeDecorated => (di, param) => {
      expectType<unknown>(param);
      expectType<Instantiate<unknown, unknown>>(toBeDecorated);

      const instance = toBeDecorated(di, param);

      return instance;
    },
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

  instantiate: (di, instantiationParameter: string) => {
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
