import { identity } from 'lodash/fp';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { instantiationDecoratorToken } from '../../index';
import { injectionDecoratorToken } from '../dependency-injection-container/tokens';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('createContainer.global-decoration', () => {
  it('given global decorator and child injectable, when parent is injected, decorates instances and instantiation parameters of both parent and child', () => {
    const decoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: injectionDecoratorToken,

      instantiate: () => ({
        decorate: injectToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance(${injectToBeDecorated(
            di,
            `decorated-parameter(${instantiationParameter})`,
          )})`,
      }),

      decorable: false,
    });

    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,

      lifecycle: lifecycleEnum.transient,
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: (di, instantiationParameter) => {
        const childInstance = di.inject(childInjectable, 'child-parameter');

        return `parent(${instantiationParameter}) -> ${childInstance}`;
      },

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'decorated-instance(parent(decorated-parameter(parent-parameter)) -> decorated-instance(child(decorated-parameter(child-parameter))))',
    );
  });

  it('given multiple global decorators and injectable, when injected, decorates instance and instantiation parameters', () => {
    const decoratorInjectable1 = getInjectable({
      id: 'some-decorator-1',
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: () => ({
        decorate:
          injectToBeDecorated =>
          (alias, instantiationParameter, ...args) => {
            const decoratedParameter = `decorated-parameter-1(${instantiationParameter})`;

            return `decorated-instance-1(${injectToBeDecorated(
              alias,
              decoratedParameter,
              ...args,
            )})`;
          },
      }),
    });

    const decoratorInjectable2 = getInjectable({
      id: 'some-decorator-2',
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: () => ({
        decorate:
          injectToBeDecorated =>
          (alias, instantiationParameter, ...args) => {
            const decoratedParameter = `decorated-parameter-2(${instantiationParameter})`;

            return `decorated-instance-2(${injectToBeDecorated(
              alias,
              decoratedParameter,
              ...args,
            )})`;
          },
      }),
    });

    const injectable = getInjectable({
      id: 'some-injectable',

      instantiate: (di, instantiationParameter) =>
        `parent(${instantiationParameter})`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(injectable, decoratorInjectable1, decoratorInjectable2);

    const actual = di.inject(injectable, 'some-parameter');

    expect(actual).toBe(
      'decorated-instance-2(decorated-instance-1(parent(decorated-parameter-1(decorated-parameter-2(some-parameter)))))',
    );
  });

  it('given a decorator with an overridden dependency, when injecting something that is decorated, decorator uses overriden decorator', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-to-be-decorated',

      instantiate: () => () => 'some-undecorated-value',
    });

    const dependencyOfDecoratorInjectable = getInjectable({
      id: 'some-dependency-for-overriding',
      decorable: false,

      instantiate: () => 'irrelevant',
    });

    const decoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: di => ({
        decorate:
          injectToBeDecorated =>
          (alias, instantiationParameter, ...args) => {
            const dependency = di.inject(dependencyOfDecoratorInjectable);

            const functionToBeDecorated = injectToBeDecorated(
              alias,
              instantiationParameter,
              ...args,
            );

            return (...args2) =>
              `decorated-with-${dependency}(${functionToBeDecorated(
                ...args2,
              )})`;
          },
      }),
    });

    const di = createContainer('some-container');

    di.register(
      someInjectable,
      dependencyOfDecoratorInjectable,
      decoratorInjectable,
    );

    di.override(dependencyOfDecoratorInjectable, () => 'some-override');

    const someInjectedThing = di.inject(someInjectable);

    const actual = someInjectedThing();

    expect(actual).toBe('decorated-with-some-override(some-undecorated-value)');
  });

  it('given injectable and infinitely recursing injection decorator, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-to-be-decorated',

      instantiate: () => 'irrelevant',
    });

    const someDecoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: di => ({
        decorate:
          toBeDecorated =>
          (...args) => {
            // Note: injection of decorated injectable within the decorator
            // itself causes the recursion.
            di.inject(someInjectable);

            return toBeDecorated(...args);
          },
      }),
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someDecoratorInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-decorator" -> "(injection-decorator-token)" -> "some-decorator"',
    );
  });

  it('given injectable and instantiation decorator which decorates itself, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-to-be-decorated',

      instantiate: () => 'irrelevant',
    });

    const someDecoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: instantiationDecoratorToken,
      // Note: decorator being decorable itself causes the infinite recursion.
      // decorable: false,

      instantiate: () => ({
        decorate: identity,
      }),
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someDecoratorInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "(instantiate-decorator-token)" -> "some-decorator" -> "(instantiate-decorator-token)"',
    );
  });

  it('given injectable and infinitely recursing instantiation decorator, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable-to-be-decorated',

      instantiate: () => 'irrelevant',
    });

    const someDecoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: instantiationDecoratorToken,
      decorable: false,

      instantiate: di => ({
        decorate:
          toBeDecorated =>
          (...args) => {
            // Note: injection of decorated injectable within the decorator
            // itself causes the recursion.
            di.inject(someInjectable);

            return toBeDecorated(...args);
          },
      }),
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someDecoratorInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-injectable-to-be-decorated" -> "(instantiate-decorator-token)" -> "some-decorator" -> "some-injectable-to-be-decorated"',
    );
  });
});
