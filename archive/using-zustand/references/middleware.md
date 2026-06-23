# Zustand middleware

Use the curried form to compose. Order matters (outer-to-inner):

```ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<State>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer(set => ({ /* ... */ }))
      ),
      { name: 'my-store', storage: createJSONStorage(() => localStorage) }
    ),
    { name: 'MyStore' }
  )
);
```

Persist before devtools so devtools labels survive rehydration.

## persist

- Pass `name` (storage key) — required.
- Pass `partialize` to whitelist persisted fields: `partialize: s => ({ theme: s.theme })`. Never persist `isSubmitting`, `errors`, server data, or function references.
- Pass `version` and `migrate` when the shape changes. Bumping `version` without `migrate` wipes user state.
- `Date`, `Map`, `Set`, `bigint` do not survive JSON. Avoid in persisted fields or use a custom storage with a reviver.
- **SSR hydration mismatch:** server renders with initial state, client rehydrates from storage on mount. Gate UI on `useStore.persist.hasHydrated()` or render after `onRehydrateStorage` fires to avoid flashes.

## devtools

Dev-only by default. Pass `name` to identify the store in Redux DevTools. Label each `set` with an action name for readable history:

```ts
setSearch: search => set({ search }, false, 'users/setSearch'),
```

Third arg `false` = merge (default).

## immer

Use when updates are deeply nested. Avoid for flat state — adds bundle weight for no gain.

```ts
addTag: (id, tag) => set(state => {
  state.byId[id].tags.push(tag); // mutate freely
}),
```

## subscribeWithSelector

Lets non-React code react to specific slices:

```ts
useStore.subscribe(s => s.theme, theme => document.documentElement.dataset.theme = theme);
```
