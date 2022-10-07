import { compose, getComposable, isComposedOf } from './composable';

interface SomeType {
  someProperty: string;
}

describe('composable', () => {
  it('given a composable, when an instance is created, type of instance can be narrowed to type of composable', () => {
    const someComposable = getComposable<SomeType>('some-composable');

    // Notice: type is "unknown" before "composes" narrows the typing down.
    const instance: unknown = someComposable.create({
      someProperty: 'some-string',
    });

    if (someComposable.composes(instance)) {
      // Notice: instead of unknown, type is defined as having someProperty.
      expect(instance.someProperty).toBe('some-string');
    }

    expect.assertions(1);
  });

  it('given flat composition of composabled, when an instance is created, type of instance can be narrowed to type of composable', () => {
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
