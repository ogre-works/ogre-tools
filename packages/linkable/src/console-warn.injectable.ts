import { getInjectable } from '@lensapp/injectable';

export type ConsoleWarn = typeof console.warn;

export const consoleWarnInjectable = getInjectable({
  id: 'console-warn',
  instantiate:
    /* c8 ignore next */
    (): ConsoleWarn => console.warn,
});
