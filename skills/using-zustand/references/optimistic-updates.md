# Optimistic updates

For server-cached entities, prefer TanStack Query's `onMutate` / `onError` / `onSettled` — built-in rollback. Use store-level optimistic only when Zustand owns the data.

## Pattern

```ts
internal_createTopic: async params => {
  const tmpId = crypto.randomUUID();

  // 1. Optimistic write
  get().internal_dispatchTopic({ type: 'add', value: { ...params, id: tmpId } });

  try {
    // 2. Server
    const realId = await topicService.create(params);
    // 3. Refresh canonical state (replaces the temp row)
    await get().refreshTopics();
    return realId;
  } catch (err) {
    // 4. Roll back
    get().internal_dispatchTopic({ type: 'remove', id: tmpId });
    throw err;
  }
},
```

## Rules

- Generate a temp id client-side; replace on refresh.
- Wrap the server call in `try/catch`; roll back or mark error on failure.
- **Do not use optimistic for deletes.** Recovery is complex — where do you re-insert? Show a loading flag instead.
- Refresh after success — the server is the source of truth.

## Why TanStack Query is usually better

If the data lives in a server cache (TanStack Query, SWR), do optimistic there:

```ts
useMutation({
  mutationFn: createTopic,
  onMutate: async newTopic => {
    await qc.cancelQueries({ queryKey: ['topics'] });
    const prev = qc.getQueryData(['topics']);
    qc.setQueryData(['topics'], (old: Topic[]) => [...old, newTopic]);
    return { prev };
  },
  onError: (_err, _new, ctx) => qc.setQueryData(['topics'], ctx?.prev),
  onSettled: () => qc.invalidateQueries({ queryKey: ['topics'] }),
});
```

Built-in rollback via context, automatic invalidation. Use Zustand optimistic only when there is no query cache layer.
