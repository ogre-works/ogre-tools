export type Plugin<TInputProps, TOutputProps> = (
  props: TInputProps,
) => TOutputProps;

export function getPlugin<TInputProps, TOutputProps>(
  plugin: Plugin<TInputProps, TOutputProps>,
): Plugin<TInputProps, TOutputProps>;

export function getPlugin<
  TInputProps extends TDependencyInputProps,
  TOutputProps extends TDependencyInputProps,
  TDependencyInputProps,
  TDependencyOutputProps,
>(
  plugin: Plugin<TInputProps, TOutputProps>,
  dependency: Plugin<TDependencyInputProps, TDependencyOutputProps>,
): Plugin<TInputProps, TOutputProps>;

export function getPlugin(...args: any[]) {
  return args[0];
}
