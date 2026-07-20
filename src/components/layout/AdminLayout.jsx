import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import PageContainer from '../ui/PageContainer'
import { useIsDesktop } from '../../hooks/useMediaQuery'

export default function AdminLayout() {
  const isDesktop = useIsDesktop() // lg+ → persistent sidebar; below → off-canvas drawer
  const [collapsed, setCollapsed] = useState(false) // desktop rail collapse
  const [mobileOpen, setMobileOpen] = useState(false) // mobile drawer
  const location = useLocation()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen && !isDesktop) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen, isDesktop])

  // Content is pushed by the sidebar ONLY on desktop; on mobile the drawer floats over.
  const contentMargin = isDesktop
    ? collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)'
    : '0px'

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar
        isDesktop={isDesktop}
        collapsed={isDesktop ? collapsed : false}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Dimmed overlay behind the mobile drawer */}
      {!isDesktop && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 45,
          }}
        />
      )}

      <div
        style={{
          marginLeft: contentMargin,
          transition: 'margin-left var(--transition-base)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header showHamburger={!isDesktop} onHamburger={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  )
}
