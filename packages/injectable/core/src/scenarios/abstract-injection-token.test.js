import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { getAbstractInjectionToken2 } from '../getInjectionToken2/getAbstractInjectionToken2';

describe('getAbstractInjectionToken2', () => {
  let di;

  beforeEach(() => {
    di = createContainer('test-container');
  });

  it('throws when injecting abstract token directly with di.inject', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    expect(() => di.inject(abstractToken)).toThrow(
      'Tried to inject injection token "some-abstract-token" from "test-container", but it is abstract. Use ".for(specifier)" for a concrete token.',
    );
  });

  it('throws when injecting abstract token directly with di.injectMany', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    expect(() => di.injectMany(abstractToken)).toThrow(
      'Tried to inject injection token "some-abstract-token" from "test-container", but it is abstract. Use ".for(specifier)" for a concrete token.',
    );
  });

  it('throws when injecting abstract token directly with di.injectWithMeta', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    expect(() => di.injectWithMeta(abstractToken)).toThrow(
      'but it is abstract',
    );
  });

  it('throws when injecting abstract token directly with di.injectManyWithMeta', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    expect(() => di.injectManyWithMeta(abstractToken)).toThrow(
      'but it is abstract',
    );
  });

  it('allows injecting a specific token derived via .for()', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const specificToken = abstractToken.for('some-specifier');

    const someInjectable = getInjectable2({
      id: 'some-injectable',
      injectionToken: specificToken,
      instantiate: () => () => 'some-instance',
    });

    di.register(someInjectable);

    expect(di.inject(specificToken)).toBe('some-instance');
  });

  it('allows injectMany on a specific token derived via .for()', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const specificToken = abstractToken.for('some-specifier');

    const injectable1 = getInjectable2({
      id: 'injectable-1',
      injectionToken: specificToken,
      instantiate: () => () => 'instance-1',
    });

    const injectable2 = getInjectable2({
      id: 'injectable-2',
      injectionToken: specificToken,
      instantiate: () => () => 'instance-2',
    });

    di.register(injectable1, injectable2);

    expect(di.injectMany(specificToken)).toEqual(['instance-1', 'instance-2']);
  });

  it('specific token from .for() is not abstract', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const specificToken = abstractToken.for('some-specifier');

    expect(specificToken.abstract).toBeFalsy();
  });

  it('throws when injecting abstract token from inside injectable2 instantiate', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const outerInjectable = getInjectable2({
      id: 'outer',
      instantiate: di => {
        const getAbstract = di.inject(abstractToken);
        return () => getAbstract();
      },
    });

    di.register(outerInjectable);

    expect(() => di.inject(outerInjectable)).toThrow(
      'but it is abstract',
    );
  });

  it('allows overriding a specific token derived from abstract', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const specificToken = abstractToken.for('some-specifier');

    const someInjectable = getInjectable2({
      id: 'some-injectable',
      injectionToken: specificToken,
      instantiate: () => () => 'original',
    });

    di.register(someInjectable);

    di.override(specificToken, () => () => 'overridden');

    expect(di.inject(specificToken)).toBe('overridden');
  });

  it('throws when registering an injectable with abstract token as injectionToken', () => {
    const abstractToken = getAbstractInjectionToken2({
      id: 'some-abstract-token',
    });

    const someInjectable = getInjectable2({
      id: 'some-injectable',
      injectionToken: abstractToken,
      instantiate: () => () => 'some-instance',
    });

    expect(() => di.register(someInjectable)).toThrow(
      'Tried to register injectable "some-injectable" with injection token "some-abstract-token", but it is abstract. Use ".for(specifier)" for a concrete token.',
    );
  });

  describe('nested abstract tokens', () => {
    it('.for() can return another abstract token when factory creates abstract tokens', () => {
      const rootAbstractToken = getAbstractInjectionToken2({
        id: 'root-abstract',
        specificInjectionTokenFactory: specifier =>
          getAbstractInjectionToken2({
            id: specifier,
            speciality: specifier,
          }),
      });

      const level1Token = rootAbstractToken.for('level-1');

      expect(level1Token.abstract).toBe(true);

      expect(() => di.inject(level1Token)).toThrow(
        'but it is abstract',
      );
    });

    it('nested .for() on abstract sub-token creates concrete token that can be injected', () => {
      const rootAbstractToken = getAbstractInjectionToken2({
        id: 'root-abstract',
        specificInjectionTokenFactory: specifier =>
          getAbstractInjectionToken2({
            id: specifier,
            speciality: specifier,
          }),
      });

      const level1Token = rootAbstractToken.for('level-1');
      const level2Token = level1Token.for('level-2');

      expect(level2Token.abstract).toBeFalsy();

      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: level2Token,
        instantiate: () => () => 'deep-instance',
      });

      di.register(someInjectable);

      expect(di.inject(level2Token)).toBe('deep-instance');
    });
  });
});
