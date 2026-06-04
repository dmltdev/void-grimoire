---
name: using-zustand
domain: react
description: Use when creating or refactoring a Zustand store, debugging re-renders or selector issues, picking between local state / Context / Zustand / server state, adding optimistic updates, persisting state, integrating with Next.js App Router (SSR), or migrating from Redux. Triggers on `import { create } from 'zustand'`, files matching `**/stores/**`, `**/*.store.ts`, `**/slices/**`, or mentions of "zustand", "useShallow", "persist middleware", "optimistic update", "selector aggregate".
depends-on: []
chains-to: null
suggests: []
---

# Using Zustand

A small, fast, scalable store. Mental model: a single hook returns selected slices of state; setters live next to state; React subscribes per-selector.

## When to reach for Zustand (and when not to)

Pick Zustand when:
- State is shared across unrelated components or routes.
- State outlives a single component but isn't server data.
- Context would cause too many re-renders, or prop drilling is painful.

Do not use Zustand for:
- **Server data** => TanStack Query / SWR / RSC fetch.
- **URL state** => `nuqs` / search params.
- **Pure local UI state** => `useState` / `useReducer`.
- **Complex forms** => `react-hook-form`. (Simple app-spanning forms can live in a Zustand store — see `references/forms.md`.)

A store can coexist with all of the above. Keep the source of truth singular per field — don't mirror URL state into a store.

## Core rules

1. **Type the store** with the curried form: `create<State>()(...)`. Required for middleware inference.
2. **Colocate actions with state** in one interface.
3. **Select narrow slices**, never the whole store object in render.
4. **Use `useShallow`** when selecting objects, arrays, or multiple fields.
5. **Export selectors as an aggregate object**, not ad-hoc inline.
6. **Setters take an updater, not a mutation:** `set(state => ({ ... }))` for derived updates, `set({ x })` for plain replace.
7. **Keep stores small.** Split when an interface grows past ~10 fields or two unrelated concerns appear.
8. **Named exports only.**
9. **Client components only** in Next.js App Router unless using vanilla + Context — see `references/ssr-per-request-store.md`.

## Minimal store

```ts
'use client';

import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Selecting state — the most common mistake

```tsx
// BAD: subscribes to every change
const store = useCounterStore();

// GOOD: subscribes only when `count` changes
const count = useCounterStore(s => s.count);
const increment = useCounterStore(s => s.increment);
```

Each `useStore(selector)` call is an independent subscription. No selector = whole object = re-render on every `set`.

### Multiple fields => `useShallow`

```tsx
import { useShallow } from 'zustand/react/shallow';

const { name, email } = useUserFormStore(
  useShallow(s => ({ name: s.name, email: s.email }))
);
```

Without it, the selector returns a new object every render. Use for multi-field selectors, array slices, any object/array derivation. Action references are stable — select them individually without `useShallow`.

### Store-wide shallow (alternative)

For stores read with many multi-field selectors:

```ts
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

export const useUsersStore = createWithEqualityFn<UsersState>()(
  (set, get) => ({ /* ... */ }),
  shallow
);
```

Pick one approach per store. Don't mix.

## Selector aggregates

Don't inline complex selectors in components. Export one object per store.

```ts
const activeUser = (s: UsersState) => s.activeItem;
const userById = (id: string) => (s: UsersState) => s.byId[id];
const visibleCount = (s: UsersState) => s.filteredItems.length;

export const usersSelectors = { activeUser, userById, visibleCount };

// in a component
const user = useUsersStore(usersSelectors.userById(id));
```

Curried selectors take args first, return `(state) => value`. Selectors are pure — no side effects, no `get()`.

## Initial state + reset

Extract `initialState` so `reset` stays in sync as the store grows:

```ts
const initialState = { url: '', label: '', isGenerating: false };

