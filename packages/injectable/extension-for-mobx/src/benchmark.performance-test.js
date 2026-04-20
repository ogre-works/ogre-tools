import { autorun, configure, runInAction } from 'mobx';
import {
  createContainer,
  getInjectable,
  getInjectionToken,
} from '@lensapp/injectable';

import {
  computedInjectManyInjectable,
  computedInjectManyInjectionToken,
} from './computedInjectMany';
import { registerMobX } from './registerMobx';
import { computedInjectMaybeInjectionToken } from './computedInjectMaybe';

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
});

const ITERATIONS = {
  registerUnobservedTokens: 2000,
  registerObservedTokens: 2000,
  injectWrapper: 100_000,
  maybeReads: 200_000,
};

const measure = (label, fn) => {
  // Warmup
  fn();
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    fn();
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  const median = samples[2];
  // eslint-disable-next-line no-console
  console.log(
    `[BENCH] ${label}: median ${median.toFixed(2)}ms (min ${samples[0].toFixed(
      2,
    )}, max ${samples[4].toFixed(2)})`,
  );
  return median;
};

const makeTokens = (n) =>
  Array.from({ length: n }, (_, i) =>
    getInjectionToken({ id: `bench-token-${i}` }),
  );

const makeInjectableForToken = (token, i) =>
  getInjectable({
    id: `bench-inj-${token.id}-${i}`,
    instantiate: () => ({ token: token.id, i }),
    injectionToken: token,
  });

describe('benchmark (extension-for-mobx)', () => {
  it('registration against UNOBSERVED tokens', () => {
    measure('register unobserved tokens', () => {
      const di = createContainer('bench');
      registerMobX(di);
      const tokens = makeTokens(ITERATIONS.registerUnobservedTokens);
      const injectables = tokens.map((t, i) => makeInjectableForToken(t, i));
      // Register one at a time to exercise the callback path many times.
      for (const inj of injectables) di.register(inj);
    });
  });

  it('registration against OBSERVED tokens', () => {
    measure('register observed tokens', () => {
      const di = createContainer('bench');
      registerMobX(di);
      const tokens = makeTokens(ITERATIONS.registerObservedTokens);

      // Seed each token with one injectable then observe its reactive list.
      const seeds = tokens.map((t, i) => makeInjectableForToken(t, 0));
      for (const inj of seeds) di.register(inj);

      const computedInjectMany = di.inject(computedInjectManyInjectionToken);
      const disposers = tokens.map((t) => {
        const c = computedInjectMany(t);
        return autorun(() => c.get());
      });

      // Now register additional injectables (the timed path).
      const extras = tokens.map((t, i) => makeInjectableForToken(t, 1));
      for (const inj of extras) di.register(inj);

      disposers.forEach((d) => d());
    });
  });

  it('injecting the computedInjectMany wrapper function', () => {
    const di = createContainer('bench');
    registerMobX(di);
    measure('inject wrapper', () => {
      for (let i = 0; i < ITERATIONS.injectWrapper; i++) {
        di.inject(computedInjectManyInjectionToken);
      }
    });
  });

  it('computedInjectMaybe reads (reactive)', () => {
    const di = createContainer('bench');
    registerMobX(di);

    const token = getInjectionToken({ id: 'bench-maybe-token' });
    di.register(
      getInjectable({
        id: 'bench-maybe-impl',
        instantiate: () => ({ value: 42 }),
        injectionToken: token,
      }),
    );

    const computedInjectMaybe = di.inject(computedInjectMaybeInjectionToken);
    const computedMaybe = computedInjectMaybe(token);
    // Keep it live so .get() is fast (cached).
    const dispose = autorun(() => computedMaybe.get());

    measure('maybe reads', () => {
      for (let i = 0; i < ITERATIONS.maybeReads; i++) {
        computedMaybe.get();
      }
    });

    dispose();
  });
});
