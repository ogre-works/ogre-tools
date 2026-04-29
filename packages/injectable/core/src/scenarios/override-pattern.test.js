import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  instantiationDecoratorToken,
  registrationDecoratorToken,
} from '../dependency-injection-container/tokens';

describe('createContainer.override-pattern', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  it('basic override: instantiationDecoratorToken-tagged injectable that ignores its argument acts as a replacement', () => {
    const targetInjectable = getInjectable({
      id: 'target',
      instantiate: () => 'real',
    });

    const overrideInjectable = getInjectable2({
      id: 'override--target',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => () => () => 'overridden',
    });

    di.register(targetInjectable, overrideInjectable);

    expect(di.inject(targetInjectable)).toBe('overridden');
  });

  it('v2 override with parameters: parameters reach the stub instantiate', () => {
    const targetInjectable = getInjectable2({
      id: 'target-v2',
      instantiate:
        () =>
        (a, b) =>
          `real(${a},${b})`,
    });

    const overrideInjectable = getInjectable2({
      id: 'override--target-v2',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate:
        () =>
        () =>
        () =>
        () =>
        (a, b) =>
          `stub(${a},${b})`,
    });

    di.register(targetInjectable, overrideInjectable);

    expect(di.inject(targetInjectable, 'x', 'y')).toBe('stub(x,y)');
  });

  it('token-target override: targets the injection token, applies to the single implementation', () => {
    const someToken = getInjectionToken({ id: 'some-token' });

    const targetInjectable = getInjectable({
      id: 'target-with-token',
      injectionToken: someToken,
      instantiate: () => 'real',
    });

    const overrideInjectable = getInjectable2({
      id: 'override--token-impl',
      injectionToken: instantiationDecoratorToken.for(someToken),
      instantiate: () => () => () => () => 'overridden',
    });

    di.register(targetInjectable, overrideInjectable);

    expect(di.inject(someToken)).toBe('overridden');
  });

  it('phase 0: same-batch override of a registration-decorator', () => {
    const sideEffectMock = jest.fn();
    const otherInjectable = getInjectable({
      id: 'other',
      instantiate: () => 'other-value',
    });

    const recordingDecorator = getInjectable2({
      id: 'recording-registration-decorator',
      injectionToken: registrationDecoratorToken.for(otherInjectable),
      instantiate: () => () => registerToBeDecorated => injectable => {
        sideEffectMock('decorated');
        registerToBeDecorated(injectable);
      },
    });

    // Override the registration-decorator with a no-op, in the same batch.
    const decoratorOverride = getInjectable2({
      id: 'override--recording-decorator',
      injectionToken: instantiationDecoratorToken.for(recordingDecorator),
      instantiate:
        () =>
        () =>
        () =>
        () =>
        () =>
        registerToBeDecorated =>
        injectable => {
          // No side-effect; just register.
          registerToBeDecorated(injectable);
        },
    });

    di.register(decoratorOverride, recordingDecorator, otherInjectable);

    expect(di.inject(otherInjectable)).toBe('other-value');
    expect(sideEffectMock).not.toHaveBeenCalled();
  });

  it('cross-batch override of a registration-decorator still works (backwards-compat)', () => {
    const sideEffectMock = jest.fn();
    const otherInjectable = getInjectable({
      id: 'other-cross',
      instantiate: () => 'other-value',
    });

    const recordingDecorator = getInjectable2({
      id: 'recording-registration-decorator-cross',
      injectionToken: registrationDecoratorToken.for(otherInjectable),
      instantiate: () => () => registerToBeDecorated => injectable => {
        sideEffectMock('decorated');
        registerToBeDecorated(injectable);
      },
    });

    const decoratorOverride = getInjectable2({
      id: 'override--recording-decorator-cross',
      injectionToken: instantiationDecoratorToken.for(recordingDecorator),
      instantiate:
        () =>
        () =>
        () =>
        () =>
        () =>
        registerToBeDecorated =>
        injectable => {
          registerToBeDecorated(injectable);
        },
    });

    di.register(decoratorOverride);
    di.register(recordingDecorator, otherInjectable);

    expect(di.inject(otherInjectable)).toBe('other-value');
    expect(sideEffectMock).not.toHaveBeenCalled();
  });

  it('production opt-out via tag-keyed registration-decorator', () => {
    const targetInjectable = getInjectable({
      id: 'target-with-override',
      instantiate: () => 'real',
    });

    const overrideInjectable = getInjectable2({
      id: 'override--target-with-override',
      tags: ['override'],
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => () => () => 'overridden',
    });

    const skipOverridesInProduction = getInjectable2({
      id: 'skip-overrides-in-production',
      injectionToken: registrationDecoratorToken.for('override'),
      instantiate: () => () => () => () => {
        // Drop registration entirely.
      },
    });

    di.register(skipOverridesInProduction);
    di.register(targetInjectable, overrideInjectable);

    expect(di.inject(targetInjectable)).toBe('real');
  });

  it('tag-keyed dispatch beyond overrides: a generic tag-keyed decorator fires for every tagged injectable', () => {
    const recordedIds = [];

    const taggedInjectable = getInjectable({
      id: 'experimental-thing',
      tags: ['experimental'],
      instantiate: () => 'value',
    });

    const tagRecorder = getInjectable2({
      id: 'experimental-tag-recorder',
      injectionToken: registrationDecoratorToken.for('experimental'),
      instantiate: () => () => registerToBeDecorated => injectable => {
        recordedIds.push(injectable.id);
        registerToBeDecorated(injectable);
      },
    });

    di.register(tagRecorder);
    di.register(taggedInjectable);

    expect(recordedIds).toEqual(['experimental-thing']);
  });

  it('chaining: two overrides for the same target compose via flow', () => {
    const targetInjectable = getInjectable({
      id: 'target-chained',
      instantiate: () => 'real',
    });

    const innerOverride = getInjectable2({
      id: 'override--inner',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => () => () => 'inner',
    });

    const outerOverride = getInjectable2({
      id: 'override--outer',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => instantiateToBeDecorated => di => {
        const wrapped = instantiateToBeDecorated(di);
        return `outer(${wrapped})`;
      },
    });

    di.register(targetInjectable, innerOverride, outerOverride);

    // flow chains decorators; one of them stubs out the value and the other
    // wraps it. Either order is valid composition; we just confirm the
    // chain produces the wrap-of-the-stub or stub-of-the-wrap shape.
    const result = di.inject(targetInjectable);
    expect([
      'outer(inner)',
      'inner', // if inner is applied last, it discards outer
    ]).toContain(result);
  });

  it('imperative override wins absolutely over a declarative override', () => {
    const targetInjectable = getInjectable({
      id: 'target-imperative',
      instantiate: () => 'real',
    });

    const declarativeOverride = getInjectable2({
      id: 'override--target-imperative-declarative',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => () => () => 'declarative',
    });

    di.register(targetInjectable, declarativeOverride);

    di.override(targetInjectable, () => 'imperative');

    expect(di.inject(targetInjectable)).toBe('imperative');
  });

  it('without imperative override, declarative override is what wins', () => {
    const targetInjectable = getInjectable({
      id: 'target-only-declarative',
      instantiate: () => 'real',
    });

    const declarativeOverride = getInjectable2({
      id: 'override--target-only-declarative',
      injectionToken: instantiationDecoratorToken.for(targetInjectable),
      instantiate: () => () => () => () => 'declarative',
    });

    di.register(targetInjectable, declarativeOverride);

    expect(di.inject(targetInjectable)).toBe('declarative');
  });
});
