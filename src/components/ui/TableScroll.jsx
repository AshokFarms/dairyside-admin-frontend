import { cn } from '../../utils/cn'

// Wrap any raw <table> so it scrolls horizontally INSIDE its own box instead of
// overflowing the page on small screens. `minWidth` keeps columns from crushing
// (the table scrolls once it exceeds the viewport). Use for the hand-rolled
// tables (Dashboard recent-orders, DeliveryManifest, OrderDetail items).
export default function TableScroll({ children, className, minWidth = 640 }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  )
}
