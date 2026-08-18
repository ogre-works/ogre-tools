import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { range } from 'lodash/fp';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  injectionDecoratorToken,
  instantiationDecoratorToken,
  registrationDecoratorToken,
} from '../dependency-injection-container/tokens';

const performance = require('perf_hooks').performance;

const someInjectionToken = getInjectionToken({ id: 'some-injection-token' });

// 30k injectables: 20k with a token (10k of those tagged), 10k token- and
// tag-less children — exercises every branch of the decorator lookup.
const buildBaseInjectables = () =>
  range(0, 10000).flatMap(x => {
    const child = getInjectable({
      id: `some-child-id-${x}`,
      instantiate: () => {},
    });

    const parent = getInjectable({
      id: `some-parent-id-${x}`,
      injectionToken: someInjectionToken,
      tags: ['some-tag'],
      instantiate: di => di.inject(child),
    });

    const parent2 = getInjectable({
      id: `some-parent-2-id-${x}`,
      injectionToken: someInjectionToken,
      instantiate: di => di.inject(child),
    });

    return [parent, parent2, child];
  });

describe('targeted-decoration.performance', () => {
  describe('30k injectables, no decorators registered (fast path)', () => {
    let di;
    let injectables;
    let p1;
    let p2;

    beforeEach(() => {
      di = createContainer('some-container-id');
      injectables = buildBaseInjectables();

      p1 = performance.now();
      di.register(...injectables);
      p2 = performance.now();
    });

    it('register: logs and asserts threshold', () => {
      console.log(
        `[BENCH] no-decorators 30k register: ${(p2 - p1).toFixed(2)}ms`,
      );
      expect(p2 - p1).toBeLessThan(40);
    });

    it('injectMany: logs and asserts threshold', () => {
      const p3 = performance.now();
      di.injectMany(someInjectionToken);
      const p4 = performance.now();

      console.log(
        `[BENCH] no-decorators 20k injectMany: ${(p4 - p3).toFixed(2)}ms`,
      );
      expect(p4 - p3).toBeLessThan(200);
    });
  });

  describe('30k injectables + 1 tag-keyed registration decorator', () => {
    let p1;
    let p2;
    let seenCount;

    beforeEach(() => {
      const di = createContainer('some-container-id');
      const injectables = buildBaseInjectables();

      seenCount = 0;
      const tagDecorator = getInjectable2({
        id: 'some-tag-registration-decorator',
        injectionToken: registrationDecoratorToken.for('some-tag'),
        instantiate: () => () => registerToBeDecorated => injectable => {
          seenCount++;
          registerToBeDecorated(injectable);
        },
      });

      p1 = performance.now();
      di.register(tagDecorator, ...injectables);
      p2 = performance.now();
    });

    it('register: logs and asserts threshold', () => {
      console.log(
        `[BENCH] tag-keyed registration decorator 30k register: ${(
          p2 - p1
        ).toFixed(2)}ms`,
      );
      expect(seenCount).toBe(10000);
      expect(p2 - p1).toBeLessThan(500);
    });
  });

  describe('30k injectables + 1 tag-keyed instantiation decorator', () => {
    let di;

    beforeEach(() => {
      di = createContainer('some-container-id');
      const injectables = buildBaseInjectables();

      const tagDecorator = getInjectable2({
        id: 'some-tag-instantiation-decorator',
        injectionToken: instantiationDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          instantiationToBeDecorated =>
          (someDi, ...params) =>
            instantiationToBeDecorated(someDi, ...params),
      });

      di.register(tagDecorator, ...injectables);
    });

    it('injectMany: logs and asserts threshold', () => {
      const p1 = performance.now();
      di.injectMany(someInjectionToken);
      const p2 = performance.now();

      console.log(
        `[BENCH] tag-keyed instantiation decorator 20k injectMany: ${(
          p2 - p1
        ).toFixed(2)}ms`,
      );
      expect(p2 - p1).toBeLessThan(500);
    });
  });

  describe('30k injectables + 1 tag-keyed injection decorator', () => {
    let di;
    let injectables;

    beforeEach(() => {
      di = createContainer('some-container-id');
      injectables = buildBaseInjectables();

      const tagDecorator = getInjectable2({
        id: 'some-tag-injection-decorator',
        injectionToken: injectionDecoratorToken.for('some-tag'),
        instantiate:
          () =>
          () =>
          injectToBeDecorated =>
          (...params) =>
            injectToBeDecorated(...params),
      });

      di.register(tagDecorator, ...injectables);
    });

    it('inject each injectable once (cold per-alias cache), then again (warm): logs and asserts thresholds', () => {
      const p1 = performance.now();
      for (const injectable of injectables) {
        di.inject(injectable);
      }
      const p2 = performance.now();

      console.log(
        `[BENCH] tag-keyed injection decorator 30k inject (cold): ${(
          p2 - p1
        ).toFixed(2)}ms`,
      );

      const p3 = performance.now();
      for (const injectable of injectables) {
        di.inject(injectable);
      }
      const p4 = performance.now();

      console.log(
        `[BENCH] tag-keyed injection decorator 30k inject (warm): ${(
          p4 - p3
        ).toFixed(2)}ms`,
      );

      expect(p2 - p1).toBeLessThan(1000);
      expect(p4 - p3).toBeLessThan(500);
    });
  });
});
