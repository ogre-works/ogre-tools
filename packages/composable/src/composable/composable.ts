import { pipeline } from '@ogre-tools/fp';
import { fromPairs, map } from 'lodash/fp';

export interface Composable<TThing> {
  composes: (thing: any) => thing is TThing;
  create: (thing: TThing) => TThing;
  readonly symbol: unique symbol;
  readonly template: TThing;
}

const composes =
  <TThing>(symbol: any) =>
  (thing: any): thing is TThing =>
    thing[symbol] === true;

export const getComposable = <TThing>(name: string): Composable<TThing> => {
  const symbol = Symbol(name);

  return {
    symbol,
    composes: composes<TThing>(symbol),
    create: createFor(symbol),
  } as unknown as Composable<TThing>;
};

export const isComposedOf = <TComposable extends Composable<any>>(
  composable: TComposable,
) => composes<TComposable['template']>(composable.symbol);

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
  return createFor(...composables.map(c => c.symbol));
}

const createFor = (...symbols: Symbol[]) => {
  const symbolObject: object = pipeline(
    symbols,
    map(symbol => [symbol, true]),
    fromPairs,
  );

  return (thing: object) => ({ ...thing, ...symbolObject });
};
