import { cn } from '../../utils/cn'

// Standard surface card — the app's repeated
// "rounded border bg-card" block, centralized. Padding scales down on phones.
export default function Card({ children, className, padded = true, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface',
        padded && 'p-4 sm:p-5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
