import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { getAbstractInjectionToken2 } from '../getInjectionToken2/getAbstractInjectionToken2';

describe('getAbstractInjectionToken2', () => {
  let di;

  beforeEach(() => {
    di = createContainer('test-container');
  });

  describe('given an abstract token', () => {
    let abstractToken;

    beforeEach(() => {
      abstractToken = getAbstractInjectionToken2({
        id: 'some-abstract-token',
      });
    });

    it('when injecting directly with di.inject, throws', () => {
      expect(() => di.inject(abstractToken)).toThrow(
        'Tried to inject injection token "some-abstract-token" from "test-container", but it is abstract. Use ".for(specifier)" for a concrete token.',
      );
    });

    it('when injecting directly with di.injectMany, returns empty array (no injectables registered against the abstract token itself)', () => {
      expect(di.injectMany(abstractToken)).toEqual([]);
    });

    it('when injecting directly with di.injectWithMeta, throws', () => {
      expect(() => di.injectWithMeta(abstractToken)).toThrow(
        'but it is abstract',
      );
    });

    it('when injecting directly with di.injectManyWithMeta, returns empty array', () => {
      expect(di.injectManyWithMeta(abstractToken)).toEqual([]);
    });

    describe('given a specific token derived via .for()', () => {
      let specificToken;

      beforeEach(() => {
        specificToken = abstractToken.for('some-specifier');
      });

      it('the specific token is not abstract', () => {
        expect(specificToken.abstract).toBeFalsy();
      });

      describe('given an injectable registered for the specific token', () => {
        beforeEach(() => {
          const someInjectable = getInjectable2({
            id: 'some-injectable',
            injectionToken: specificToken,
            instantiate: () => () => 'some-instance',
          });

          di.register(someInjectable);
        });

        it('when injecting the specific token, returns the instance', () => {
          expect(di.inject(specificToken)).toBe('some-instance');
        });
      });

      describe('given two injectables registered for the specific token', () => {
        beforeEach(() => {
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
        });

        it('when calling injectMany on the specific token, returns all instances', () => {
          expect(di.injectMany(specificToken)).toEqual([
            'instance-1',
            'instance-2',
          ]);
        });
      });

      describe('given an injectable registered and then overridden for the specific token', () => {
        beforeEach(() => {
          const someInjectable = getInjectable2({
            id: 'some-injectable',
            injectionToken: specificToken,
            instantiate: () => () => 'original',
          });

          di.register(someInjectable);
          di.override2(specificToken, () => () => 'overridden');
        });

        it('when injecting the specific token, returns the overridden instance', () => {
          expect(di.inject(specificToken)).toBe('overridden');
        });
      });
    });

    it('when injecting the abstract token from inside an injectable2 instantiate, throws', () => {
      const outerInjectable = getInjectable2({
        id: 'outer',
        instantiate: di => {
          const getAbstract = di.inject(abstractToken);
          return () => getAbstract();
        },
      });

      di.register(outerInjectable);

      expect(() => di.inject(outerInjectable)).toThrow('but it is abstract');
    });

    it('when registering an injectable with the abstract token as injectionToken, throws', () => {
      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: abstractToken,
        instantiate: () => () => 'some-instance',
      });

      expect(() => di.register(someInjectable)).toThrow(
        'Tried to register injectable "some-injectable" with injection token "some-abstract-token", but it is abstract. Use ".for(specifier)" for a concrete token.',
      );
    });
  });

  describe('nested abstract tokens', () => {
    let rootAbstractToken;

    beforeEach(() => {
      rootAbstractToken = getAbstractInjectionToken2({
        id: 'root-abstract',
        specificInjectionTokenFactory: specifier =>
          getAbstractInjectionToken2({
            id: specifier,
            speciality: specifier,
          }),
      });
    });

    describe('given .for() returns another abstract token', () => {
      let level1Token;

      beforeEach(() => {
        level1Token = rootAbstractToken.for('level-1');
      });

      it('the level-1 token is abstract', () => {
        expect(level1Token.abstract).toBe(true);
      });

      it('when injecting the level-1 token directly, throws', () => {
        expect(() => di.inject(level1Token)).toThrow('but it is abstract');
      });

      describe('given .for() on the abstract sub-token produces a concrete token with an injectable registered', () => {
        let level2Token;

        beforeEach(() => {
          level2Token = level1Token.for('level-2');

          const someInjectable = getInjectable2({
            id: 'some-injectable',
            injectionToken: level2Token,
            instantiate: () => () => 'deep-instance',
          });

          di.register(someInjectable);
        });

        it('the level-2 token is not abstract', () => {
          expect(level2Token.abstract).toBeFalsy();
        });

        it('when injecting the level-2 token, returns the instance', () => {
          expect(di.inject(level2Token)).toBe('deep-instance');
        });
      });
    });
  });
});
