import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

describe('registeredInLocalScope', () => {
  let di;
  let someInjectionToken;

  beforeEach(() => {
    di = createContainer('some-container');

    someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });
  });

  const getImplementation = id =>
    getInjectable({
      id,
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

  it('given no registrations for the token, when asked from root, is false', () => {
    expect(di.registeredInLocalScope(someInjectionToken)).toBe(false);
  });

  it('given an implementation registered at container level, when asked from root, is true', () => {
    di.register(getImplementation('some-implementation'));

    expect(di.registeredInLocalScope(someInjectionToken)).toBe(true);
  });

  it('given an implementation registered only within a scope, when asked from root, is false, even though registrations exist', () => {
    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    di.register(someScope);
    di.inject(someScope);

    expect(di.hasRegistrations(someInjectionToken)).toBe(true);
    expect(di.registeredInLocalScope(someInjectionToken)).toBe(false);
  });

  it('given an injectable registering an implementation, when asked from within it, is true', () => {
    let registeredInLocalScope;

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));

        registeredInLocalScope = di.registeredInLocalScope(someInjectionToken);
      },
    });

    di.register(someScope);
    di.inject(someScope);

    expect(registeredInLocalScope).toBe(true);
  });

  it('given an implementation registered only at container level, when asked from within an injectable, is false', () => {
    let registeredInLocalScope;

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        registeredInLocalScope = di.registeredInLocalScope(someInjectionToken);
      },
    });

    di.register(getImplementation('some-implementation'), someScope);
    di.inject(someScope);

    expect(registeredInLocalScope).toBe(false);
  });

  it('given an implementation registered by a sibling scope, when asked from another scope, is false', () => {
    let registeredInLocalScopeOfSibling;

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    const someSiblingScope = getInjectable({
      id: 'some-sibling-scope',

      instantiate: di => {
        registeredInLocalScopeOfSibling =
          di.registeredInLocalScope(someInjectionToken);
      },
    });

    di.register(someScope, someSiblingScope);
    di.inject(someScope);
    di.inject(someSiblingScope);

    expect(registeredInLocalScopeOfSibling).toBe(false);
  });

  it('given an injectable2 registering an implementation, when asked from within it, is true', () => {
    let registeredInLocalScope;

    const someInjectionToken2 = getInjectionToken2({
      cardinality: 'zero-or-many',
      id: 'some-injection-token-2',
    })();

    const someImplementation = getInjectable2({
      id: 'some-implementation',
      instantiate: () => () => 'irrelevant',
      injectionToken: someInjectionToken2,
    });

    const someScope = getInjectable2({
      id: 'some-scope',

      instantiate: di => () => {
        di.register(someImplementation);

        registeredInLocalScope = di.registeredInLocalScope(someInjectionToken2);
      },
    });

    di.register(someScope);
    di.inject2(someScope)();

    expect(registeredInLocalScope).toBe(true);
  });

  it('given an implementation registered in a scope, but deregistered, when asked from within the scope, is false', () => {
    let capturedDi;

    const someImplementation = getImplementation('some-implementation');

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        capturedDi = di;

        di.register(someImplementation);
      },
    });

    di.register(someScope);
    di.inject(someScope);

    capturedDi.deregister(someImplementation);

    expect(capturedDi.registeredInLocalScope(someInjectionToken)).toBe(false);
  });

  it('given an implementation deregistered from a scope and re-registered at container level, when asked from within the scope, is false, but from root, is true', () => {
    let capturedDi;

    const someImplementation = getImplementation('some-implementation');

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        capturedDi = di;

        di.register(someImplementation);
      },
    });

    di.register(someScope);
    di.inject(someScope);

    capturedDi.deregister(someImplementation);
    di.register(someImplementation);

    expect(capturedDi.registeredInLocalScope(someInjectionToken)).toBe(false);
    expect(di.registeredInLocalScope(someInjectionToken)).toBe(true);
  });

  it('given an injectable as the alias, when registered at container level, is true from root', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable);

    expect(di.registeredInLocalScope(someInjectable)).toBe(true);
  });
});
