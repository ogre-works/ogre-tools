export {
  getElementComponent,
  ElementComponent,
  TagNames,
} from './src/element-component';

export { getPlugin, Plugin } from './src/plugin/plugin';

export type { WrapperEntry } from './src/_private/run-plugins';

export type ContributeRef = (
  refCallback: (node: HTMLElement | null) => void,
) => void;

export type ContributeProps = (
  props: Record<string, unknown>,
) => void;
