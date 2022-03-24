import { DiContainer, InjectionToken } from '@ogre-tools/injectable';

declare module '@ogre-tools/injectable-extensions-for-error-handling' {
  export function registerErrorMonitoring(di: DiContainer): void;

  export const errorMonitorInjectionToken: InjectionToken<
    (error: {
      context: { id: string; instantiationParameter: any }[];
      error: any;
    }) => void | Promise<void>,
    void
  >;
}
