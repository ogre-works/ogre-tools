import { pipeline } from '@ogre-tools/fp';

import type {
  DiContainerForInjection,
  InjectionToken,
} from '@ogre-tools/injectable';

import { filter, forEach, map, tap } from 'lodash/fp';
import { throwWithIncorrectHierarchyFor } from './throw-with-incorrect-hierarchy-for';

export interface Runnable<TParameter = void> {
  run: Run<TParameter>;
  runAfter?: this;
}

type Run<Param> = (parameter: Param) => Promise<void> | void;

export type RunMany = <Param>(
  injectionToken: InjectionToken<Runnable<Param>, void>,
) => Run<Param>;

export const runManyFor =
  (di: DiContainerForInjection): RunMany =>
  injectionToken =>
  async parameter => {
    const allRunnables = di.injectMany(injectionToken);

    const throwWithIncorrectHierarchy =
      throwWithIncorrectHierarchyFor(allRunnables);

    const recursedRun = async (
      runAfterRunnable: Runnable<any> | undefined = undefined,
    ) =>
      await pipeline(
        allRunnables,

        tap(runnables => forEach(throwWithIncorrectHierarchy, runnables)),

        x => filter(runnable => runnable.runAfter === runAfterRunnable, x),

        x =>
          map(async runnable => {
            await runnable.run(parameter);

            await recursedRun(runnable);
          }, x),

        promises => Promise.all(promises),
      );

    await recursedRun();
  };
