import getInjectable from '../getInjectable/getInjectable';
import createContainer, { injectionDecoratorToken } from './createContainer';

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
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: (di, instantiationParameter) => {
        const childInstance = di.inject(childInjectable, 'child-parameter');

        return `parent(${instantiationParameter}) -> ${childInstance}`;
      },
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
    });

    const di = createContainer('some-container');

    di.register(injectable, decoratorInjectable1, decoratorInjectable2);

    const actual = di.inject(injectable, 'some-parameter');

    expect(actual).toBe(
      'decorated-instance-2(decorated-instance-1(parent(decorated-parameter-1(decorated-parameter-2(some-parameter)))))',
    );
  });
});
