import getInjectable from '../getInjectable/getInjectable';
import createContainer, {
  injectionDecoratorToken,
} from '../dependency-injection-container/createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.targeted-decoration-via-shorthand', () => {
  it('given decorator targeting child, when parent is injected, decorates instance and instantiation parameter of only child', () => {
    const decorator =
      toBeDecorated =>
      (alias, instantiationParameter, ...args) => {
        const decoratedInstantiationParameter = `decorated-parameter(${instantiationParameter})`;

        return `decorated-instance(${toBeDecorated(
          alias,
          decoratedInstantiationParameter,
          ...args,
        )})`;
      };

    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: (di, instantiationParameter) => {
        const childInstance = di.inject(childInjectable, 'child-parameter');

        return `parent(${instantiationParameter}) -> ${childInstance}`;
      },
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    di.decorate(childInjectable, decorator);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  it('given decorator targeting an injection token and child implementing the token, when parent is injected, decorates instance and instantiation parameter of only the child', () => {
    const someInjectionTokenForTargetedDecoration = getInjectionToken({
      id: 'some-injection-token-for-targeted-decoration',
    });

    let decorator = injectToBeDecorated => (alias, instantiationParameter) => {
      const decoratedParameter = `decorated-parameter(${instantiationParameter})`;

      return `decorated-instance(${injectToBeDecorated(
        alias,
        decoratedParameter,
      )})`;
    };

    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,

      injectionToken: someInjectionTokenForTargetedDecoration,
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: (di, instantiationParameter) => {
        const childInstance = di.inject(childInjectable, 'child-parameter');

        return `parent(${instantiationParameter}) -> ${childInstance}`;
      },
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    di.decorate(someInjectionTokenForTargetedDecoration, decorator);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  it('given decorating multiple times, when injected, decorates instance and instantiation parameter on order', () => {
    const someDecorator =
      toBeDecorated =>
      (alias, instantiationParameter, ...args) => {
        const decoratedInstantiationParameter = `some-decorated-parameter(${instantiationParameter})`;

        return `some-decorated-instance(${toBeDecorated(
          alias,
          decoratedInstantiationParameter,
          ...args,
        )})`;
      };

    const someOtherDecorator =
      toBeDecorated =>
      (alias, instantiationParameter, ...args) => {
        const decoratedInstantiationParameter = `some-other-decorated-parameter(${instantiationParameter})`;

        return `some-other-decorated-instance(${toBeDecorated(
          alias,
          decoratedInstantiationParameter,
          ...args,
        )})`;
      };

    const someInjectable = getInjectable({
      id: 'some-some-injectable',

      instantiate: (di, instantiationParameter) =>
        `some(${instantiationParameter})`,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.decorate(someInjectable, someDecorator);
    di.decorate(someInjectable, someOtherDecorator);

    const actual = di.inject(someInjectable, 'some-parameter');

    expect(actual).toBe(
      'some-other-decorated-instance(some-decorated-instance(some(some-decorated-parameter(some-other-decorated-parameter(some-parameter)))))',
    );
  });
});
