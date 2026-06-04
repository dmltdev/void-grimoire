# Next.js App Router & SSR

A module-scoped store (`create(...)` at module top level) is a **singleton across all requests on the server**. That leaks user data between requests and breaks hydration.

Two correct patterns:

## Pattern A — Client-only store (most common)

If the store has no per-request initial data, mark the file `'use client'` and use a module-scoped store. The server never renders the consumers, so there's no leak. This is the default.

## Pattern B — Per-request store via Context (SSR with initial data)

Use `createStore` (vanilla) + a Context provider that creates a fresh store per request.

```tsx
'use client';
import { createStore, useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';

interface CounterState { count: number; inc: () => void }

type CounterStore = ReturnType<typeof createCounterStore>;

const createCounterStore = (initial: { count: number }) =>
  createStore<CounterState>()(set => ({
    count: initial.count,
    inc: () => set(s => ({ count: s.count + 1 })),
  }));

const Ctx = createContext<CounterStore | null>(null);

export function CounterProvider({
  initial,
  children,
}: {
  initial: { count: number };
  children: React.ReactNode;
}) {
  const ref = useRef<CounterStore>();
  if (!ref.current) ref.current = createCounterStore(initial);
  return <Ctx.Provider value={ref.current}>{children}</Ctx.Provider>;
}

export function useCounter<T>(selector: (s: CounterState) => T): T {
  const store = useContext(Ctx);
  if (!store) throw new Error('useCounter outside CounterProvider');
  return useStore(store, selector);
}
```

Server Component reads initial data, renders `<CounterProvider initial={...}>` around the client subtree. Each request gets its own store. Each consumer passes a selector and gets per-slice subscriptions.

## Vanilla stores (no React)

`createStore` returns a store usable outside React — workers, tests, CLI scripts, event handlers attached before mount:

```ts
import { createStore } from 'zustand/vanilla';

export const themeStore = createStore<ThemeState>()(set => ({ /* ... */ }));

themeStore.getState();
themeStore.setState({ theme: 'dark' });
const unsub = themeStore.subscribe(s => console.log(s.theme));
```

Wrap with `useStore(themeStore, selector)` in React components.

## Combining with `nuqs` / URL state

Expose a single hook that fuses URL state and store state:

```ts
export function useCalendarView() {
  const { view, setView } = useCalendarViewUrl(); // nuqs
  const store = useCalendarViewStore();           // zustand
  return { view, setView, ...store };
}
```

Source of truth is singular per field: view in URL, loading in store. Don't mirror URL state into Zustand.
