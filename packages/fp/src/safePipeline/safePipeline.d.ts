interface SafePipeline {
  <A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7, R8, R9]>
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6, R7, R8], R9>;

  <A, R1, R2, R3, R4, R5, R6, R7, R8>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7, R8]>
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6, R7], R8>;

  <A, R1, R2, R3, R4, R5, R6, R7>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7]>
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6], R7>;

  <A, R1, R2, R3, R4, R5, R6>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2, R3, R4, R5, R6]>>
  ): PipelineResult<A, [R1, R2, R3, R4, R5], R6>;

  <A, R1, R2, R3, R4, R5>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2, R3, R4, R5]>>
  ): PipelineResult<A, [R1, R2, R3, R4], R5>;

  <A, R1, R2, R3, R4>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2, R3, R4]>>
  ): PipelineResult<A, [R1, R2, R3], R4>;

  <A, R1, R2, R3>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2, R3]>>
  ): PipelineResult<A, [R1, R2], R3>;

  <A, R1, R2>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2]>>
  ): PipelineResult<A, [R1], R2>;

  <A, R1>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1]>>
  ): PipelineResult<A, [], R1>;
}

type MovingWindow<Types extends [...any[]]> = Types extends [
  infer Left,
  infer Right,
  ...infer Tail,
]
  ? [[Left, Right], ...MovingWindow<[Right, ...Tail]>]
  : [];

type PipelineFunctions<InputsAndOutputs extends [...any[]]> =
  InputsAndOutputs extends [infer Head, ...infer Tail]
    ? Head extends [infer Input, infer Output]
      ? [(arg: Argument<Input>) => Output, ...PipelineFunctions<Tail>]
      : []
    : [];

type PipelineResult<
  TInput,
  TReturnValues extends [...any[]],
  TResult,
> = ContainsPromise<[TInput, ...TReturnValues, TResult]> extends true
  ? Promise<WithCollectivePipelineBreak<TReturnValues, Awaited<TResult>>>
  : WithCollectivePipelineBreak<TReturnValues, TResult>;

type BreakToken = undefined;
type Argument<T> = Exclude<Awaited<T>, BreakToken>;

type WithCollectivePipelineBreak<
  TReturnValues extends [...any[]],
  TResult,
> = ContainsPipelineBreak<[...TReturnValues, TResult]> extends true
  ? TResult | BreakToken
  : TResult;

type ContainsPromise<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends Promise<any>
    ? true
    : ContainsPromise<Tail>
  : false;

type ContainsPipelineBreak<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? BreakToken extends Head
    ? true
    : ContainsPipelineBreak<Tail>
  : false;

export const safePipeline: SafePipeline;
