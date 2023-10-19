import { safePipeline } from './safePipeline';

describe('safePipeline', () => {
  it('forwards first argument to second argument as function call and then works like flow', () => {
    const functionStub = x => x + 1;

    const actual = safePipeline(1, functionStub, functionStub);

    expect(actual).toBe(3);
  });

  describe('given one of the functions returns undefined', () => {
    let someSucceedingFunction;
    let actual;

    beforeEach(() => {
      someSucceedingFunction = jest.fn();

      actual = safePipeline(
        'irrelevant',
        () => undefined,
        someSucceedingFunction,
      );
    });

    it("doesn't call the following functions", () => {
      expect(someSucceedingFunction).not.toHaveBeenCalled();
    });

    it('returns undefined', () => {
      expect(actual).toBe(undefined);
    });
  });
});
