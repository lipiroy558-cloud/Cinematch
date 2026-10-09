import { useEffect, useState } from 'react'

// Generic hook that keeps a piece of state in sync with localStorage.
// Falls back gracefully (in-memory only) if localStorage is unavailable
// (e.g. private browsing mode, storage disabled).
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write errors (storage full / disabled) — state still
      // works in-memory for the current session.
    }
  }, [key, value])

  return [value, setValue]
}
