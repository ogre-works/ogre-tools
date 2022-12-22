import { Get } from 'type-fest';

interface Pipeline {
  <A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
    f5: (arg: Awaited<R4>) => R5,
    f6: (arg: Awaited<R5>) => R6,
    f7: (arg: Awaited<R6>) => R7,
    f8: (arg: Awaited<R7>) => R8,
    f9: (arg: Awaited<R8>) => R9,
  ): ContainsPromise<[A, R1, R2, R3, R4, R5, R6, R7, R8, R9]> extends true
    ? Promise<Awaited<R9>>
    : R9;

  <A, R1, R2, R3, R4, R5, R6, R7, R8>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
    f5: (arg: Awaited<R4>) => R5,
    f6: (arg: Awaited<R5>) => R6,
    f7: (arg: Awaited<R6>) => R7,
    f8: (arg: Awaited<R7>) => R8,
  ): ContainsPromise<[A, R1, R2, R3, R4, R5, R6, R7, R8]> extends true
    ? Promise<Awaited<R8>>
    : R8;

  <A, R1, R2, R3, R4, R5, R6, R7>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
    f5: (arg: Awaited<R4>) => R5,
    f6: (arg: Awaited<R5>) => R6,
    f7: (arg: Awaited<R6>) => R7,
  ): ContainsPromise<[A, R1, R2, R3, R4, R5, R6, R7]> extends true
    ? Promise<Awaited<R7>>
    : R7;

  <A, R1, R2, R3, R4, R5, R6>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
    f5: (arg: Awaited<R4>) => R5,
    f6: (arg: Awaited<R5>) => R6,
  ): ContainsPromise<[A, R1, R2, R3, R4, R5, R6]> extends true
    ? Promise<Awaited<R6>>
    : R6;

  <A, R1, R2, R3, R4, R5>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
    f5: (arg: Awaited<R4>) => R5,
  ): ContainsPromise<[A, R1, R2, R3, R4, R5]> extends true
    ? Promise<Awaited<R5>>
    : R5;

  <A, R1, R2, R3, R4>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
    f4: (arg: Awaited<R3>) => R4,
  ): ContainsPromise<[A, R1, R2, R3, R4]> extends true
    ? Promise<Awaited<R4>>
    : R4;

  <A, R1, R2, R3>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
    f3: (arg: Awaited<R2>) => R3,
  ): ContainsPromise<[A, R1, R2, R3]> extends true ? Promise<Awaited<R3>> : R3;

  <A, R1, R2>(
    arg: A,
    f1: (arg: Awaited<A>) => R1,
    f2: (arg: Awaited<R1>) => R2,
  ): ContainsPromise<[A, R1, R2]> extends true ? Promise<Awaited<R2>> : R2;

  <A, R1>(arg: A, f1: (arg: Awaited<A>) => R1): ContainsPromise<
    [A, R1]
  > extends true
    ? Promise<Awaited<R1>>
    : R1;
}

type ContainsPromise<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends Promise<any>
    ? true
    : ContainsPromise<Tail>
  : false;

export const pipeline: Pipeline;

interface GetFrom {
  <TDictionary, TPropertyPath extends string>(
    dictionary: TDictionary,
    propertyPath: TPropertyPath,
  ): Get<TDictionary, TPropertyPath>;

  <TDictionary>(dictionary: TDictionary): <TPropertyPath extends string>(
    propertyPath: TPropertyPath,
  ) => Get<TDictionary, TPropertyPath>;
}

export const getFrom: GetFrom;
export const getSafeFrom: GetFrom;
