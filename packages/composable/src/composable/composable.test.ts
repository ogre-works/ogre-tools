import { compose, getComposable, isComposedOf } from './composable';

describe('composable', () => {
  it('given composables, when an instance is composed, type of instance can be narrowed to type of composable', () => {
    const someComposable =
      getComposable<{ someProperty: string }>('some-composable');

    const someOtherComposable = getComposable<{ someOtherProperty: number }>(
      'some-other-composable',
    );

    const getInstance = compose(someComposable, someOtherComposable);

    // Notice: type is "unknown" before isComposedOf narrows the typing down.
    const instance: unknown = getInstance({
      someProperty: 'some-string',
      someOtherProperty: 42,
    });

    const isSomeComposable = isComposedOf(someComposable);

    if (isSomeComposable(instance)) {
      // Notice: instead of unknown, type is defined as having someProperty.
      expect(instance.someProperty).toBe('some-string');
    }

    expect.assertions(1);
  });
});
