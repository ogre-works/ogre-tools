import { getInjectable } from '@ogre-tools/injectable';

export type ConsoleLog = typeof console.log;

export const consoleLogInjectable = getInjectable({
  id: 'console-log',
  instantiate: (): ConsoleLog => console.log,
});
