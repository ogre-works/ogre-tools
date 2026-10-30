# MobX utils in Ogre Tools

Utils for MobX.

> **`asyncComputed` is deprecated.** It decides when to load from MobX
> observation, which modern React no longer reports faithfully: concurrent
> rendering may render a tree that never commits, StrictMode remounts on
> purpose, and a spinner or suspended subtree unmounts the one observer keeping
> the data alive. Use a subscribable instead: live exactly while it has
> subscribers, subscribed from a `useEffect` so React owns the disposal, kept
> alive across a grace period so a remount does not refetch, and resolving a
> promise for its first populated value.

## Documentation

Check unit tests for documentation.
