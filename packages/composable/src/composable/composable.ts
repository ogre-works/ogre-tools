import { pipeline } from '@ogre-tools/fp';
import { fromPairs, map } from 'lodash/fp';

export interface Composable<T> {
  readonly symbol: unique symbol;
  readonly template: T;
}

export const getComposable = <T>(name: string): Composable<T> =>
  ({ symbol: Symbol(name) } as unknown as Composable<T>);

export const isComposedOf =
  <T extends Composable<any>>(composable: T) =>
  (thing: any): thing is T['template'] => {
    return thing[composable.symbol] === true;
  };

// Todo: implement this pyramid of overrides with ts-tuple recursion somehow.
export function compose<
  T1 extends Composable<unknown>,
  T2 extends Composable<unknown>,
  T3 extends Composable<unknown>,
>(
  composable1: T1,
  composable2: T2,
  composable3: T3,
): <TThing extends T1['template'] & T2['template'] & T3['template']>(
  thing: TThing,
) => TThing;

export function compose<
  T1 extends Composable<unknown>,
  T2 extends Composable<unknown>,
>(
  composable1: T1,
  composable2: T2,
): <TThing extends T1['template'] & T2['template']>(thing: TThing) => TThing;

export function compose<T1 extends Composable<unknown>>(
  composable1: T1,
): <TThing extends T1['template']>(thing: TThing) => TThing;

export function compose(...composables: Composable<unknown>[]) {
  const symbols: object = pipeline(
    composables,
    map(({ symbol }) => [symbol, true]),
    fromPairs,
  );

  return (thing: object) => ({ ...thing, ...symbols });
}
