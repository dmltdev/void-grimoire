# Zustand recipes

## Slices pattern (for stores that grow past one concern)

```ts
import { create, StateCreator } from 'zustand';

interface AuthSlice {
  user: User | null;
  signIn: (u: User) => void;
}
interface UiSlice {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
type AppState = AuthSlice & UiSlice;

const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = set => ({
  user: null,
  signIn: u => set({ user: u }),
});

const createUiSlice: StateCreator<AppState, [], [], UiSlice> = set => ({
  theme: 'light',
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
});

export const useApp = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUiSlice(...a),
}));
```

Prefer splitting into separate stores first. Slices are for cases where slices need to read each other.

## Transient updates (subscribe without re-rendering)

```ts
import { useEffect, useRef } from 'react';

function ScrollWatcher() {
  const ref = useRef(0);
  useEffect(() => useStore.subscribe(s => (ref.current = s.scrollY)), []);
  // ref.current is current scrollY, no re-render
}
```

Use for high-frequency values (scroll, mouse, audio time) read by imperative APIs.

## Computed via Proxy (rare)

For type-safe getters, use the `combine` middleware or wrap state in a Proxy. Usually a selector is enough — only reach for this when many consumers need the same derived value and re-computing per render is expensive.

## Resetting all stores

```ts
const resetters: Array<() => void> = [];

export const create = (<T>(init: StateCreator<T>) => {
  const store = createImpl(init);
  const initial = store.getState();
  resetters.push(() => store.setState(initial, true));
  return store;
}) as typeof createImpl;

export const resetAllStores = () => resetters.forEach(r => r());
```

Useful on sign-out.

## Reducer pattern with immer (for entity dispatch)

When a slice owns a list of entities with many mutation shapes, a typed reducer keeps actions terse and exhaustively typed:

```ts
type MessageDispatch =
  | { type: 'add'; value: Message }
  | { type: 'update'; id: string; value: Partial<Message> }
  | { type: 'remove'; id: string };

export const messagesReducer = (state: Message[], action: MessageDispatch) =>
  produce(state, draft => {
    switch (action.type) {
      case 'add':
        draft.push(action.value);
        return;
      case 'update': {
        const i = draft.findIndex(m => m.id === action.id);
        if (i < 0) return;
        Object.assign(draft[i], action.value, { updatedAt: Date.now() });
        return;
      }
      case 'remove':
        return draft.filter(m => m.id !== action.id);
    }
  });
```

Wire it through a single `internal_dispatchMessage` action that calls the reducer and writes the result. All entity mutations funnel through it — easy to log, easy to test.

## Selecting with equality function (legacy v4 API)

In v5, equality is passed via `useShallow` or `createWithEqualityFn`. The bare third argument `useStore(selector, equalityFn)` was removed in v5. Use `useShallow` instead.
