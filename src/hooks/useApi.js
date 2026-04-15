import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic API data fetching hook with loading/error states
 */
export function useApi(apiFn, params = null, options = {}) {
  const { immediate = true, defaultData = null } = options
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const execute = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(overrideParams ?? params)
      if (mountedRef.current) {
        setData(result)
        setLoading(false)
      }
      return result
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Something went wrong')
        setLoading(false)
      }
      throw err
    }
  }, [apiFn, params])

  const refetch = useCallback((newParams) => {
    return execute(newParams)
  }, [execute])

  useEffect(() => {
    mountedRef.current = true
    if (immediate) {
      execute()
    }
    return () => { mountedRef.current = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch, setData }
}
