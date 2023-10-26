export interface PipelineFor<BreakToken> {
  <A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7, R8, R9]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6, R7, R8], R9, BreakToken>;

  <A, R1, R2, R3, R4, R5, R6, R7, R8>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7, R8]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6, R7], R8, BreakToken>;

  <A, R1, R2, R3, R4, R5, R6, R7>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6, R7]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5, R6], R7, BreakToken>;

  <A, R1, R2, R3, R4, R5, R6>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5, R6]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3, R4, R5], R6, BreakToken>;

  <A, R1, R2, R3, R4, R5>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4, R5]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3, R4], R5, BreakToken>;

  <A, R1, R2, R3, R4>(
    arg: A,
    ...functions: PipelineFunctions<
      MovingWindow<[A, R1, R2, R3, R4]>,
      BreakToken
    >
  ): PipelineResult<A, [R1, R2, R3], R4, BreakToken>;

  <A, R1, R2, R3>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2, R3]>, BreakToken>
  ): PipelineResult<A, [R1, R2], R3, BreakToken>;

  <A, R1, R2>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1, R2]>, BreakToken>
  ): PipelineResult<A, [R1], R2, BreakToken>;

  <A, R1>(
    arg: A,
    ...functions: PipelineFunctions<MovingWindow<[A, R1]>, BreakToken>
  ): PipelineResult<A, [], R1, BreakToken>;
}

type MovingWindow<Types extends [...any[]]> = Types extends [
  infer Left,
  infer Right,
  ...infer Tail
]
  ? [[Left, Right], ...MovingWindow<[Right, ...Tail]>]
  : [];

type PipelineFunctions<
  InputsAndOutputs extends [...any[]],
  BreakToken,
> = InputsAndOutputs extends [infer Head, ...infer Tail]
  ? Head extends [infer Input, infer Output]
    ? [
        (arg: Argument<Input, BreakToken>) => Output,
        ...PipelineFunctions<Tail, BreakToken>
      ]
    : []
  : [];

type PipelineResult<
  TInput,
  TReturnValues extends [...any[]],
  TResult,
  BreakToken,
> = ContainsPromise<[TInput, ...TReturnValues, TResult]> extends true
  ? Promise<
      WithCollectivePipelineBreak<TReturnValues, Awaited<TResult>, BreakToken>
    >
  : WithCollectivePipelineBreak<TReturnValues, TResult, BreakToken>;

type Argument<T, BreakToken> = Exclude<Awaited<T>, BreakToken>;

type WithCollectivePipelineBreak<
  TReturnValues extends [...any[]],
  TResult,
  BreakToken,
> = ContainsPipelineBreak<[...TReturnValues, TResult], BreakToken> extends true
  ? TResult | BreakToken
  : TResult;

type ContainsPromise<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail
]
  ? Head extends Promise<any>
    ? true
    : ContainsPromise<Tail>
  : false;

type ContainsPipelineBreak<T extends [...any[]], BreakToken> = T extends [
  infer Head,
  ...infer Tail
]
  ? BreakToken extends Head
    ? true
    : ContainsPipelineBreak<Tail, BreakToken>
  : false;
