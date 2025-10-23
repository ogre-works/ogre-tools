import { expectError, expectType } from "tsd";

import { createContainer, getInjectionToken, type InjectionInstanceWithMeta } from "@lensapp/injectable";

import type { IComputedValue } from "mobx";

import {
  computedInjectManyInjectionToken,
  computedInjectManyWithMetaInjectionToken,
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
