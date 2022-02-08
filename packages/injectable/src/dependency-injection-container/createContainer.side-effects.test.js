import getInjectable from '../getInjectable/getInjectable';
import getDi from '../test-utils/getDiForUnitTesting';

describe('createContainer.side-effects', () => {
  it('given in side effects are not prevented, when injecting injectable which causes side effects, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const di = getDi(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('given side effects are prevented, when injecting, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-injectable" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented, but then permitted for an injectable, when injecting, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someInjectable);

    di.preventSideEffects();

    di.permitSideEffects(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).not.toThrow();
  });
});
