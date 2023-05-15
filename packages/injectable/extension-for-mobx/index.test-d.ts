import { expectType } from 'tsd';

import {
  createContainer,
  getInjectionToken,
  InjectionInstanceWithMeta,
} from '@ogre-tools/injectable';

import { IComputedValue } from 'mobx';

import {
  computedInjectManyInjectable,
  computedInjectManyWithMetaInjectable,
} from '.';

const di = createContainer('some-container');

export const someInjectionToken = getInjectionToken<string>({
  id: 'some-injection-token',
});

// Given computedInjectMany, typing is ok.
const computedInjectMany = di.inject(computedInjectManyInjectable);

expectType<IComputedValue<string[]>>(computedInjectMany(someInjectionToken));

// Given computedInjectManyWithMeta, typing is ok.
const computedInjectManyWithMeta = di.inject(
  computedInjectManyWithMetaInjectable,
);

expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionToken),
);
