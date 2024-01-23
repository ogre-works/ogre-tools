import { expectType, expectNotAssignable } from 'tsd';
import { pipeline, pipelineBreak } from './pipeline';

const pipelineResultWithChanceOfBreak = pipeline(
  'some-string',
  someParameter => {
    expectType<string>(someParameter);

    return Math.random() > 0.5 ? pipelineBreak : String('some-other-string');
  },
  someOtherParameter => {
    expectType<string>(someOtherParameter);

    return 'some-third-string';
  },
);

expectType<string | typeof pipelineBreak>(pipelineResultWithChanceOfBreak);
expectNotAssignable<string>(pipelineResultWithChanceOfBreak);

const pipelineResultWithNoChanceOfBreak = pipeline(
  'some-string',
  someParameter => {
    expectType<string>(someParameter);

    return 'some-other-string';
  },
  someOtherParameter => {
    expectType<string>(someOtherParameter);

    return 'some-third-string';
  },
);

expectType<string>(pipelineResultWithNoChanceOfBreak);
expectNotAssignable<typeof pipelineBreak>(pipelineResultWithNoChanceOfBreak);

const pipelineResultWithAsyncChanceOfBreak = pipeline(
  'some-string',
  someParameter => {
    expectType<string>(someParameter);

    return Math.random() > 0.5 ? pipelineBreak : String('some-other-string');
  },
  async someOtherParameter => {
    expectType<string>(someOtherParameter);

    return await 'some-third-string';
  },
);

expectType<Promise<string | typeof pipelineBreak>>(
  pipelineResultWithAsyncChanceOfBreak,
);
expectNotAssignable<Promise<string>>(pipelineResultWithAsyncChanceOfBreak);

const pipelineResultWithNoAsyncChanceOfBreak = pipeline(
  'some-string',
  async someParameter => {
    expectType<string>(someParameter);

    return await 'some-other-string';
  },
  someOtherParameter => {
    expectType<string>(someOtherParameter);

    return 'some-third-string';
  },
);

expectType<Promise<string>>(pipelineResultWithNoAsyncChanceOfBreak);
expectNotAssignable<Promise<typeof pipelineBreak>>(
  pipelineResultWithNoAsyncChanceOfBreak,
);

const pipelineResultWithConditionalType = pipeline(
  'some-string',

  someParameter => {
    expectType<string>(someParameter);

    return 1 > 2
      ? Promise.resolve('some-resolved-string')
      : 'some-other-string';
  },

  someParameter => {
    expectType<string>(someParameter);

    return someParameter;
  },
);

expectType<Promise<string>>(pipelineResultWithConditionalType);

const pipelineResultWithConditionalTypeAndBreak = pipeline(
  'some-string',

  someParameter => {
    expectType<string>(someParameter);

    return 1 > 2
      ? Promise.resolve('some-resolved-string')
      : 'some-other-string';
  },

  () => pipelineBreak,
);

expectType<Promise<symbol>>(pipelineResultWithConditionalTypeAndBreak);

const pipelineUsingEmptyObject = pipeline({}, x => x);

expectNotAssignable<{ then: any }>(pipelineUsingEmptyObject);
