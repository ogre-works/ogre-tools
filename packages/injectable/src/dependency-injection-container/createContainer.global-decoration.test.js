import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';
import { instantiateDecoratorInjectionToken } from './createContainer';

describe('createContainer.global-decoration', () => {
  it('given global decorator and child injectable, when parent is injected, decorates instances and instantiation parameters of both parent and child', () => {
    const decoratorInjectable = getInjectable({
      id: 'some-decorator',
      injectionToken: instantiateDecoratorInjectionToken,

      instantiate: () => ({
        decorate: instantiateToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance(${instantiateToBeDecorated(
            di,
            `decorated-parameter(${instantiationParameter})`,
          )})`,
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
      'decorated-instance(parent(decorated-parameter(parent-parameter)) -> decorated-instance(child(decorated-parameter(child-parameter))))',
    );
  });

  it('given multiple global decorators and injectable, when injected, decorates instance and instantiation parameters', () => {
    const decoratorInjectable1 = getInjectable({
      id: 'some-decorator-1',
      injectionToken: instantiateDecoratorInjectionToken,

      instantiate: () => ({
        decorate: instantiateToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance-1(${instantiateToBeDecorated(
            di,
            `decorated-parameter-1(${instantiationParameter})`,
          )})`,
      }),
    });

    const decoratorInjectable2 = getInjectable({
      id: 'some-decorator-2',
      injectionToken: instantiateDecoratorInjectionToken,

      instantiate: () => ({
        decorate: instantiateToBeDecorated => (di, instantiationParameter) =>
          `decorated-instance-2(${instantiateToBeDecorated(
            di,
            `decorated-parameter-2(${instantiationParameter})`,
          )})`,
      }),
    });

    const injectable = getInjectable({
      id: 'some-injectable',

      instantiate: (di, instantiationParameter) =>
        `parent(${instantiationParameter})`,
    });

    const di = getDi(injectable, decoratorInjectable1, decoratorInjectable2);

    const actual = di.inject(injectable, 'some-parameter');

    expect(actual).toBe(
      'decorated-instance-2(decorated-instance-1(parent(decorated-parameter-1(decorated-parameter-2(some-parameter)))))',
    );
  });
});
