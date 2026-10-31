// Core React ecosystem library imports
import { useMemo, useState } from 'react'

// Filter items by query across keys
export const useSearch = <T>(items: T[] | null, keys: (keyof T)[]) => {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const list = items ?? []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return list

    return list.filter((item) =>
      keys.some((key) => {
        const raw = item[key]
        if (raw === null || raw === undefined) return false
        return String(raw).toLowerCase().includes(normalized)
      }),
    )
  }, [items, keys, query])

  return { query, setQuery, results }
}
