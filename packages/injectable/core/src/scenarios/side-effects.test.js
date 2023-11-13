import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '@lensapp/injectable';

describe('createContainer.side-effects', () => {
  it('given in side effects are not prevented, when injecting injectable which causes side effects, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('given side effects are prevented, when injecting, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.preventSideEffects();

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-container" -> "some-injectable" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented, but then permitted for an injectable, when injecting, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.preventSideEffects();

    di.permitSideEffects(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).not.toThrow();
  });

  it('given side effects are prevented, but then permitted for an injection token, when injecting, does not throw', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.preventSideEffects();

    di.permitSideEffects(someInjectionToken);

    expect(() => {
      di.inject(someInjectionToken);
    }).not.toThrow();
  });

  it('given side effects are prevented, but then permitted for an injection token, when injecting many, does not throw', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'irrelevant-1',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    const someOtherInjectable = getInjectable({
      id: 'irrelevant-2',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someOtherInjectable);

    di.preventSideEffects();

    di.permitSideEffects(someInjectionToken);

    expect(() => {
      di.injectMany(someInjectionToken);
    }).not.toThrow();
  });
});
