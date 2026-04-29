import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  registrationDecoratorToken,
  deregistrationDecoratorToken,
  registrationCallbackToken,
} from '../dependency-injection-container/tokens';

describe('createContainer.registration-decoration', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('registration decorators', () => {
    it('given a registration decorator that proceeds, when an injectable is registered, it is injectable', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        instantiate: () => () =>registerToBeDecorated => injectable => {
          registerToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    it('given a registration decorator that prevents registration, when an injectable is registered, injecting it throws', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        instantiate: () => () =>() => () => {
          // Don't call registerToBeDecorated — prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a targeted registration decorator, when a matching injectable is registered, the decorator is applied', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        instantiate: () => () =>() => () => {
          // Prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    describe('given a targeted registration decorator and a non-matching injectable, when both are registered', () => {
      let targetInjectable;
      let otherInjectable;

      beforeEach(() => {
        targetInjectable = getInjectable({
          id: 'target-injectable',
          instantiate: () => 'target-value',
        });

        otherInjectable = getInjectable({
          id: 'other-injectable',
          instantiate: () => 'other-value',
        });

        const decoratorInjectable = getInjectable2({
          id: 'some-registration-decorator',
          injectionToken: registrationDecoratorToken.for(targetInjectable),
          instantiate: () => () => () => () => {
            // Prevent registration
          },
        });

        di.register(decoratorInjectable, targetInjectable, otherInjectable);
      });

      it('the decorator prevents the target from being injected', () => {
        expect(() => di.inject(targetInjectable)).toThrow();
      });

      it('the non-matching injectable is still injectable', () => {
        expect(di.inject(otherInjectable)).toBe('other-value');
      });
    });

    it('given a registration decorator targeting an injection token, when an injectable with that token is registered, the decorator is applied', () => {
      const someToken = getInjectionToken({ id: 'some-token' });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        injectionToken: someToken,
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        instantiate: () => () =>() => () => {
          // Prevent registration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      expect(di.injectMany(someToken)).toEqual([]);
    });

    describe('given a registration decorator that defers', () => {
      let deferredRegister;
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-value',
        });

        const decoratorInjectable = getInjectable2({
          id: 'some-registration-decorator',
          injectionToken: registrationDecoratorToken.for(someInjectable),
          instantiate: () => () => registerToBeDecorated => injectable => {
            deferredRegister = () => registerToBeDecorated(injectable);
          },
        });

        di.register(decoratorInjectable, someInjectable);
      });

      it('when injecting before the deferred registration is called, throws', () => {
        expect(() => di.inject(someInjectable)).toThrow();
      });

      it('when toBeDecorated is called later, the injectable is registered in the original context', () => {
        deferredRegister();

        expect(di.inject(someInjectable)).toBe('some-value');
      });
    });

    it('given decorator and target registered in same call with target first, the decorator still applies', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someInjectable),
        instantiate: () => () =>() => () => {
          // Prevent registration
        },
      });

      di.register(someInjectable, decoratorInjectable);

      expect(() => di.inject(someInjectable)).toThrow();
    });

    it('given a token-targeted decorator and an injectable whose id matches the token id, the decorator fires exactly once', () => {
      const someToken = getInjectionToken({ id: 'shared-id' });

      const someInjectable = getInjectable({
        id: 'shared-id',
        injectionToken: someToken,
        instantiate: () => 'some-value',
      });

      const decorateMock = jest.fn();

      const decoratorInjectable = getInjectable2({
        id: 'some-registration-decorator',
        injectionToken: registrationDecoratorToken.for(someToken),
        instantiate: () => () =>registerToBeDecorated => injectable => {
          decorateMock(injectable);
          registerToBeDecorated(injectable);
        },
      });

      di.register(decoratorInjectable, someInjectable);

      const callsForInjectable = decorateMock.mock.calls.filter(
        call => call[0] === someInjectable,
      );

      expect(callsForInjectable).toHaveLength(1);
    });

    describe('given a prevented registration with a registration callback', () => {
      let registeredIds;

      beforeEach(() => {
        const callbackMock = jest.fn();

        const callbackInjectable = getInjectable({
          id: 'some-callback',
          injectionToken: registrationCallbackToken,
          instantiate: () => callbackMock,
        });

        const someInjectable = getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-value',
        });

        const decoratorInjectable = getInjectable2({
          id: 'some-registration-decorator',
          injectionToken: registrationDecoratorToken.for(someInjectable),
          instantiate: () => () => () => () => {
            // Prevent registration
          },
        });

        di.register(callbackInjectable);
        di.register(decoratorInjectable, someInjectable);

        registeredIds = callbackMock.mock.calls.map(call => call[0].id);
      });

      it('the registration callback fires for the decorator', () => {
        expect(registeredIds).toContain('some-registration-decorator');
      });

      it('the registration callback does not fire for the prevented injectable', () => {
        expect(registeredIds).not.toContain('some-injectable');
      });
    });
  });

  describe('tag-keyed registration decorators', () => {
    it('given a decorator targeting a tag, when an injectable carrying that tag is registered, the decorator fires for it', () => {
      const seen = [];
      const tagDecorator = getInjectable2({
        id: 'some-tag-decorator',
        injectionToken: registrationDecoratorToken.for('some-tag'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          seen.push(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const taggedInjectable = getInjectable({
        id: 'some-tagged-injectable',
        tags: ['some-tag'],
        instantiate: () => 'some-value',
      });

      di.register(tagDecorator, taggedInjectable);

      expect(seen).toEqual(['some-tagged-injectable']);
    });

    it('given an injectable with multiple tags, each tag-keyed decorator fires once', () => {
      const aSeen = [];
      const bSeen = [];

      const aDecorator = getInjectable2({
        id: 'a-decorator',
        injectionToken: registrationDecoratorToken.for('tag-a'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          aSeen.push(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const bDecorator = getInjectable2({
        id: 'b-decorator',
        injectionToken: registrationDecoratorToken.for('tag-b'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          bSeen.push(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const dualTaggedInjectable = getInjectable({
        id: 'dual-tagged',
        tags: ['tag-a', 'tag-b'],
        instantiate: () => 'value',
      });

      di.register(aDecorator, bDecorator, dualTaggedInjectable);

      expect(aSeen).toEqual(['dual-tagged']);
      expect(bSeen).toEqual(['dual-tagged']);
    });

    it('given multiple injectables sharing a tag, the tag-keyed decorator fires for each', () => {
      const seen = [];
      const tagDecorator = getInjectable2({
        id: 'shared-tag-decorator',
        injectionToken: registrationDecoratorToken.for('shared'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          seen.push(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const a = getInjectable({
        id: 'a',
        tags: ['shared'],
        instantiate: () => 'a',
      });
      const b = getInjectable({
        id: 'b',
        tags: ['shared'],
        instantiate: () => 'b',
      });
      const c = getInjectable({
        id: 'c',
        tags: ['unrelated'],
        instantiate: () => 'c',
      });

      di.register(tagDecorator, a, b, c);

      expect(seen.sort()).toEqual(['a', 'b']);
    });

    it('given a decorator targeting a tag that no registered injectable carries, the decorator never fires', () => {
      const fired = jest.fn();
      const tagDecorator = getInjectable2({
        id: 'unused-tag-decorator',
        injectionToken: registrationDecoratorToken.for('never-used'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          fired(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const someInjectable = getInjectable({
        id: 'untagged',
        instantiate: () => 'value',
      });

      di.register(tagDecorator, someInjectable);

      expect(fired).not.toHaveBeenCalled();
      expect(di.inject(someInjectable)).toBe('value');
    });

    it('given a tag-keyed decorator that prevents registration, when a tagged injectable is registered, injecting it throws', () => {
      const taggedInjectable = getInjectable({
        id: 'should-be-dropped',
        tags: ['drop-me'],
        instantiate: () => 'value',
      });

      const dropDecorator = getInjectable2({
        id: 'drop-decorator',
        injectionToken: registrationDecoratorToken.for('drop-me'),
        instantiate: () => () => () => () => {
          // Don't call registerToBeDecorated — drop the registration.
        },
      });

      di.register(dropDecorator, taggedInjectable);

      expect(() => di.inject(taggedInjectable)).toThrow();
    });

    it('given both target-keyed and tag-keyed decorators on the same injectable, both fire and compose', () => {
      const calls = [];

      const taggedInjectable = getInjectable({
        id: 'composite',
        tags: ['cross-cutting'],
        instantiate: () => 'value',
      });

      const targetDecorator = getInjectable2({
        id: 'target-decorator',
        injectionToken: registrationDecoratorToken.for(taggedInjectable),
        instantiate: () => () => registerToBeDecorated => injectable => {
          calls.push('target');
          registerToBeDecorated(injectable);
        },
      });

      const tagDecorator = getInjectable2({
        id: 'tag-decorator',
        injectionToken: registrationDecoratorToken.for('cross-cutting'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          calls.push('tag');
          registerToBeDecorated(injectable);
        },
      });

      di.register(targetDecorator, tagDecorator, taggedInjectable);

      expect(calls).toEqual(expect.arrayContaining(['target', 'tag']));
      expect(calls).toHaveLength(2);
      expect(di.inject(taggedInjectable)).toBe('value');
    });

    it('given a tag-keyed decorator that defers registration, when called later, the injectable becomes injectable', () => {
      let deferredRegister;

      const taggedInjectable = getInjectable({
        id: 'deferred',
        tags: ['lazy'],
        instantiate: () => 'value',
      });

      const lazyDecorator = getInjectable2({
        id: 'lazy-decorator',
        injectionToken: registrationDecoratorToken.for('lazy'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          deferredRegister = () => registerToBeDecorated(injectable);
        },
      });

      di.register(lazyDecorator, taggedInjectable);

      expect(() => di.inject(taggedInjectable)).toThrow();

      deferredRegister();

      expect(di.inject(taggedInjectable)).toBe('value');
    });

    it('a tag-keyed decorator targeting a v2 injectable receives the same shape as a target-keyed one', () => {
      const seen = [];

      const tagDecorator = getInjectable2({
        id: 'v2-tag-decorator',
        injectionToken: registrationDecoratorToken.for('v2-tag'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          seen.push(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const taggedV2 = getInjectable2({
        id: 'tagged-v2',
        tags: ['v2-tag'],
        instantiate: () => () => 'v2-value',
      });

      di.register(tagDecorator, taggedV2);

      expect(seen).toEqual(['tagged-v2']);
      expect(di.inject(taggedV2)).toBe('v2-value');
    });

    it('a tag-keyed decorator does NOT fire for a registration-decorator-tagged injectable (phase 1 bypasses the decoration pipeline)', () => {
      const tagFired = jest.fn();

      const tagDecoratorOfRegDecorators = getInjectable2({
        id: 'meta-tag-decorator',
        injectionToken: registrationDecoratorToken.for('meta'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          tagFired(injectable.id);
          registerToBeDecorated(injectable);
        },
      });

      const otherInjectable = getInjectable({
        id: 'other',
        instantiate: () => 'value',
      });

      const taggedRegDecorator = getInjectable2({
        id: 'tagged-reg-decorator',
        injectionToken: registrationDecoratorToken.for(otherInjectable),
        tags: ['meta'],
        instantiate: () => () => registerToBeDecorated => injectable => {
          registerToBeDecorated(injectable);
        },
      });

      di.register(tagDecoratorOfRegDecorators, taggedRegDecorator, otherInjectable);

      // The 'meta' tag decorator did not fire for the registration-decorator
      // because phase 1 (registration-decorator registration) bypasses the
      // decoration pipeline by design.
      expect(tagFired).not.toHaveBeenCalledWith('tagged-reg-decorator');
    });
  });

  describe('deregistration decorators', () => {
    describe('given a deregistration decorator that proceeds and an injectable is registered', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-value',
        });

        const decoratorInjectable = getInjectable2({
          id: 'some-deregistration-decorator',
          injectionToken: deregistrationDecoratorToken.for(someInjectable),
          instantiate: () => () => deregisterToBeDecorated => injectable => {
            deregisterToBeDecorated(injectable);
          },
        });

        di.register(decoratorInjectable, someInjectable);
      });

      it('the injectable is initially injectable', () => {
        expect(di.inject(someInjectable)).toBe('some-value');
      });

      it('when the injectable is deregistered, it is no longer injectable', () => {
        di.deregister(someInjectable);

        expect(() => di.inject(someInjectable)).toThrow();
      });
    });

    it('given a deregistration decorator that prevents deregistration, when deregister is called, the injectable remains injectable', () => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-value',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-deregistration-decorator',
        injectionToken: deregistrationDecoratorToken.for(someInjectable),
        instantiate: () => () =>() => () => {
          // Don't call deregisterToBeDecorated — prevent deregistration
        },
      });

      di.register(decoratorInjectable, someInjectable);

      di.deregister(someInjectable);

      expect(di.inject(someInjectable)).toBe('some-value');
    });

    describe('given a targeted deregistration decorator, when both target and non-matching injectables are deregistered', () => {
      let targetInjectable;
      let otherInjectable;

      beforeEach(() => {
        targetInjectable = getInjectable({
          id: 'target-injectable',
          instantiate: () => 'target-value',
        });

        otherInjectable = getInjectable({
          id: 'other-injectable',
          instantiate: () => 'other-value',
        });

        const decoratorInjectable = getInjectable2({
          id: 'some-deregistration-decorator',
          injectionToken: deregistrationDecoratorToken.for(targetInjectable),
          instantiate: () => () => () => () => {
            // Would prevent deregistration
          },
        });

        di.register(decoratorInjectable, targetInjectable, otherInjectable);

        di.deregister(targetInjectable, otherInjectable);
      });

      it('the decorator prevents the target from being deregistered', () => {
        expect(di.inject(targetInjectable)).toBe('target-value');
      });

      it('the non-matching injectable is deregistered normally', () => {
        expect(() => di.inject(otherInjectable)).toThrow();
      });
    });
  });
});
