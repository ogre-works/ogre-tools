import { DiContainer, InjectionToken } from '@ogre-tools/injectable';

interface GraphCustomizer {
  shouldCustomize: (instance: any) => boolean;
  // Todo: add proper typing
  customizeLink: (link: any) => void;
  customizeNode: (node: any) => void;
}

export const dependencyGraphCustomizerToken: InjectionToken<
  GraphCustomizer,
  void
>;

export function registerDependencyGraphing(di: DiContainer): void;

export const plantUmlDependencyGraphInjectable: InjectionToken<string, void>;
