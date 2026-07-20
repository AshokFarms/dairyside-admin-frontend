import { cn } from '../../utils/cn'

// Centers page content and caps it on very large screens so lines/tables don't
// stretch edge-to-edge on wide monitors. The AppShell <main> owns the outer
// padding (responsive); this just constrains width. Use once at the top of a page.
export default function PageContainer({ children, className, size = 'default' }) {
  const max = size === 'narrow' ? 'max-w-4xl' : size === 'wide' ? 'max-w-[1800px]' : 'max-w-[1600px]'
  return <div className={cn('mx-auto w-full', max, className)}>{children}</div>
}
