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

  describe('given decorator targeting an injectable that is imperatively overridden', () => {
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

    it('when injected, the imperative override wins absolutely and the decorator does not apply', () => {
      expect(di.inject(someInjectable)).toBe('overridden');
    });

    it('when injected, the decorator does not fire', () => {
      di.inject(someInjectable);

      expect(decorateSpy).not.toHaveBeenCalled();
    });
  });

  describe('parent-token chain walk for instantiation decorators', () => {
    it('a decorator targeting the parent token wraps instantiation of any child with `someToken.for(specifier)` as injectionToken', () => {
      const someToken = getInjectionToken({ id: 'parent-instantiate-token' });

      const childInjectable = getInjectable({
        id: 'child-instantiate',
        injectionToken: someToken.for('some-specifier'),
        instantiate: () => 'core',

        lifecycle: lifecycleEnum.transient,
      });

      const parentDecorator = getInjectable2({
        id: 'parent-instantiate-decorator',
        injectionToken: instantiationDecoratorToken.for(someToken),
        instantiate:
          () =>
          () =>
          instantiate =>
          (di, ...params) =>
            `wrapped(${instantiate(di, ...params)})`,
      });

      const di = createContainer('some-container');
      di.register(childInjectable, parentDecorator);

      expect(di.inject(childInjectable)).toBe('wrapped(core)');
    });
  });

  describe('tag-keyed instantiation decorators', () => {
    it('given a decorator targeting a tag, when a tagged injectable is instantiated, the decorator wraps it', () => {
      const targetInjectable = getInjectable({
        id: 'tagged-target',
        tags: ['logged'],
        instantiate: () => 'value',
      });

      const tagDecorator = getInjectable2({
        id: 'logged-tag-decorator',
        injectionToken: instantiationDecoratorToken.for('logged'),
        instantiate:
          () =>
          () =>
          instantiationToBeDecorated =>
          (di, ...params) =>
            `wrapped(${instantiationToBeDecorated(di, ...params)})`,
      });

      const di = createContainer('some-container');
      di.register(targetInjectable, tagDecorator);

      expect(di.inject(targetInjectable)).toBe('wrapped(value)');
    });

    it('given an injectable with multiple tags, each tag-keyed decorator fires once and they compose', () => {
      const targetInjectable = getInjectable({
        id: 'multi-tagged',
        tags: ['outer', 'inner'],
        instantiate: () => 'core',
      });

      const outerDecorator = getInjectable2({
        id: 'outer-decorator',
        injectionToken: instantiationDecoratorToken.for('outer'),
        instantiate:
          () =>
          () =>
          instantiate =>
          (di, ...params) =>
            `outer(${instantiate(di, ...params)})`,
      });

      const innerDecorator = getInjectable2({
        id: 'inner-decorator',
        injectionToken: instantiationDecoratorToken.for('inner'),
        instantiate:
          () =>
          () =>
          instantiate =>
          (di, ...params) =>
            `inner(${instantiate(di, ...params)})`,
      });

      const di = createContainer('some-container');
      di.register(targetInjectable, outerDecorator, innerDecorator);

      // Both wrap; flow chains them. Either order is valid composition.
      const result = di.inject(targetInjectable);
      expect([
        'outer(inner(core))',
        'inner(outer(core))',
      ]).toContain(result);
    });

    it('an untagged injectable is not affected by tag-keyed instantiation decorators', () => {
      const taggedInjectable = getInjectable({
        id: 'tagged',
        tags: ['logged'],
        instantiate: () => 'tagged-value',
      });

      const untaggedInjectable = getInjectable({
        id: 'untagged',
        instantiate: () => 'untagged-value',
      });

      const tagDecorator = getInjectable2({
        id: 'logged-decorator',
        injectionToken: instantiationDecoratorToken.for('logged'),
        instantiate:
          () =>
          () =>
          instantiate =>
          (di, ...params) =>
            `wrapped(${instantiate(di, ...params)})`,
      });

      const di = createContainer('some-container');
      di.register(taggedInjectable, untaggedInjectable, tagDecorator);

      expect(di.inject(taggedInjectable)).toBe('wrapped(tagged-value)');
      expect(di.inject(untaggedInjectable)).toBe('untagged-value');
    });

    it('imperative override still wins over a tag-keyed instantiation decorator', () => {
      const targetInjectable = getInjectable({
        id: 'imperatively-overridden-tagged',
        tags: ['logged'],
        instantiate: () => 'real',
      });

      const decorateSpy = jest.fn(
        instantiate =>
          (di, ...params) =>
            `wrapped(${instantiate(di, ...params)})`,
      );

      const tagDecorator = getInjectable2({
        id: 'logged-decorator',
        injectionToken: instantiationDecoratorToken.for('logged'),
        instantiate: () => () => decorateSpy,
      });

      const di = createContainer('some-container');
      di.register(targetInjectable, tagDecorator);

      di.override(targetInjectable, () => 'overridden');

      expect(di.inject(targetInjectable)).toBe('overridden');
      expect(decorateSpy).not.toHaveBeenCalled();
    });
  });
});
