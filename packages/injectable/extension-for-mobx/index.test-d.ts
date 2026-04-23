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

// ---------------------------------------------------------------------------
// Shared tokens used across scenarios
// ---------------------------------------------------------------------------

// v1 InjectionToken without instantiation parameter
export const someInjectionToken = getInjectionToken<string>({
  id: "some-injection-token",
});

// v1 InjectionToken with instantiation parameter
export const someInjectionTokenWithParameter = getInjectionToken<string, number>({
  id: "some-injection-token-with-parameter",
});

// v2 InjectionToken2 for a non-parametric factory
const someToken2 = getInjectionToken2<() => string>({ id: "some-token2" });

// v2 InjectionToken2 for a parametric factory
const someParamToken2 = getInjectionToken2<(key: string) => number>({
  id: "some-param-token2",
});

// v2 InjectionToken2 for a GENERIC factory — its T is decided at invocation time.
// Explicit ManyFactory carries <T> through the many-shape, so helpers that
// return ManyFactory preserve the generic at call time.
const someGenericToken2 = getInjectionToken2<
  <T>(value: T) => T,
  <T>(value: T) => T[]
>({
  id: "some-generic-token2",
});

// ===========================================================================
// SECTION 1
// Instance-returning helpers (computedInjectMany / WithMeta / Maybe) with v1 tokens.
// These helpers take `(token, ...params)` and return an IComputedValue of the
// instance array / meta-wrapped array / maybe-instance.
// ===========================================================================

const computedInjectMany = di.inject(computedInjectManyInjectionToken);
const computedInjectManyWithMeta = di.inject(computedInjectManyWithMetaInjectionToken);
const computedInjectMaybe = di.inject(computedInjectMaybeInjectionToken);

// --- v1 token without instantiation parameter -----------------------------

// Non-param v1 token: no trailing arg, yields IComputedValue<I[]>
expectType<IComputedValue<string[]>>(computedInjectMany(someInjectionToken));

// Non-param v1 token: yields IComputedValue<InjectionInstanceWithMeta<I>[]>
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionToken),
);

// Non-param v1 token: maybe yields IComputedValue<I | undefined>
expectType<IComputedValue<string | undefined>>(computedInjectMaybe(someInjectionToken));

// Extra param for a non-param token is a type error
expectError(computedInjectMaybe(someInjectionToken, "some-non-wanted-parameter"));

// --- v1 token with instantiation parameter --------------------------------

// Parametric v1 token: trailing arg must match the token's parameter type
expectType<IComputedValue<string[]>>(computedInjectMany(someInjectionTokenWithParameter, 42));
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter, 42),
);
expectType<IComputedValue<string | undefined>>(
  computedInjectMaybe(someInjectionTokenWithParameter, 42),
);

// Specific token via `.for()` behaves like its general form
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter.for("some-speciality"), 42),
);

// Wrong param type is a type error
expectError(computedInjectMany(someInjectionTokenWithParameter, "wrong"));
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter, "wrong"));
expectError(computedInjectMaybe(someInjectionTokenWithParameter, "wrong"));

// Missing a required param is a type error
expectError(computedInjectMany(someInjectionTokenWithParameter));
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter));
expectError(computedInjectMaybe(someInjectionTokenWithParameter));

// ===========================================================================
// SECTION 2
// Same instance-returning helpers with non-generic InjectionToken2.
// Variadic trailing params are inferred from Parameters<F>; the return type
// unwraps ReturnType<F>.
// ===========================================================================

// --- v2 non-parametric token ----------------------------------------------

expectType<IComputedValue<string[]>>(computedInjectMany(someToken2));
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someToken2),
);
expectType<IComputedValue<string | undefined>>(computedInjectMaybe(someToken2));

// --- v2 parametric token --------------------------------------------------

expectType<IComputedValue<number[]>>(computedInjectMany(someParamToken2, "some-key"));
expectType<IComputedValue<InjectionInstanceWithMeta<number>[]>>(
  computedInjectManyWithMeta(someParamToken2, "some-key"),
);
expectType<IComputedValue<number | undefined>>(
  computedInjectMaybe(someParamToken2, "some-key"),
);

// Wrong param type at the trailing arg is a type error
expectError(computedInjectMany(someParamToken2, 42));
expectError(computedInjectManyWithMeta(someParamToken2, 42));
expectError(computedInjectMaybe(someParamToken2, 42));

