import type { StateCreator } from 'zustand'

// Minimum shape required for stored entities
export interface IIdentifiable {
  id: string
}

// State and actions of entity stores
export interface IEntityState<T extends IIdentifiable> {
  items: T[] | null
  loading: boolean
  error: string | null
  set: (items: T[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  add: (item: T) => void
  addMany: (incoming: T[]) => void
  update: (id: string, patch: Partial<T>) => void
  remove: (id: string) => void
  clearItems: () => void
  get: (id: string) => T | undefined
  reset: () => void
}

// Comparator used to order store items
export type EntityComparator<T> = (a: T, b: T) => number

// Build locale-aware comparator from string selector
export const sortByLocale =
  <T>(selector: (item: T) => string): EntityComparator<T> =>
    (a, b) =>
      selector(a).localeCompare(selector(b), undefined, { numeric: true, sensitivity: 'base' })

// Find first unused numbered entity name
export const nextAvailableName = (prefix: string, start: number, names: string[]): string => {
  const taken = new Set(names)
  let index = start
  while (taken.has(`${prefix} ${index}`)) index += 1
  return `${prefix} ${index}`
}

// Zustand slice factory for entity collections
export const createEntityStore =
  <T extends IIdentifiable>(
    sort?: EntityComparator<T>,
  ): StateCreator<IEntityState<T>, [], [], IEntityState<T>> =>
    (set, get) => {
      const applySort = (list: T[]): T[] => (sort ? [...list].sort(sort) : [...list])

      return {
        items: null,
        loading: false,
        error: null,
        set: (items) => set({ items: applySort(items), loading: false, error: null }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error, loading: false }),
        // Idempotent append or merge by id
        add: (item) =>
          set((state) => {
            const current = state.items ?? []
            const exists = current.some((existing) => existing.id === item.id)
            const next = exists
              ? current.map((existing) => (existing.id === item.id ? item : existing))
              : [...current, item]
            return { items: applySort(next), error: null }
          }),
        addMany: (incoming) =>
          set((state) => {
            const byId = new Map<string, T>()
            for (const existing of state.items ?? []) {
              byId.set(existing.id, existing)
            }
            for (const item of incoming) {
              byId.set(item.id, item)
            }
            return { items: applySort(Array.from(byId.values())), error: null }
          }),
        update: (id, patch) =>
          set((state) => {
            if (!state.items) return state
            const next = state.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
            return { items: applySort(next) }
          }),
        remove: (id) =>
          set((state) => {
            if (!state.items) return state
            return { items: state.items.filter((item) => item.id !== id) }
          }),
        clearItems: () => set({ items: [], error: null }),
        get: (id) => get().items?.find((item) => item.id === id),
        reset: () => set({ items: null, loading: false, error: null }),
      }
    }
