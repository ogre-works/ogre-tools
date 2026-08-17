import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

describe('registeredInLocalScopeSubtree', () => {
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
    expect(di.registeredInLocalScopeSubtree(someInjectionToken)).toBe(false);
  });

  it('given an implementation registered by a nested scope, when asked from the outer scope, is true in subtree, but false in local scope', () => {
    let capturedOuterDi;

    const someNestedScope = getInjectable({
      id: 'some-nested-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    const someOuterScope = getInjectable({
      id: 'some-outer-scope',

      instantiate: di => {
        capturedOuterDi = di;

        di.register(someNestedScope);
        di.inject(someNestedScope);
      },
    });

    di.register(someOuterScope);
    di.inject(someOuterScope);

    expect(
      capturedOuterDi.registeredInLocalScopeSubtree(someInjectionToken),
    ).toBe(true);

    expect(capturedOuterDi.registeredInLocalScope(someInjectionToken)).toBe(
      false,
    );
  });

  it('given an implementation registered three scopes deep, when asked from the top scope, is true', () => {
    let capturedTopDi;

    const someDeepestScope = getInjectable({
      id: 'some-deepest-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    const someMiddleScope = getInjectable({
      id: 'some-middle-scope',

      instantiate: di => {
        di.register(someDeepestScope);
        di.inject(someDeepestScope);
      },
    });

    const someTopScope = getInjectable({
      id: 'some-top-scope',

      instantiate: di => {
        capturedTopDi = di;

        di.register(someMiddleScope);
        di.inject(someMiddleScope);
      },
    });

    di.register(someTopScope);
    di.inject(someTopScope);

    expect(
      capturedTopDi.registeredInLocalScopeSubtree(someInjectionToken),
    ).toBe(true);
  });

  it('given an implementation registered within a sibling scope, when asked from another scope, is false', () => {
    let capturedSiblingDi;

    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    const someSiblingScope = getInjectable({
      id: 'some-sibling-scope',

      instantiate: di => {
        capturedSiblingDi = di;
      },
    });

    di.register(someScope, someSiblingScope);
    di.inject(someScope);
    di.inject(someSiblingScope);

    expect(
      capturedSiblingDi.registeredInLocalScopeSubtree(someInjectionToken),
    ).toBe(false);
  });

  it('given an implementation registered within a nested scope, when asked from root, is true', () => {
    const someScope = getInjectable({
      id: 'some-scope',

      instantiate: di => {
        di.register(getImplementation('some-implementation'));
      },
    });

    di.register(someScope);
    di.inject(someScope);

    expect(di.registeredInLocalScopeSubtree(someInjectionToken)).toBe(true);
  });

  it('given an injectable2 scope with a nested scope registering an implementation, when asked from the outer scope, is true in subtree, but false in local scope', () => {
    let capturedOuterDi;

    const someInjectionToken2 = getInjectionToken2({
      id: 'some-injection-token-2',
    });

    const someImplementation = getInjectable2({
      id: 'some-implementation',
      instantiate: () => () => 'irrelevant',
      injectionToken: someInjectionToken2,
    });

    const someNestedScope = getInjectable2({
      id: 'some-nested-scope',

      instantiate: di => () => {
        di.register(someImplementation);
      },
    });

    const someOuterScope = getInjectable2({
      id: 'some-outer-scope',

      instantiate: di => () => {
        capturedOuterDi = di;

        di.register(someNestedScope);
        di.inject(someNestedScope)();
      },
    });

    di.register(someOuterScope);
    di.inject2(someOuterScope)();

    expect(
      capturedOuterDi.registeredInLocalScopeSubtree(someInjectionToken2),
    ).toBe(true);

    expect(capturedOuterDi.registeredInLocalScope(someInjectionToken2)).toBe(
      false,
    );
  });
});
