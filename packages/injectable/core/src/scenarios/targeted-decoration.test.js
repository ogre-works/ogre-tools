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

  describe('parent-token chain walk for injection decorators', () => {
    it('an injection decorator targeting the parent token fires when injecting a specialized child token', () => {
      const someToken = getInjectionToken({ id: 'parent-inject-token' });

      const childInjectable = getInjectable({
        id: 'child-inject',
        injectionToken: someToken.for('some-specifier'),
        instantiate: () => 'value',

        lifecycle: lifecycleEnum.transient,
      });

      const parentDecorator = getInjectable2({
        id: 'parent-inject-decorator',
        injectionToken: injectionDecoratorToken.for(someToken),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `wrapped(${injectToBeDecorated(...params)})`,
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(childInjectable, parentDecorator);

      expect(di.inject(childInjectable)).toBe('wrapped(value)');
    });
  });

  describe('tag-keyed injection decorators', () => {
    it('given a decorator targeting a tag, when a tagged injectable is injected, the decorator wraps the inject path', () => {
      const taggedInjectable = getInjectable({
        id: 'tagged',
        tags: ['traced'],
        instantiate: () => 'value',
      });

      const tagDecorator = getInjectable2({
        id: 'traced-decorator',
        injectionToken: injectionDecoratorToken.for('traced'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `traced(${injectToBeDecorated(...params)})`,
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(taggedInjectable, tagDecorator);

      expect(di.inject(taggedInjectable)).toBe('traced(value)');
    });

    it('a tag-keyed injection decorator does NOT fire when the inject alias is a token, even if implementers carry the tag', () => {
      const someToken = getInjectionToken({ id: 'some-token-for-tag-skip' });

      const taggedImpl = getInjectable({
        id: 'tagged-impl',
        injectionToken: someToken,
        tags: ['traced'],
        instantiate: () => 'impl-value',
      });

      const decorateSpy = jest.fn(
        injectToBeDecorated =>
          (...params) =>
            `traced(${injectToBeDecorated(...params)})`,
      );

      const tagDecorator = getInjectable2({
        id: 'traced-decorator-skipped-for-token',
        injectionToken: injectionDecoratorToken.for('traced'),
        instantiate: () => () => decorateSpy,
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(taggedImpl, tagDecorator);

      // Direct injectable inject: tag fires.
      expect(di.inject(taggedImpl)).toBe('traced(impl-value)');
      expect(decorateSpy).toHaveBeenCalledTimes(1);

      decorateSpy.mockClear();

      // Token inject: tag does NOT fire (conservative rule).
      expect(di.inject(someToken)).toBe('impl-value');
      expect(decorateSpy).not.toHaveBeenCalled();
    });

    it('cache invalidation: registering a tag-keyed injection decorator after the first inject is reflected on the next inject', () => {
      const taggedInjectable = getInjectable({
        id: 'cache-test-tagged',
        tags: ['traced-late'],
        instantiate: () => 'value',
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(taggedInjectable);

      // First inject: no decorator yet.
      expect(di.inject(taggedInjectable)).toBe('value');

      const tagDecorator = getInjectable2({
        id: 'traced-late-decorator',
        injectionToken: injectionDecoratorToken.for('traced-late'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `late(${injectToBeDecorated(...params)})`,
      });

      di.register(tagDecorator);

      // Second inject: decorator now applies (cache was invalidated).
      expect(di.inject(taggedInjectable)).toBe('late(value)');
    });
  });
});