// Missing required param is a type error
expectError(computedInjectMany(someParamToken2));
expectError(computedInjectManyWithMeta(someParamToken2));
expectError(computedInjectMaybe(someParamToken2));

// ===========================================================================
// SECTION 3
// Instance-returning helpers with a GENERIC InjectionToken2 factory.
//
// Known TS limitation: the helper's signature pipes F through `Parameters<F>`
// / `ReturnType<F>`, which instantiates any generic in F to its constraint.
// For `F = <T>(value: T) => T`, that yields `[unknown]` / `unknown`.
//
// This is inherent to the utility-type transform; a caller who needs generic
// flow must go through `di.inject2(tokenItself)` and invoke the factory
// directly (see SECTION 7).
// ===========================================================================

// Trailing arg is accepted as `unknown` (the constraint of T)
expectType<IComputedValue<unknown[]>>(
  computedInjectMany(someGenericToken2, "any-literal"),
);
expectType<IComputedValue<InjectionInstanceWithMeta<unknown>[]>>(
  computedInjectManyWithMeta(someGenericToken2, 123),
);
expectType<IComputedValue<unknown | undefined>>(
  computedInjectMaybe(someGenericToken2, { anything: true }),
);

// Because the trailing arg is typed `unknown`, no literal type can be
// "wrong" — TS accepts any value. Missing the arg is still a type error.
expectError(computedInjectMany(someGenericToken2));
expectError(computedInjectManyWithMeta(someGenericToken2));
expectError(computedInjectMaybe(someGenericToken2));

// ===========================================================================
// SECTION 4
// Factory-shape helpers (computedInjectMany2 / WithMeta2 / Maybe2) with v1
// tokens. These take `(token)` and RETURN a factory whose signature mirrors
// the token's parameter shape. Invoking the factory returns the unwrapped
// instance array / meta-wrapped array / maybe-instance — no `.get()` at the
// call site; observation still flows via the enclosing reactive context.
// Same relationship as `di.inject` vs `di.inject2`.
// ===========================================================================

const computedInjectMany2 = di.inject2(computedInjectMany2InjectionToken);
const computedInjectManyWithMeta2 = di.inject2(computedInjectManyWithMeta2InjectionToken);
const computedInjectMaybe2 = di.inject2(computedInjectMaybe2InjectionToken);

// --- v1 token without instantiation parameter -----------------------------

// The returned factory is `(param_0: void) => ...` — a single void-typed
// parameter that is assignable from `undefined` / omitted at the call site.
expectType<(param_0: void) => string[]>(
  computedInjectMany2(someInjectionToken),
);
expectType<(param_0: void) => InjectionInstanceWithMeta<string>[]>(
  computedInjectManyWithMeta2(someInjectionToken),
);
expectType<(param_0: void) => string | undefined>(
  computedInjectMaybe2(someInjectionToken),
);

// --- v1 token with instantiation parameter --------------------------------

// The returned factory accepts the token's param type
expectType<(param: number) => string[]>(
  computedInjectMany2(someInjectionTokenWithParameter),
);
expectType<(param: number) => InjectionInstanceWithMeta<string>[]>(
  computedInjectManyWithMeta2(someInjectionTokenWithParameter),
);
expectType<(param: number) => string | undefined>(
  computedInjectMaybe2(someInjectionTokenWithParameter),
);

// Wrong arg type at factory invocation is a type error
expectError(computedInjectMany2(someInjectionTokenWithParameter)("wrong"));
expectError(computedInjectManyWithMeta2(someInjectionTokenWithParameter)("wrong"));
expectError(computedInjectMaybe2(someInjectionTokenWithParameter)("wrong"));

// ===========================================================================
// SECTION 5
// Factory-shape helpers with non-generic InjectionToken2.
//
// computedInjectMany2 returns the token's ManyFactory (MF) — the sibling
// generic on InjectionToken2<F, MF>. For non-generic tokens MF is auto-
// derived as `(...Parameters<F>) => ReturnType<F>[]`, so the observable
// shape matches that derivation.
//
// WithMeta2 / Maybe2 have no ManyFactory analog and synthesize from
// Parameters<F> / ReturnType<F> directly (same limitation as
// InjectManyWithMeta2 / InjectWithMeta2 in the core package).
// ===========================================================================

// --- v2 non-parametric token ----------------------------------------------

