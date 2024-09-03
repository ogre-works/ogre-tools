import { getInjectable } from '@ogre-tools/injectable';

export type ConsoleLog = typeof console.log;

export const consoleLogInjectable = getInjectable({
  id: 'console-log',
  instantiate:
    /* c8 ignore next */
    (): ConsoleLog => console.log,
});
