import asyncFn from '@async-fn/jest';
import flow, { pipelineBreak } from './flow';

describe('flow', () => {
  it('given initialized with multiple functions, when called, passes only first argument to first function', async () => {
    const functionMock = jest.fn();

    const flowInstance = flow(
      functionMock,
      () => {},
      () => {},
    );

    await flowInstance('some argument', 'some irrelevant argument');

    expect(functionMock).toHaveBeenCalledWith('some argument');
  });

  it('given initialized with multiple functions, when called, passes return value of a function to next function', async () => {
    const nextFunctionMock = jest.fn();

    const flowInstance = flow(
      () => {},
      () => 'some return value',
      nextFunctionMock,
    );

    await flowInstance();

    expect(nextFunctionMock).toHaveBeenCalledWith('some return value');
  });

  it('given initialized with multiple functions, when called, returns value from last function', async () => {
    const flowInstance = flow(
      () => {},
      () => {},
      () => 'some return value',
    );

    const actual = await flowInstance();

    expect(actual).toBe('some return value');
  });

  it('given initialized with multiple functions containing an async-function and called, when the async function resolves, passes return value of a function to next function', async () => {
    const asyncFunctionMock = asyncFn();
    const nextFunctionMock = jest.fn();

    const flowInstance = flow(() => {}, asyncFunctionMock, nextFunctionMock);

    flowInstance();

    await asyncFunctionMock.resolve('some return value');

    expect(nextFunctionMock).toHaveBeenCalledWith('some return value');
  });

  it('given initialized with multiple functions containing an async-function and called, when the async function has not resolved yet, does not invoke the next function', () => {
    const asyncFunctionMock = asyncFn();
    const nextFunctionMock = jest.fn();

    const flowInstance = flow(() => {}, asyncFunctionMock, nextFunctionMock);

    flowInstance();

    expect(nextFunctionMock).not.toHaveBeenCalled();
  });

  it('given initialized with multiple functions containing an async-function and called, when all the async functions resolve, resolves with the return value of the last function', async () => {
    const asyncFunctionMock = asyncFn();

    const flowInstance = flow(() => {}, asyncFunctionMock);

    const actualPromise = flowInstance();

    await asyncFunctionMock.resolve('some return value');

    const actual = await actualPromise;

    expect(actual).toBe('some return value');
  });

  describe('given initialized with multiple sync functions, when one of the functions return pipeline break', () => {
    let actual;
    let asyncFunctionMock;

    beforeEach(() => {
      asyncFunctionMock = jest.fn();

      const flowInstance = flow(() => pipelineBreak, asyncFunctionMock);

      actual = flowInstance();
    });

    it('remaining functions do not get called', () => {
      expect(asyncFunctionMock).not.toHaveBeenCalled();
    });

    it('resolves with pipeline break', () => {
      expect(actual).toBe(pipelineBreak);
    });
  });

  describe('given initialized with multiple async functions, when one of the functions resolve to pipeline break', () => {
    let actualPromise;
    let asyncFunctionMock;

    beforeEach(() => {
      asyncFunctionMock = jest.fn();

      const flowInstance = flow(
        () => Promise.resolve(pipelineBreak),
        asyncFunctionMock,
      );

      actualPromise = flowInstance();
    });

    it('remaining functions do not get called', () => {
      expect(asyncFunctionMock).not.toHaveBeenCalled();
    });

    it('resolves with pipeline break', async () => {
      const actual = await actualPromise;

      expect(actual).toBe(pipelineBreak);
    });
  });

  it('given function which returns array including promises, returns array with sync values', async () => {
    const actual = await flow(() => [
      'some-sync-value',
      Promise.resolve('some-async-value'),
    ])();

    expect(actual).toEqual(['some-sync-value', 'some-async-value']);
  });
});
