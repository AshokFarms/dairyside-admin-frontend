import { cn } from '../../utils/cn'

// Responsive form field grid: 1 column on phones, auto-fitting multi-column on
// larger screens. Replaces the repeated inline
// `gridTemplateColumns: 'repeat(auto-fit, minmax(…))'` blocks. Children are
// field wrappers; each naturally spans one cell (use `col-span-full` on a child
// via className for full-width fields).
export default function FormGrid({ children, className, min = 200 }) {
  return (
    <div
      className={cn('grid gap-3 sm:gap-4', className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}
    >
      {children}
    </div>
  )
}
