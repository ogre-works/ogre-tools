import { fastFlow } from './fast-flow';

export const rejectKeys = (predicate: (key: PropertyKey) => boolean) =>
  fastFlow(
    Object.entries,
    (entries: any[]) => entries.filter(([key]) => !predicate(key)),
    Object.fromEntries,
  );
