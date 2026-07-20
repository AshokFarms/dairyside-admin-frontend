import { useState, useEffect } from 'react'

// Subscribe to a CSS media query and re-render on change. SSR-safe (defaults to
// false until mounted). Keep the query string static across renders.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// Tailwind's `lg` breakpoint (1024px) is where the persistent sidebar appears.
// Below it we use the off-canvas drawer. One source of truth for that split.
export const DESKTOP_QUERY = '(min-width: 1024px)'
export function useIsDesktop() {
  return useMediaQuery(DESKTOP_QUERY)
}

export default useMediaQuery
