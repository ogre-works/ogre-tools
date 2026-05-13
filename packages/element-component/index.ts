export {
  getElementComponent,
  ElementComponent,
  TagNames,
} from './src/element-component';

export { getPlugin, Plugin } from './src/plugin/plugin';

export { getPropsFromPlugins } from './src/get-props-from-plugins';
export type {
  PluginsResult,
  WrapperEntry,
} from './src/get-props-from-plugins';

export type ContributeRef = (
  refCallback: (node: HTMLElement | null) => void,
) => void;

export type ContributeProps = (
  props: Record<string, unknown>,
) => void;
