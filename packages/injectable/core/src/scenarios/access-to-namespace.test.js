import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { getInjectionToken } from '@ogre-tools/injectable';

describe('access-to-namespace', () => {
  it('given keyed singleton using source namespace as the key, when injected from different scopes, injected instances are scope-specific', () => {
    const di = createContainer('irrelevant');

    const someSourceNamespaceSpecificInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someSourceNamespaceSpecificInjectable = getInjectable({
      id: 'some-source-namespace-specific',
      instantiate: di => message =>
        di.sourceNamespace ? `${di.sourceNamespace}/${message}` : message,

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: di => di.sourceNamespace,
      }),

      injectionToken: someSourceNamespaceSpecificInjectionToken,
    });

    const registerInjectableInScope1Injectable = getInjectable({
      id: 'scope-1',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const someFunctionalityInScope1Injectable = getInjectable({
      id: 'some-functionality-in-scope-1',
      instantiate: di => di.inject(someSourceNamespaceSpecificInjectionToken),
    });

    const registerInjectableInScope2Injectable = getInjectable({
      id: 'scope-2',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const someFunctionalityInScope2Injectable = getInjectable({
      id: 'register-injectable-in-scope-2',
      instantiate: di => di.inject(someSourceNamespaceSpecificInjectionToken),
    });

    const someFunctionalityInRootScopeInjectable = getInjectable({
      id: 'some-functionality-in-root-scope',
      instantiate: di => di.inject(someSourceNamespaceSpecificInjectionToken),
    });

    di.register(
      registerInjectableInScope1Injectable,
      registerInjectableInScope2Injectable,
    );

    const registerInjectableInScope1 = di.inject(
      registerInjectableInScope1Injectable,
    );

    const registerInjectableInScope2 = di.inject(
      registerInjectableInScope2Injectable,
    );

    di.register(someSourceNamespaceSpecificInjectable);
    registerInjectableInScope1(someFunctionalityInScope1Injectable);
    registerInjectableInScope2(someFunctionalityInScope2Injectable);
    di.register(someFunctionalityInRootScopeInjectable);

    expect([
      di.inject(someFunctionalityInScope1Injectable)('some-value'),
      di.inject(someFunctionalityInScope2Injectable)('some-other-value'),
      di.inject(someFunctionalityInRootScopeInjectable)(
        'some-value-without-namespace',
      ),
    ]).toEqual([
      'scope-1/some-value',
      'scope-2/some-other-value',
      'some-value-without-namespace',
    ]);
  });

  it('given keyed singleton using source namespace as the key, when injected from nested scopes, injected instances are scope-specific', () => {
    const di = createContainer('irrelevant');

    const someSourceNamespaceSpecificInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someSourceNamespaceSpecificInjectable = getInjectable({
      id: 'some-source-namespace-specific',

      instantiate: di => message => `${di.sourceNamespace}/${message}`,

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: di => di.sourceNamespace,
      }),

      injectionToken: someSourceNamespaceSpecificInjectionToken,
    });

    const registerInjectableInScope1Injectable = getInjectable({
      id: 'scope-1',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const registerInjectableInNestedScope1Injectable = getInjectable({
      id: 'nested-scope-1',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const someFunctionalityInNestedScope1Injectable = getInjectable({
      id: 'some-functionality-in-scope-1',
      instantiate: di => di.inject(someSourceNamespaceSpecificInjectionToken),
    });

    const registerInjectableInScope2Injectable = getInjectable({
      id: 'scope-2',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const registerInjectableInNestedScope2Injectable = getInjectable({
      id: 'nested-scope-2',
      instantiate: di => injectable => di.register(injectable),
      scope: true,
    });

    const someFunctionalityInNestedScope2Injectable = getInjectable({
      id: 'register-injectable-in-scope-2',
      instantiate: di => di.inject(someSourceNamespaceSpecificInjectionToken),
    });

    di.register(
      registerInjectableInScope1Injectable,
      registerInjectableInScope2Injectable,
    );

    const registerInjectableInScope1 = di.inject(
      registerInjectableInScope1Injectable,
    );

    const registerInjectableInScope2 = di.inject(
      registerInjectableInScope2Injectable,
    );

    registerInjectableInScope1(registerInjectableInNestedScope1Injectable);
    registerInjectableInScope2(registerInjectableInNestedScope2Injectable);

    const registerInjectableInNestedScope1 = di.inject(
      registerInjectableInNestedScope1Injectable,
    );

    const registerInjectableInNestedScope2 = di.inject(
      registerInjectableInNestedScope2Injectable,
    );

    di.register(someSourceNamespaceSpecificInjectable);
    registerInjectableInNestedScope1(someFunctionalityInNestedScope1Injectable);
    registerInjectableInNestedScope2(someFunctionalityInNestedScope2Injectable);

    expect([
      di.inject(someFunctionalityInNestedScope1Injectable)('some-value'),
      di.inject(someFunctionalityInNestedScope2Injectable)('some-other-value'),
    ]).toEqual([
      'scope-1:nested-scope-1/some-value',
      'scope-2:nested-scope-2/some-other-value',
    ]);
  });
});
