import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { injectionDecoratorToken } from '../dependency-injection-container/tokens';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('createContainer.targeted-decoration', () => {
  it('given decorator targeting child, when parent is injected, decorates instance and instantiation parameter of only child', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: (di, instantiationParameter) =>
        `child(${instantiationParameter})`,

      lifecycle: lifecycleEnum.transient,
    });

    const decoratorInjectable = getInjectable2({
      id: 'some-child-decorator',
      injectionToken: injectionDecoratorToken.for(childInjectable),
      instantiate:
        () =>
        () =>
        injectToBeDecorated =>
        (...instantiationParameter) => {
          const decoratedInstantiationParameter = instantiationParameter.map(
            p => `decorated-parameter(${p})`,
          );

          return `decorated-instance(${injectToBeDecorated(
            ...decoratedInstantiationParameter,
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

    const di = createContainer('some-container', { injectionDecorators: true });

    di.register(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });

  describe('no double-decoration', () => {
    describe('given .for(someInjectable)', () => {
      describe('when inject is called', () => {
        let decorateSpy;

        beforeEach(() => {
          decorateSpy = jest.fn(
            inject =>
              (...params) =>
                inject(...params),
          );

          const someInjectable = getInjectable({
            id: 'some-injectable',
            instantiate: () => 'some-value',
          });

          const decoratorInjectable = getInjectable2({
            id: 'spy-decorator',
            injectionToken: injectionDecoratorToken.for(someInjectable),
            instantiate: () => () => decorateSpy,
          });

          const di = createContainer('some-container', {
            injectionDecorators: true,
          });
          di.register(decoratorInjectable, someInjectable);

          di.inject(someInjectable);
        });

        it('the decorator fires exactly once', () => {
          expect(decorateSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('given injectable and its token share the same id, when inject is called', () => {
        let decorateSpy;

        beforeEach(() => {
          const sharedId = 'shared-id';

          const someToken = getInjectionToken({ id: sharedId });

          const someInjectable = getInjectable({
            id: sharedId,
            instantiate: () => 'some-value',
            injectionToken: someToken,
          });

          decorateSpy = jest.fn(
            inject =>
              (...params) =>
                inject(...params),
          );

          const decoratorInjectable = getInjectable2({
            id: 'spy-decorator',
            injectionToken: injectionDecoratorToken.for(someInjectable),
            instantiate: () => () => decorateSpy,
          });

          const di = createContainer('some-container', {
            injectionDecorators: true,
          });
          di.register(decoratorInjectable, someInjectable);

          di.inject(someInjectable);
        });

        it('the decorator fires exactly once', () => {
          expect(decorateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('given .for(someInjectionToken)', () => {
      describe('when inject is called on an implementation', () => {
        let decorateSpy;

        beforeEach(() => {
          const someToken = getInjectionToken({ id: 'some-token' });

          const someInjectable = getInjectable({
            id: 'some-injectable',
            instantiate: () => 'some-value',
            injectionToken: someToken,
          });

          decorateSpy = jest.fn(
            inject =>
              (...params) =>
                inject(...params),
          );

          const decoratorInjectable = getInjectable2({
            id: 'spy-decorator',
            injectionToken: injectionDecoratorToken.for(someToken),
            instantiate: () => () => decorateSpy,
          });

          const di = createContainer('some-container', {
            injectionDecorators: true,
          });
          di.register(decoratorInjectable, someInjectable);

          di.inject(someInjectable);
        });

        it('the decorator fires exactly once', () => {
          expect(decorateSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('when injectMany is called for the token with two implementations', () => {
        let decorateSpy;

        beforeEach(() => {
          const someToken = getInjectionToken({ id: 'some-token' });

          decorateSpy = jest.fn(
            inject =>
              (...params) =>
                inject(...params),
          );

          const decoratorInjectable = getInjectable2({
            id: 'spy-decorator',
            injectionToken: injectionDecoratorToken.for(someToken),
            instantiate: () => () => decorateSpy,
          });

          const implA = getInjectable({
            id: 'impl-a',
            instantiate: () => 'a',
            injectionToken: someToken,
          });

          const implB = getInjectable({
            id: 'impl-b',
            instantiate: () => 'b',
            injectionToken: someToken,
          });

          const di = createContainer('some-container', {
            injectionDecorators: true,
          });
          di.register(decoratorInjectable, implA, implB);

          di.injectMany(someToken);
        });

        it('the decorator fires exactly once per injectable', () => {
          expect(decorateSpy).toHaveBeenCalledTimes(2);
        });
      });

      describe('given injectable and its token share the same id, when inject is called', () => {
        let decorateSpy;

        beforeEach(() => {
          const sharedId = 'shared-id';

          const someToken = getInjectionToken({ id: sharedId });

          const someInjectable = getInjectable({
            id: sharedId,
            instantiate: () => 'some-value',
            injectionToken: someToken,
          });

          decorateSpy = jest.fn(
            inject =>
              (...params) =>
                inject(...params),
          );

          const decoratorInjectable = getInjectable2({
            id: 'spy-decorator',
            injectionToken: injectionDecoratorToken.for(someToken),
            instantiate: () => () => decorateSpy,
          });

          const di = createContainer('some-container', {
            injectionDecorators: true,
          });
          di.register(decoratorInjectable, someInjectable);

          di.inject(someInjectable);
        });

        it('the decorator fires exactly once', () => {
          expect(decorateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  it('given decorator targeting an injection token and child implementing the token, when parent is injected, decorates instance and instantiation parameter of only the child', () => {
    const someInjectionTokenForTargetedDecoration = getInjectionToken({
      id: 'some-injection-token-for-targeted-decoration',
    });

    const decoratorInjectable = getInjectable2({
      id: 'some-injection-token-decorator',
      injectionToken: injectionDecoratorToken.for(
        someInjectionTokenForTargetedDecoration,
      ),
      instantiate:
        () =>
        () =>
        injectToBeDecorated =>
        (...instantiationParameter) => {
          const decoratedParameter = instantiationParameter.map(
            p => `decorated-parameter(${p})`,
          );

          return `decorated-instance(${injectToBeDecorated(
            ...decoratedParameter,
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

    const di = createContainer('some-container', { injectionDecorators: true });

    di.register(parentInjectable, childInjectable, decoratorInjectable);

    const actual = di.inject(parentInjectable, 'parent-parameter');

    expect(actual).toBe(
      'parent(parent-parameter) -> decorated-instance(child(decorated-parameter(child-parameter)))',
    );
  });
});
