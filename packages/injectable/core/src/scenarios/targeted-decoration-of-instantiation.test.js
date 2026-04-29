import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { instantiationDecoratorToken } from '../dependency-injection-container/tokens';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('createContainer.targeted-decoration-of-instantiation', () => {
  it('given decorator targeting child, when parent is injected, decorates instance and instantiation parameter of only child', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,

      lifecycle: lifecycleEnum.transient,
    });

    const decoratorInjectable = getInjectable2({
      id: 'some-child-decorator',
      injectionToken: instantiationDecoratorToken.for(childInjectable),
      instantiate:
        () =>
        () =>
        instantiationToBeDecorated =>
        (di, instantiationParameter) => {
          const decoratedInstantiationParameter = `decorated-parameter(${instantiationParameter})`;

          return `decorated-instance(${instantiationToBeDecorated(
            di,
            decoratedInstantiationParameter,
          )})`;
        },
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
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  it('given decorator targeting an injection token and child implementing the token, when parent is injected, decorates instance and instantiation parameter of only the child', () => {
    const someInjectionTokenForTargetedDecoration = getInjectionToken({
      id: 'some-injection-token-for-targeted-decoration',
    });

    const decoratorInjectable = getInjectable2({
      id: 'some-injection-token-decorator',
      injectionToken: instantiationDecoratorToken.for(
        someInjectionTokenForTargetedDecoration,
      ),
      instantiate:
        () =>
        () =>
        instantiationToBeDecorated =>
        (di, instantiationParameter) => {
          const decoratedParameter = `decorated-parameter(${instantiationParameter})`;

          return `decorated-instance(${instantiationToBeDecorated(
            di,
            decoratedParameter,
          )})`;
        },
    });

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

    di.register(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  describe('given decorator targeting an injectable that is overridden', () => {
    let di;
    let someInjectable;
    let decorateSpy;

    beforeEach(() => {
      someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'original',
      });

      decorateSpy = jest.fn(
        instantiate =>
          (di, ...params) =>
            `decorated(${instantiate(di, ...params)})`,
      );

      const decoratorInjectable = getInjectable2({
        id: 'some-decorator',
        injectionToken: instantiationDecoratorToken.for(someInjectable),
        instantiate: () => () => decorateSpy,
      });

      di = createContainer('some-container');
      di.register(someInjectable, decoratorInjectable);

      di.override(someInjectable, () => 'overridden');
    });

    it('when injected, the decorator applies to the override', () => {
      expect(di.inject(someInjectable)).toBe('decorated(overridden)');
    });

    it('when injected, the decorator fires exactly once', () => {
      di.inject(someInjectable);

      expect(decorateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
