export const injectionTokenSymbol = 'injection-token';

export default ({ id, decorable = true }) => ({
  id,
  aliasType: injectionTokenSymbol,
  decorable,
});
