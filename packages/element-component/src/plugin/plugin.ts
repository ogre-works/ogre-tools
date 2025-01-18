import { AllHtmlAttributesAndDataAttributes } from './_private/types-of-props';

export type Plugin<
  TInputProps extends AllHtmlAttributesAndDataAttributes,
  TOutputProps extends AllHtmlAttributesAndDataAttributes,
> = (props: TInputProps) => TOutputProps;

export function getPlugin<
  TInputProps extends AllHtmlAttributesAndDataAttributes,
  TOutputProps extends AllHtmlAttributesAndDataAttributes,
>(plugin: Plugin<TInputProps, TOutputProps>): Plugin<TInputProps, TOutputProps>;

export function getPlugin<
  TInputProps extends TDependencyInputProps &
    AllHtmlAttributesAndDataAttributes,
  TOutputProps extends TDependencyInputProps &
    AllHtmlAttributesAndDataAttributes,
  TDependencyInputProps extends AllHtmlAttributesAndDataAttributes,
  TDependencyOutputProps extends AllHtmlAttributesAndDataAttributes,
>(
  plugin: Plugin<TInputProps, TOutputProps>,
  dependency: Plugin<TDependencyInputProps, TDependencyOutputProps>,
): Plugin<TInputProps, TOutputProps>;

export function getPlugin(...args: any[]) {
  return args[0];
}
