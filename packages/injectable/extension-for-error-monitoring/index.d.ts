import { DiContainer, InjectionToken } from '@ogre-tools/injectable';

export function registerErrorMonitoring(di: DiContainer): void;

export const errorMonitorInjectionToken: InjectionToken<
  (error: {
    context: { id: string; instantiationParameter: any }[];
    error: any;
  }) => void | Promise<void>,
  void
>;