expectType<() => string[]>(computedInjectMany2(someToken2));
expectType<() => InjectionInstanceWithMeta<string>[]>(
  computedInjectManyWithMeta2(someToken2),
);
expectType<() => string | undefined>(computedInjectMaybe2(someToken2));

// --- v2 parametric token --------------------------------------------------

expectType<(key: string) => number[]>(
  computedInjectMany2(someParamToken2),
);
expectType<(key: string) => InjectionInstanceWithMeta<number>[]>(
  computedInjectManyWithMeta2(someParamToken2),
);
expectType<(key: string) => number | undefined>(
  computedInjectMaybe2(someParamToken2),
);

// Wrong arg type at factory invocation is a type error
expectError(computedInjectMany2(someParamToken2)(42));
expectError(computedInjectManyWithMeta2(someParamToken2)(42));
expectError(computedInjectMaybe2(someParamToken2)(42));

// ===========================================================================
// SECTION 6
// Factory-shape helpers with a GENERIC InjectionToken2 factory.
//
// computedInjectMany2 uses the token's ManyFactory (MF) generic — when MF is
// declared generic, the returned callable IS that generic function and `<T>`
// is decided at each invocation. WithMeta2 / Maybe2 still collapse to the
// constraint (`unknown`) because they have no ManyFactory analog.
// ===========================================================================

// --- computedInjectMany2: generic <T> preserved via ManyFactory -----------

// The key assertion: a generic ManyFactory stays generic end-to-end, so the
// inferred T at the call site flows straight through to the returned T[].
expectType<boolean[]>(computedInjectMany2(someGenericToken2)(false));
expectType<string[]>(computedInjectMany2(someGenericToken2)("hi"));
expectType<number[]>(computedInjectMany2(someGenericToken2)(42));

type WrapFactory = <T>(value: T) => { wrapped: T };
type WrapManyFactory = <T>(value: T) => { wrapped: T }[];
const wrapToken2 = getInjectionToken2<WrapFactory, WrapManyFactory>({ id: "wrap-2" });

const wrapMany = computedInjectMany2(wrapToken2);
expectType<WrapManyFactory>(wrapMany);

// Generic decided per-call — NOT collapsed to unknown
expectType<{ wrapped: string }[]>(wrapMany("str" as string));
expectType<{ wrapped: number }[]>(wrapMany(42 as number));
expectType<{ wrapped: "lit" }[]>(wrapMany("lit"));

// Non-generic tuple token — the user's motivating example:
// `instances` types as `[string, string][]` matching both params being strings
const tupleToken2 = getInjectionToken2<(a: string, b: string) => [string, string]>({
  id: "tuple-2",
});
expectType<(a: string, b: string) => [string, string][]>(
  computedInjectMany2(tupleToken2),
);
expectError(computedInjectMany2(tupleToken2)("x", 123));

// --- WithMeta2 / Maybe2: generic T still collapses to unknown -------------

// Factory collapses to `(value: unknown) => ...unknown...`
expectType<(value: unknown) => InjectionInstanceWithMeta<unknown>[]>(
  computedInjectManyWithMeta2(someGenericToken2),
);
expectType<(value: unknown) => unknown | undefined>(
  computedInjectMaybe2(someGenericToken2),
);

// ===========================================================================
// SECTION 7
// di.inject2 directly on the 2-variant injection tokens.
//
// Because computedInjectMany2InjectionToken is itself an InjectionToken2<F>,
// di.inject2 returns the function type F verbatim — overloads are preserved
// (in contrast to `di.inject2` on a v1 token, which produces a synthesized
// `(...p: Parameters<F>) => ReturnType<F>` wrapper that would flatten them).
//
// This is why these helpers are declared via getInjectable2/getInjectionToken2.
// ===========================================================================

// The returned function retains its multi-overload shape: v1 vs v2 tokens
// are distinguished at call site.
expectType<string[]>(computedInjectMany2(someInjectionToken)());
expectType<string[]>(computedInjectMany2(someToken2)());
expectType<number[]>(computedInjectMany2(someParamToken2)("x"));

// Note on `di.inject(X, token)(...args)` sugar: it runs correctly but cannot
// carry generics. `di.inject` routes through InjectInjectable2, which reads
// Parameters<F> / ReturnType<F> off ComputedInjectMany2's v2 overload — a
// generic signature whose `MF` widens to `any` under Parameters/ReturnType.
// For generic preservation use `di.inject2(X)(token)(...args)`, which returns
// ComputedInjectMany2 verbatim and lets overload resolution run at call site.
