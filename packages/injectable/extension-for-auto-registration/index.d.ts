import { DiContainer, DiContainerForInjection } from '@ogre-tools/injectable';

export function autoRegister(arg: {
  di: DiContainer | DiContainerForInjection;
  targetModule: __WebpackModuleApi.Module;
  getRequireContexts: () => __WebpackModuleApi.RequireContext[];
}): void;
