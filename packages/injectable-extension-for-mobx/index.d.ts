import { DiContainer } from '@ogre-tools/injectable';

declare module '@ogre-tools/injectable-extension-for-mobx' {
  export function registerMobX(di: DiContainer): void;
}
