import getInjectable from '../getInjectable/getInjectable';
import createContainer from './createContainer';

describe('createContainer.registration', () => {
  it('injects auto-registered injectable without sub-injectables', () => {
    const injectableStub = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-injected-instance',
    });

    const di = createContainer();

    di.register(injectableStub);

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given injectable file with no default export, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        notDefault: 'irrelevant',
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    expect(() => createContainer(() => requireContextStub)).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but no default export',
    );
  });

  it('given injectable file with default export without id, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: 'irrelevant',
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    expect(() => createContainer(() => requireContextStub)).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but default export is of wrong shape',
    );
  });

  it('given injectable file with default export with in but without instantiate, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: {
          id: 'irrelevant',
        },
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    expect(() => createContainer(() => requireContextStub)).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but default export is of wrong shape',
    );
  });

  it('given injectable file with default export of correct shape, when auto-registering, does not throw', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: {
          id: 'some-injectable-id',
          instantiate: () => {},
        },
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    expect(() => createContainer(() => requireContextStub)).not.toThrow();
  });

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

  it('injects auto-registered injectable with a another auto-registered child-injectable', () => {
    const childInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-child-instance',
    });

    const parentInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer();

    di.register(childInjectable, parentInjectable);

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
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
