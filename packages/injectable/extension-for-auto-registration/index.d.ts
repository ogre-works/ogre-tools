import { DiContainer, DiContainerForInjection } from '@lensapp/injectable';

export function autoRegister(arg: {
  di: DiContainer | DiContainerForInjection;
  targetModule: __WebpackModuleApi.Module;
  getRequireContexts: () => __WebpackModuleApi.RequireContext[];
}): void;
