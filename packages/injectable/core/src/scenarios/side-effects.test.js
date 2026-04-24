import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '@ogre-tools/injectable';

describe('createContainer.side-effects', () => {
  it('when injecting injectable which causes side effects, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-injectable" from "some-container" when side-effects are prevented.',
    );
  });

  it('given all side effects are permitted, when injecting injectable which causes side effects, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'some-instance',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.permitSideEffects();

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('given side effects are permitted for an injectable, when injecting, does not throw', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      causesSideEffects: true,
      instantiate: () => 'irrelevant',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.permitSideEffects(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).not.toThrow();
  });

  it('given side effects are permitted for an injection token, when injecting, does not throw', () => {
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

    di.permitSideEffects(someInjectionToken);

    expect(() => {
      di.inject(someInjectionToken);
    }).not.toThrow();
  });

  it('given side effects are permitted for an injection token, when injecting many, does not throw', () => {
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

    di.permitSideEffects(someInjectionToken);

    expect(() => {
      di.injectMany(someInjectionToken);
    }).not.toThrow();
  });
});
