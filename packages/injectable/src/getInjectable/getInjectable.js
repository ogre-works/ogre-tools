import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export const injectableSymbol = 'injectable';

export default ({ lifecycle = lifecycleEnum.singleton, ...injectable }) => ({
  aliasType: injectableSymbol,
  lifecycle,
  ...injectable,
});
