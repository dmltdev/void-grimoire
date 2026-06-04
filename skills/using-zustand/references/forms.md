# Form stores

For complex multi-step forms or app-spanning drafts, a dedicated Zustand store works well. For simple in-component forms, prefer `react-hook-form` — don't introduce a store for three fields.

## Shape

```ts
interface FormState {
  // fields
  name: string;
  email: string;

  // ui
  isSubmitting: boolean;
  errors: FormErrors;

  // field setters (clear the matching error on edit)
  setName: (v: string) => void;

  // lifecycle
  loadEntity: (e: Entity) => void;
  reset: () => void;
  validateForm: () => boolean;
  submitForm: () => Promise<Entity>;
}
```

## Field setters clear their own error

```ts
setName: name =>
  set(s => ({ name, errors: { ...s.errors, name: undefined } })),
```

## Validation

Run Zod via `safeParse` and write to `errors`:

```ts
validateForm: () => {
  const result = formSchema.safeParse(get().payload);
  if (result.success) {
    set({ errors: {} });
    return true;
  }
  set({ errors: zodErrorsToFieldErrors(result.error) });
  return false;
},
```

## Submission

Always validate first, then server action, then reset on success. Wrap `isSubmitting` in `try/finally`:

```ts
submitForm: async () => {
  if (!get().validateForm()) throw new Error('Invalid form');
  set({ isSubmitting: true });
  try {
    const entity = await createXAction(get().payload);
    get().reset();
    return entity;
  } catch (ex) {
    set({ errors: { general: getError(ex).message } });
    throw ex;
  } finally {
    set({ isSubmitting: false });
  }
},
```

## Edit flows

`loadEntity` populates the store for edit, mirroring `reset` for new:

```ts
loadEntity: entity => set({
  name: entity.name,
  email: entity.email,
  errors: {},
  isSubmitting: false,
}),
```

Keep an `initialState` constant and reuse it in `reset` to stay in sync as fields are added.
