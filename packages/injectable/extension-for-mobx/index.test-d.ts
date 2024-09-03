import { expectError, expectType } from 'tsd';

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

// Given token with an instantiation parameter...
export const someInjectionTokenWithParameter = getInjectionToken<
  string,
  number
>({
  id: 'irrelevant',
});

// ...when using computedInjectMany, typing is ok.
expectType<IComputedValue<string[]>>(
  computedInjectMany(someInjectionTokenWithParameter, 42),
);

// ...when using computedInjectManyWithMeta, typing is ok.
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(someInjectionTokenWithParameter, 42),
);

// ...when using a more specific computedInjectManyWithMeta, typing is ok.
expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(
    someInjectionTokenWithParameter.for('some-speciality'),
    42,
  ),
);

expectType<IComputedValue<InjectionInstanceWithMeta<string>[]>>(
  computedInjectManyWithMeta(
    someInjectionTokenWithParameter.for('some-speciality'),
    42,
  ),
);

// ...given instantiation parameter of wrong type, when using computedInjectMany, typing is not ok.
expectError(
  computedInjectMany(someInjectionTokenWithParameter),
  'some-string-instead-of-number',
);

// ...given instantiation parameter of wrong type, when using computedInjectManyWithMeta, typing is not ok.
expectError(
  computedInjectManyWithMeta(
    someInjectionTokenWithParameter,
    'some-string-instead-of-number',
  ),
);

// ...given instantiation parameter of wrong type, when using computedInjectMany, typing is not ok.
expectError(
  computedInjectMany(someInjectionTokenWithParameter),
  'some-string-instead-of-number',
);

// ...given instantiation parameter of wrong type, when using computedInjectManyWithMeta, typing is not ok.
expectError(
  computedInjectManyWithMeta(
    someInjectionTokenWithParameter,
    'some-string-instead-of-number',
  ),
);

// ...given no instantiation parameter, when using computedInjectMany, typing is not ok.
expectError(computedInjectMany(someInjectionTokenWithParameter));

// ...given no instantiation parameter, when using computedInjectManyWithMeta, typing is not ok.
expectError(computedInjectManyWithMeta(someInjectionTokenWithParameter));
