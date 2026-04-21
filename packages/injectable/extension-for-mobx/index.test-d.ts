import { expectError, expectType } from "tsd";

import { createContainer, getInjectionToken, getInjectionToken2, type InjectionInstanceWithMeta } from "@ogre-tools/injectable";

import type { IComputedValue } from "mobx";

import {
  computedInjectMany2InjectionToken,
  computedInjectManyInjectionToken,
  computedInjectManyWithMeta2InjectionToken,
  computedInjectManyWithMetaInjectionToken,
  computedInjectMaybe2InjectionToken,
  computedInjectMaybeInjectionToken,
} from ".";

const di = createContainer("some-container");

export const someInjectionToken = getInjectionToken<string>({
  id: "some-injection-token",
});

// Given computedInjectMany, typing is ok.
const computedInjectMany = di.inject(computedInjectManyInjectionToken);

expectType<IComputedValue<string[]>>(computedInjectMany(someInjectionToken));

// Given computedInjectManyWithMeta, typing is ok.
const computedInjectManyWithMeta = di.inject(computedInjectManyWithMetaInjectionToken);

expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(computedInjectManyWithMeta(someInjectionToken));

// Given token with an instantiation parameter...
export const someInjectionTokenWithParameter = getInjectionToken<string, number>({
  id: "irrelevant",
});

// ...when using computedInjectMany, typing is ok.
expectType<IComputedValue<string[]>>(computedInjectMany(someInjectionTokenWithParameter, 42));

// ...when using computedInjectManyWithMeta, typing is ok.
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter, 42),
);

// ...when using a more specific computedInjectManyWithMeta, typing is ok.
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter.for("some-speciality"), 42),
);

expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter.for("some-speciality"), 42),
);

// ...given instantiation parameter of wrong type, when using computedInjectMany, typing is not ok.
expectError(computedInjectMany(someInjectionTokenWithParameter), "some-string-instead-of-number");

// ...given instantiation parameter of wrong type, when using computedInjectManyWithMeta, typing is not ok.
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter, "some-string-instead-of-number"));

// ...given instantiation parameter of wrong type, when using computedInjectMany, typing is not ok.
expectError(computedInjectMany(someInjectionTokenWithParameter), "some-string-instead-of-number");

// ...given instantiation parameter of wrong type, when using computedInjectManyWithMeta, typing is not ok.
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter, "some-string-instead-of-number"));

// ...given no instantiation parameter, when using computedInjectMany, typing is not ok.
expectError(computedInjectMany(someInjectionTokenWithParameter));

// ...given no instantiation parameter, when using computedInjectManyWithMeta, typing is not ok.
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter));

// computedInjectMaybe
const computedInjectMaybe = di.inject(computedInjectMaybeInjectionToken);

// given injection token without parameter, when used without parameter, typing is ok
expectType<IComputedValue<string | undefined>>(computedInjectMaybe(someInjectionToken));

// given injection token without parameter, when used with parameter, typing is not ok
expectError(computedInjectMaybe(someInjectionToken, "some-non-wanted-parameter"));

// given injection token with parameter, when used with parameter, typing is ok
expectType<IComputedValue<string | undefined>>(computedInjectMaybe(someInjectionTokenWithParameter, 42));

// given injection token with parameter, when used without parameter, typing is ok
expectError(computedInjectMaybe(someInjectionTokenWithParameter));

// ======================================================================
// InjectionToken2 support
// ======================================================================

// Given InjectionToken2 without parameters
const someToken2 = getInjectionToken2<() => string>({ id: "some-token2" });

// computedInjectMany with InjectionToken2
expectType<IComputedValue<string[]>>(computedInjectMany(someToken2));

// computedInjectManyWithMeta with InjectionToken2
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(computedInjectManyWithMeta(someToken2));

// computedInjectMaybe with InjectionToken2
expectType<IComputedValue<string | undefined>>(computedInjectMaybe(someToken2));

// Given InjectionToken2 with parameters
const someParamToken2 = getInjectionToken2<(key: string) => number>({ id: "some-param-token2" });

// computedInjectMany with parametric InjectionToken2
expectType<IComputedValue<number[]>>(computedInjectMany(someParamToken2, "some-key"));

// computedInjectManyWithMeta with parametric InjectionToken2
expectType<IComputedValue<InjectionInstanceWithMeta<number>[]>>(computedInjectManyWithMeta(someParamToken2, "some-key"));

// computedInjectMaybe with parametric InjectionToken2
expectType<IComputedValue<number | undefined>>(computedInjectMaybe(someParamToken2, "some-key"));

// wrong param type for InjectionToken2 is a type error
expectError(computedInjectMany(someParamToken2, 42));
expectError(computedInjectManyWithMeta(someParamToken2, 42));
expectError(computedInjectMaybe(someParamToken2, 42));

// missing param for parametric InjectionToken2 is a type error
expectError(computedInjectMany(someParamToken2));
expectError(computedInjectManyWithMeta(someParamToken2));
expectError(computedInjectMaybe(someParamToken2));

// ======================================================================
// Factory-shape 2 variants
// ======================================================================

const computedInjectMany2 = di.inject(computedInjectMany2InjectionToken);
const computedInjectManyWithMeta2 = di.inject(computedInjectManyWithMeta2InjectionToken);
const computedInjectMaybe2 = di.inject(computedInjectMaybe2InjectionToken);

// v1 token without parameter → factory (void-arg; invokable with no args)
expectType<(param_0: void) => IComputedValue<string[]>>(
  computedInjectMany2(someInjectionToken),
);
expectType<(param_0: void) => IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta2(someInjectionToken),
);
expectType<(param_0: void) => IComputedValue<string | undefined>>(
  computedInjectMaybe2(someInjectionToken),
);

// v1 token with parameter → one-arg factory
expectType<(param: number) => IComputedValue<string[]>>(
  computedInjectMany2(someInjectionTokenWithParameter),
);
expectType<(param: number) => IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta2(someInjectionTokenWithParameter),
);
expectType<(param: number) => IComputedValue<string | undefined>>(
  computedInjectMaybe2(someInjectionTokenWithParameter),
);

// v2 token without parameters → zero-arg factory
expectType<() => IComputedValue<string[]>>(computedInjectMany2(someToken2));
expectType<() => IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta2(someToken2),
);
expectType<() => IComputedValue<string | undefined>>(computedInjectMaybe2(someToken2));

// v2 token with parameters → param-accepting factory
expectType<(key: string) => IComputedValue<number[]>>(
  computedInjectMany2(someParamToken2),
);
expectType<(key: string) => IComputedValue<InjectionInstanceWithMeta<number>[]>>(
  computedInjectManyWithMeta2(someParamToken2),
);
expectType<(key: string) => IComputedValue<number | undefined>>(
  computedInjectMaybe2(someParamToken2),
);

// wrong arg type at factory invocation is a type error
expectError(computedInjectMany2(someParamToken2)(42));
expectError(computedInjectManyWithMeta2(someParamToken2)(42));
expectError(computedInjectMaybe2(someParamToken2)(42));
