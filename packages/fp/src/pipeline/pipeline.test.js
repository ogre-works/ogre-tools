import pipeline from './pipeline';

describe('pipeline', () => {
  it('forwards first argument to second argument as function call and then works like flow', () => {
    const functionStub = x => x + 1;

    const actual = pipeline(1, functionStub, functionStub);

    expect(actual).toBe(3);
  });
});
