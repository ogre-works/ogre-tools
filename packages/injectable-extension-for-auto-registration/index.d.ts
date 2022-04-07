import { DiContainer } from '@ogre-tools/injectable';

declare module '@ogre-tools/injectable-extension-for-mobx' {
  export function autoRegister(arg: {
    di: DiContainer;
    requireContexts: __WebpackModuleApi.RequireContext[];
  }): void;
}
