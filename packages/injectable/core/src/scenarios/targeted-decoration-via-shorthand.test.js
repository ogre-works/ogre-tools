import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('createContainer.targeted-decoration-via-shorthand', () => {
  it('given decorator targeting child, when parent is injected, decorates instance and instantiation parameter of only child', () => {
    const decorator =
      toBeDecorated =>
      (...instantiationParameter) => {
        const decoratedInstantiationParameter = instantiationParameter.map(
          p => `decorated-parameter(${p})`,
        );

        return `decorated-instance(${toBeDecorated(
          ...decoratedInstantiationParameter,
        )})`;
      };

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

    const decorator =
      injectToBeDecorated =>
      (...instantiationParameter) => {
        const decoratedParameter = instantiationParameter.map(
          p => `decorated-parameter(${p})`,
        );

        return `decorated-instance(${injectToBeDecorated(
          ...decoratedParameter,
        )})`;
      };

    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,

      injectionToken: someInjectionTokenForTargetedDecoration,

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

    di.register(parentInjectable, childInjectable);

    di.decorate(someInjectionTokenForTargetedDecoration, decorator);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  it('given decorating multiple times, when injected, decorates instance and instantiation parameter in order', () => {
    const someDecorator =
      toBeDecorated =>
      (...instantiationParameter) => {
        const decoratedInstantiationParameter = instantiationParameter.map(
          p => `some-decorated-parameter(${p})`,
        );

        return `some-decorated-instance(${toBeDecorated(
          ...decoratedInstantiationParameter,
        )})`;
      };

    const someOtherDecorator =
      toBeDecorated =>
      (...instantiationParameter) => {
        const decoratedInstantiationParameter = instantiationParameter.map(
          p => `some-other-decorated-parameter(${p})`,
        );

        return `some-other-decorated-instance(${toBeDecorated(
          ...decoratedInstantiationParameter,
        )})`;
      };

    const someInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: (di, instantiationParameter) =>
        `some(${instantiationParameter})`,

      lifecycle: lifecycleEnum.transient,
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
