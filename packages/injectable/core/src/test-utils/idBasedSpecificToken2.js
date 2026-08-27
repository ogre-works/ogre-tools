import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

// The default `.for(id)` factory that injection tokens used to get for free
// when no factory was given. Tests that need a real, working `.for()` (as
// opposed to specifically testing a custom factory) pass this explicitly.
export const idBasedSpecificToken2 = id =>
  getInjectionToken2({ id, speciality: id })();
