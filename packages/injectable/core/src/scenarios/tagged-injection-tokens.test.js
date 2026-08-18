import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { getAbstractInjectionToken2 } from '../getInjectionToken2/getAbstractInjectionToken2';
import {
  deregistrationCallbackToken,
  deregistrationDecoratorToken,
  injectionDecoratorToken,
  instancePurgeCallbackToken,
  instantiationDecoratorToken,
  registrationCallbackToken,
  registrationDecoratorToken,
} from '../dependency-injection-container/tokens';

describe('tagged-injection-tokens', () => {
  describe('given a v1 injection token', () => {
    it('carries the initial injectionToken tag', () => {
      const someToken = getInjectionToken({ id: 'some-token' });

      expect(someToken.tags).toEqual(['injectionToken']);
    });

    it('given custom tags, carries the initial tag followed by the custom tags', () => {
      const someToken = getInjectionToken({
        id: 'some-token',
        tags: ['some-tag', 'some-other-tag'],
      });

      expect(someToken.tags).toEqual([
        'injectionToken',
        'some-tag',
        'some-other-tag',
      ]);
    });

    it('when creating a specific token using .for, the specific token inherits the tags of the general token', () => {
      const someToken = getInjectionToken({
        id: 'some-token',
        tags: ['some-tag'],
      });

      expect(someToken.for('some-speciality').tags).toEqual([
        'injectionToken',
        'some-tag',
      ]);
    });
  });

  describe('given the built-in machinery tokens', () => {
    it.each([
      ['registrationCallbackToken', registrationCallbackToken],
      ['deregistrationCallbackToken', deregistrationCallbackToken],
      ['instantiationDecoratorToken', instantiationDecoratorToken],
      ['injectionDecoratorToken', injectionDecoratorToken],
      ['instancePurgeCallbackToken', instancePurgeCallbackToken],
      ['registrationDecoratorToken', registrationDecoratorToken],
      ['deregistrationDecoratorToken', deregistrationDecoratorToken],
    ])('%s carries no tags', (name, token) => {
      expect(token.tags).toBeUndefined();
    });

    it('a specific token created from a machinery token carries no tags either', () => {
      expect(instantiationDecoratorToken.for('some-tag').tags).toBeUndefined();
    });
  });

  describe('given a v2 injection token', () => {
    it('carries the initial injectionToken tag', () => {
      const someToken = getInjectionToken2({ id: 'some-token' });

      expect(someToken.tags).toEqual(['injectionToken']);
    });

    it('given custom tags, carries the initial tag followed by the custom tags', () => {
      const someToken = getInjectionToken2({
        id: 'some-token',
        tags: ['some-tag', 'some-other-tag'],
      });

      expect(someToken.tags).toEqual([
        'injectionToken',
        'some-tag',
        'some-other-tag',
      ]);
    });

    it('when creating a specific token using .for, the specific token inherits the tags of the general token', () => {
      const someToken = getInjectionToken2({
        id: 'some-token',
        tags: ['some-tag'],
      });

      expect(someToken.for('some-speciality').tags).toEqual([
        'injectionToken',
        'some-tag',
      ]);
    });
  });

  describe('given an abstract v2 injection token', () => {
    it('carries the initial injectionToken tag and custom tags', () => {
      const someAbstractToken = getAbstractInjectionToken2({
        id: 'some-abstract-token',
        tags: ['some-tag'],
      });

      expect(someAbstractToken.tags).toEqual(['injectionToken', 'some-tag']);
    });
  });

  describe('given a v2 token with a custom tag and an injection decorator targeting the tag', () => {
    it('when injecting via the token, the decorator fires', () => {
      const someToken = getInjectionToken2({
        id: 'some-token',
        tags: ['some-tag'],
      });

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      const tagDecorator = getInjectable2({
        id: 'some-tag-decorator',
        injectionToken: injectionDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `decorated(${injectToBeDecorated(...params)})`,
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(someInjectable, tagDecorator);

      expect(di.inject(someToken)).toBe('decorated(some-instance)');
    });
  });

  describe('given a v1 token with a custom tag and an injection decorator targeting the tag', () => {
    let di;
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken({
        id: 'some-token',
        tags: ['some-tag'],
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-instance',
      });

      const tagDecorator = getInjectable2({
        id: 'some-tag-decorator',
        injectionToken: injectionDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `decorated(${injectToBeDecorated(...params)})`,
      });

      di = createContainer('some-container', { injectionDecorators: true });
      di.register(someInjectable, tagDecorator);
    });

    it('when injecting via the token, the decorator fires', () => {
      expect(di.inject(someToken)).toBe('decorated(some-instance)');
    });
  });

  describe('given a v1 token and an injection decorator targeting the initial injectionToken tag', () => {
    let di;
    let someToken;
    let someTokenlessInjectable;

    beforeEach(() => {
      someToken = getInjectionToken({ id: 'some-token' });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-instance',
      });

      someTokenlessInjectable = getInjectable({
        id: 'some-tokenless-injectable',
        instantiate: () => 'some-tokenless-instance',
      });

      const anyTokenDecorator = getInjectable2({
        id: 'any-token-decorator',
        injectionToken: injectionDecoratorToken.for('injectionToken'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `decorated(${injectToBeDecorated(...params)})`,
      });

      di = createContainer('some-container', { injectionDecorators: true });
      di.register(someInjectable, someTokenlessInjectable, anyTokenDecorator);
    });

    it('when injecting via the token, the decorator fires', () => {
      expect(di.inject(someToken)).toBe('decorated(some-instance)');
    });

    it('when injecting an injectable without a token, the decorator does not fire', () => {
      expect(di.inject(someTokenlessInjectable)).toBe(
        'some-tokenless-instance',
      );
    });
  });

  describe('given decorators targeting the injectionToken tag for several decorator types at once', () => {
    it('when registering and injecting a token-implementing injectable, terminates and does not decorate the machinery', () => {
      const someToken = getInjectionToken2({ id: 'some-token' });

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => () => 'some-instance',
      });

      const instantiationSpy = jest.fn(
        instantiate =>
          (someDi, ...params) =>
            instantiate(someDi, ...params),
      );

      const anyTokenInstantiationDecorator = getInjectable2({
        id: 'any-token-instantiation-decorator',
        injectionToken: instantiationDecoratorToken.for('injectionToken'),
        instantiate: () => () => instantiationSpy,
      });

      const injectionSpy = jest.fn(
        injectToBeDecorated =>
          (...params) =>
            injectToBeDecorated(...params),
      );

      const anyTokenInjectionDecorator = getInjectable2({
        id: 'any-token-injection-decorator',
        injectionToken: injectionDecoratorToken.for('injectionToken'),
        instantiate: () => () => injectionSpy,
      });

      const registrationSpy = jest.fn();

      const anyTokenRegistrationDecorator = getInjectable2({
        id: 'any-token-registration-decorator',
        injectionToken: registrationDecoratorToken.for('injectionToken'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          registrationSpy(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });

      di.register(
        anyTokenInstantiationDecorator,
        anyTokenInjectionDecorator,
        anyTokenRegistrationDecorator,
        someInjectable,
      );

      expect(di.inject(someToken)).toBe('some-instance');

      // Only the token-implementing user injectable is seen — the decorator
      // injectables register under untagged machinery tokens.
      expect(registrationSpy.mock.calls).toEqual([['some-injectable']]);
      expect(instantiationSpy).toHaveBeenCalledTimes(1);
      expect(injectionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('given a v1 token with a custom tag and an injectable registered under a .for-specific token', () => {
    it('when injecting via the specific token, a decorator targeting the tag fires due to tag inheritance', () => {
      const someToken = getInjectionToken({
        id: 'some-token',
        tags: ['some-tag'],
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken.for('some-speciality'),
        instantiate: () => 'some-instance',
      });

      const tagDecorator = getInjectable2({
        id: 'some-tag-decorator',
        injectionToken: injectionDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            `decorated(${injectToBeDecorated(...params)})`,
      });

      const di = createContainer('some-container', {
        injectionDecorators: true,
      });
      di.register(someInjectable, tagDecorator);

      expect(di.inject(someToken.for('some-speciality'))).toBe(
        'decorated(some-instance)',
      );
    });
  });
});
