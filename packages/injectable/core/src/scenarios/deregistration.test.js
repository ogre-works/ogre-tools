import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('createContainer.deregistration', () => {
  it('given registered injectable and deregistered, when injecting, throws', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable);

    di.deregister(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-injectable" from "some-container".',
    );
  });

  it('given registered injectable with injection token and deregistered, when injecting using injection token, throws', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.deregister(someInjectable);

    expect(() => {
      di.inject(someInjectionToken);
    }).toThrow(
      'Tried to inject non-registered injectable "some-injection-token" from "some-container".',
    );
  });

  it('given multiple registered injectables and deregistered, when injecting, throws', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable, someOtherInjectable);

    di.deregister(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject(someOtherInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-other-injectable" from "some-container".',
    );
  });

  it('given not registered, when still deregistering, throws', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    expect(() => {
      di.deregister(someInjectable);
    }).toThrow(
      'Tried to deregister non-registered injectable "some-injectable".',
    );
  });

  it('given registered injectable and overridden and deregistered and registered again, when injecting, injects non-overridden instance', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);
    di.override(someInjectable, () => 'some-overridden-instance');
    di.deregister(someInjectable);

    di.register(someInjectable);

    const actual = di.inject(someInjectable);
    expect(actual).toBe('some-instance');
  });

  it('given injectable and injectable which can deregister and first injectable is deregistered, when first injectable is injected, throws', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const deregisterInjectable = getInjectable({
      id: 'deregister',

      instantiate: di => injectable => {
        di.deregister(injectable);
      },
    });

    di.register(someInjectable, deregisterInjectable);

    const deregister = di.inject(deregisterInjectable);

    deregister(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-injectable" from "some-container".',
    );
  });

  it('given injectable which can register, when the injectable is deregistered, does not deregister unrelated injectable', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const unrelatedInjectable = getInjectable({
      id: 'some-unrelated-injectable',
      instantiate: () => 'some-unrelated-instance',
    });

    const registererInjectable = getInjectable({
      id: 'registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },
    });

    di.register(registererInjectable, unrelatedInjectable);

    const register = di.inject(registererInjectable);

    register(someInjectable);

    di.deregister(registererInjectable);

    const actual = di.inject(unrelatedInjectable);

    expect(actual).toBe('some-unrelated-instance');
  });

  it('given injectable which can register, when the injectable is deregistered, also injectables registered by it are deregistered', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const registererInjectable = getInjectable({
      id: 'registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },
    });

    di.register(registererInjectable);

    const register = di.inject(registererInjectable);

    register(someInjectable);

    di.deregister(registererInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-injectable" from "some-container".',
    );
  });

  it('given injectable registered by another injectable (not the root), when root is deregistered, the registered injectable is NOT cascade-deregistered', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const someRootInjectable = getInjectable({
      id: 'some-root-injectable',

      instantiate: di => injectable =>
        di.injectMany(someInjectionToken).forEach(x => x(injectable)),
    });

    const registererInjectable = getInjectable({
      id: 'registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },

      injectionToken: someInjectionToken,
    });

    di.register(registererInjectable, someRootInjectable);

    const registerInContextOfRootInjectable = di.inject(someRootInjectable);

    registerInContextOfRootInjectable(someInjectable);

    di.deregister(someRootInjectable);

    // someInjectable was registered by registererInjectable, not someRootInjectable,
    // so it survives cascade deregistration of someRootInjectable
    expect(di.inject(someInjectable)).toBe('some-instance');
  });

  it('given injectable registered by another, when child is deregistered directly and then parent is deregistered, does not throw', () => {
    const di = createContainer('some-container');

    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: () => 'some-child-instance',
    });

    const registererInjectable = getInjectable({
      id: 'some-registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },
    });

    di.register(registererInjectable);

    const register = di.inject(registererInjectable);

    register(childInjectable);

    di.deregister(childInjectable);

    // Deregister parent — should not throw
    expect(() => {
      di.deregister(registererInjectable);
    }).not.toThrow();
  });

  describe('given grandchild registered via nested scopes', () => {
    let di;
    let grandchildInjectable;
    let parentScopeInjectable;

    beforeEach(() => {
      di = createContainer('some-container');

      grandchildInjectable = getInjectable({
        id: 'some-grandchild',
        instantiate: () => 'grandchild-instance',
      });

      // Child scope: registers the grandchild
      const childScopeInjectable = getInjectable({
        id: 'some-child-scope',
        instantiate: di => {
          di.register(grandchildInjectable);
          return 'child-scope-instance';
        },
        scope: true,
      });

      // Parent scope: registers the child scope
      parentScopeInjectable = getInjectable({
        id: 'some-parent-scope',
        instantiate: di => {
          di.register(childScopeInjectable);
          di.inject(childScopeInjectable);
          return 'parent-scope-instance';
        },
        scope: true,
      });

      di.register(parentScopeInjectable);
      di.inject(parentScopeInjectable);
    });

    it('the grandchild is initially registered', () => {
      expect(di.hasRegistrations(grandchildInjectable)).toBe(true);
    });

    it('when grandparent is deregistered, does not throw for grandchild already deregistered by child cascade', () => {
      expect(() => {
        di.deregister(parentScopeInjectable);
      }).not.toThrow();
    });

    it('when grandparent is deregistered, the grandchild is no longer registered', () => {
      di.deregister(parentScopeInjectable);

      expect(di.hasRegistrations(grandchildInjectable)).toBe(false);
    });
  });

  it('given injectable registered by another, when child is deregistered directly and then parent is deregistered, does not throw', () => {
    const di = createContainer('some-container');

    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: () => 'some-child-instance',
    });

    const registererInjectable = getInjectable({
      id: 'some-registerer',

      instantiate: di => injectable => {
        di.register(injectable);
      },
    });

    di.register(registererInjectable);

    const register = di.inject(registererInjectable);

    register(childInjectable);

    // Deregister child directly (simulates experiment uninstall)
    di.deregister(childInjectable);

    // Deregister parent (simulates feature scope cascade) — should not throw
    expect(() => {
      di.deregister(registererInjectable);
    }).not.toThrow();
  });

  it('given grandchild registered via nested scopes, when grandparent is deregistered, does not throw for grandchild already deregistered by child cascade', () => {
    const di = createContainer('some-container');

    const grandchildInjectable = getInjectable({
      id: 'some-grandchild',
      instantiate: () => 'grandchild-instance',
    });

    // Child scope: registers the grandchild
    const childScopeInjectable = getInjectable({
      id: 'some-child-scope',
      instantiate: di => {
        di.register(grandchildInjectable);
        return 'child-scope-instance';
      },
      scope: true,
    });

    // Parent scope: registers the child scope
    const parentScopeInjectable = getInjectable({
      id: 'some-parent-scope',
      instantiate: di => {
        di.register(childScopeInjectable);
        di.inject(childScopeInjectable);
        return 'parent-scope-instance';
      },
      scope: true,
    });

    di.register(parentScopeInjectable);
    di.inject(parentScopeInjectable);

    expect(di.hasRegistrations(grandchildInjectable)).toBe(true);

    // Deregistering parent cascades to child, which cascades to grandchild.
    // Grandchild appears in both parent's and child's cascade results.
    expect(() => {
      di.deregister(parentScopeInjectable);
    }).not.toThrow();

    expect(di.hasRegistrations(grandchildInjectable)).toBe(false);
  });

  it('given injectable with token, and registered, when deregistered using the token, throws', () => {
    const someToken = getInjectionToken({
      id: 'some-token',
    });

    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someToken,
    });

    di.register(someInjectable);

    expect(() => {
      di.deregister(someToken);
    }).toThrow(
      'Tried to deregister using injection token "some-token", but deregistration using token is illegal.',
    );
  });
});
