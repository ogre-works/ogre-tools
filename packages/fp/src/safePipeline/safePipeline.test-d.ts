import { expectType, expectNotAssignable } from 'tsd';
import { safePipeline } from './safePipeline';

const pipelineResultWithChanceOfBreak = safePipeline(
  'some-string',
  someParameter => {
    expectType<string>(someParameter);

    return Math.random() > 0.5 ? undefined : String('some-other-string');
  },
  someOtherParameter => {
    expectType<string>(someOtherParameter);

    return 'some-third-string';
  },
);

expectType<string | undefined>(pipelineResultWithChanceOfBreak);
expectNotAssignable<string>(pipelineResultWithChanceOfBreak);

const pipelineResultWithNoChanceOfBreak = safePipeline(
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
expectNotAssignable<undefined>(pipelineResultWithNoChanceOfBreak);

const pipelineResultWithAsyncChanceOfBreak = safePipeline(
  'some-string',
  someParameter => {
    expectType<string>(someParameter);

    return Math.random() > 0.5 ? undefined : String('some-other-string');
  },
  async someOtherParameter => {
    expectType<string>(someOtherParameter);

    return await 'some-third-string';
  },
);

expectType<Promise<string | undefined>>(pipelineResultWithAsyncChanceOfBreak);
expectNotAssignable<Promise<string>>(pipelineResultWithAsyncChanceOfBreak);

const pipelineResultWithNoAsyncChanceOfBreak = safePipeline(
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
expectNotAssignable<Promise<undefined>>(pipelineResultWithNoAsyncChanceOfBreak);
