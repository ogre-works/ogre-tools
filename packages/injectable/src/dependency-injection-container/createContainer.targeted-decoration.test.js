import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';
import { instantiateDecoratorInjectionToken } from './createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.targeted-decoration', () => {
  it('given decorator targeting child, when parent is injected, decorates instance and instantiation parameter of only child', () => {
    const decoratorInjectable = getInjectable({
      id: 'some-child-decorator',
      injectionToken: instantiateDecoratorInjectionToken,

      instantiate: () => ({
        decorate: instantiateToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance(${instantiateToBeDecorated(
            di,
            `decorated-parameter(${instantiationParameter})`,
          )})`,

        target: childInjectable,
      }),
    });

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

    const di = getDi(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  it('given decorator targeting an injection token and child implementing the token, when parent is injected, decorates instance and instantiation parameter of only the child', () => {
    const someInjectionTokenForTargetedDecoration = getInjectionToken({
      id: 'some-injection-token-for-targeted-decoration',
    });

    const decoratorInjectable = getInjectable({
      id: 'some-injection-token-decorator',
      injectionToken: instantiateDecoratorInjectionToken,

      instantiate: () => ({
        decorate: instantiateToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance(${instantiateToBeDecorated(
            di,
            `decorated-parameter(${instantiationParameter})`,
          )})`,

        target: someInjectionTokenForTargetedDecoration,
      }),
    });

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

    const di = getDi(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });
});
