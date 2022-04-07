import getInjectable from '../getInjectable/getInjectable';
import createContainer from './createContainer';

describe('createContainer.registration', () => {
  it('given manually registered injectable, when injecting, injects', () => {
    const di = createContainer();

    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-instance');
  });

  it('given injectables with same ID, when registering, throws', () => {
    const di = createContainer();

    const someInjectable = getInjectable({
      id: 'some-id',
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-id',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable);

    expect(() => {
      di.register(someOtherInjectable);
    }).toThrow('Tried to register multiple injectables for ID "some-id"');
  });

  it('given an injectable does not specify id, when manually registered, throws', () => {
    const di = createContainer();

    const someInjectable = getInjectable({
      id: undefined,
      instantiate: () => 'irrelevant',
    });

    expect(() => {
      di.register(someInjectable);
    }).toThrow('Tried to register injectable without ID.');
  });

  it('when injecting non-registered injectable, throws', () => {
    const someNonRegisteredInjectable = getInjectable({
      id: 'some-non-registered-injectable',
    });

    const di = createContainer();

    expect(() => {
      di.inject(someNonRegisteredInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-non-registered-injectable".',
    );
  });

  it('when injecting nested non-registered injectable, throws with chain of injectables', () => {
    const someNonRegisteredInjectable = getInjectable({
      id: 'some-non-registered-injectable',
      instantiate: () => 'irrelevant',
    });

    const someRegisteredInjectable = getInjectable({
      id: 'some-registered-injectable',
      instantiate: di => di.inject(someNonRegisteredInjectable),
    });

    const di = createContainer();

    di.register(someRegisteredInjectable);

    expect(() => {
      di.inject(someRegisteredInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-registered-injectable" -> "some-non-registered-injectable".',
    );
  });
});
