import { performance } from 'perf_hooks';
import { map, sortBy } from 'lodash/fp';
import { pipeline } from '@ogre-tools/fp';

const state = new Map();

export const performanceProfile = (key, callBack) => {
  const p1 = performance.now();
  const returnValue = callBack();
  const p2 = performance.now();

  if (!state.has(key)) {
    state.set(key, { duration: 0, count: 0 });
  }

  const currentPerformance = state.get(key);

  currentPerformance.duration += p2 - p1;
  currentPerformance.count++;

  return returnValue;
};

export const withPerformanceProfile =
  (key, toBeDecorated) =>
  (...args) => {
    const p1 = performance.now();
    const decorated = toBeDecorated(...args);
    const p2 = performance.now();

    if (!state.has(key)) {
      state.set(key, { duration: 0, count: 0 });
    }

    const currentPerformance = state.get(key);

    currentPerformance.duration += p2 - p1;
    currentPerformance.count++;

    return decorated;
  };

const humanize = number => Math.round(number * 100) / 100;

export const dumpPerformance = () => {
  const total = state.get(1).duration;

  console.log(
    pipeline(
      [...state.entries()],

      sortBy('[0]'),

      map(([key, { duration, count }]) => ({
        key,
        duration: `${humanize(duration)}ms`,
        count,
        percentage: `${humanize((duration / total) * 100)}%`,
      })),
    ),
  );
};