export const useQRGeneratorStore = create<QRGeneratorState>()(set => ({
  ...initialState,
  setUrl: url => set({ url }),
  reset: () => set(initialState),
}));
```

## Derived state — two options

**A. Derive in the selector** (view-only):

```tsx
const filtered = useUsersStore(
  useShallow(s => s.items.filter(u => u.name.includes(s.search)))
);
```

Always fresh, but runs on every render of every subscriber.

**B. Store the derived slice and recompute in setters** (expensive, many readers):

```ts
setSearch: search => {
  set({ search });
  const { items } = get();
  set({ filteredItems: filterUsers(items, { search }) });
},
```

Recompute on every input that affects the derived field. Tradeoff: easy to forget an input and desync — audit the recompute list. For heavy derivations, prefer memoized selectors or a query layer.

## Entity collections — canonical shape

```ts
interface ChatTopicState {
  topicMaps: Record<string, ChatTopic[]>; // grouped lists, keyed by parent id
  activeTopicId?: string;
  topicLoadingIds: string[];               // multiple parallel in-flight items
  topicsInit: boolean;                     // distinguishes "no data yet" from "empty"
}
```

For single-level lookup, store both ordered list and index:

```ts
setItems: items => {
  const byId = items.reduce((acc, item) => (acc[item.id] = item, acc), {} as Record<string, Item>);
  set({ items, byId });
},
```

Never let `byId` drift from `items`. Always update in the same `set`.

## Public vs internal actions

When a store grows beyond CRUD, split into two tiers:

- **Public** — verbs callable from UI: `createTopic`. Validate input, orchestrate.
- **Internal** — prefixed `internal_`: `internal_createTopic`, `internal_dispatchTopic`. Optimistic updates, service calls, reducer dispatch. Not called from components.

Keeps component-facing surface small. Skip for stores with < ~5 actions or no async work.

## Async actions

Toggle `isSubmitting`/`isLoading` with `try/finally`:

```ts
submitForm: async () => {
  set({ isSubmitting: true });
  try {
    const result = await createXAction(get().payload);
    get().reset();
    return result;
  } catch (ex) {
    set({ errors: { general: getError(ex).message } });
    throw ex;
  } finally {
    set({ isSubmitting: false });
  }
},
```

Don't put server cache here — let TanStack Query own it. The store holds *intent* (form draft, submission state), not canonical server data.

## Anti-patterns

- `const store = useStore()` then `store.x` in JSX — re-renders on every change.
- Returning new object/array from a selector without `useShallow`.
- Storing derived values without listing every input that recomputes them.
- Persisting `isSubmitting`, `errors`, server data, or function refs.
- Calling `set` inside a selector or during render.
- Putting server cache in Zustand.
- Mirroring URL state into a store.
- Module-scoped store with per-request data in RSC apps — see SSR reference.
- One mega-store for the whole app.
- `set({ items: [...state.items, x] })` outside an updater — read via `set(state => ...)`, not `get()` inside `set`.

## Testing

```ts
import { beforeEach } from 'vitest';
import { useUsersStore } from './users.store';

beforeEach(() => {
  useUsersStore.setState(useUsersStore.getInitialState());
});
```

Zustand exposes `getState`, `setState`, `subscribe`, `getInitialState` on the hook. Snapshot or assert via `getState()`.

## File layout

Small store — single file: `src/features/<feature>/stores/<feature>-store.ts`.

Large store — slice folder when > ~10 fields, async actions, reducers, or many selectors:

```
src/stores/<domain>/
  store.ts          // create<T>()(...) composition
  initialState.ts
  actions.ts        // or actions/ subdir
  selectors.ts
  reducer.ts        // (optional) immer reducer for entity dispatch
  helpers.ts
```

One slice = one domain. Promote `features/**/stores/**` to `src/stores/**` only when a second feature consumes it.

## References (read on demand)

- `references/middleware.md` — persist, devtools, immer, subscribeWithSelector. Composition order, partialize, version/migrate, SSR hydration.
- `references/ssr-per-request-store.md` — Next.js App Router per-request store via Context (Pattern B), vanilla stores outside React.
- `references/forms.md` — form store shape, field setters that clear matching errors, Zod validation, edit-flow loading.
- `references/optimistic-updates.md` — temp-id pattern, rollback, why deletes are different, TanStack Query as the better option for server-cached entities.
- `references/recipes.md` — slices pattern, transient updates, reset-all-stores, immer entity reducer.
