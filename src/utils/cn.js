// Tiny className combiner — joins truthy class strings. Keeps JSX DRY without
// pulling in a dependency. Usage: cn('base', condition && 'active', props.className)
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default cn
