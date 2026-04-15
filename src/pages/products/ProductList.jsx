import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/formatters'

const mockProducts = Array.from({ length: 20 }, (_, i) => {
  const names = ['A2 Cow Milk', 'Buffalo Milk', 'Toned Milk', 'Paneer (Fresh)', 'Dahi (Curd)', 'Ghee (Desi)', 'Buttermilk', 'Cream', 'Skimmed Milk', 'Flavored Milk']
  const categories = ['Milk', 'Milk', 'Milk', 'Dairy Products', 'Dairy Products', 'Dairy Products', 'Beverages', 'Dairy Products', 'Milk', 'Beverages']
  return {
    id: i + 1,
    name: names[i % names.length],
    slug: names[i % names.length].toLowerCase().replace(/ /g, '-').replace(/[()]/g, ''),
    category: categories[i % categories.length],
    variants_count: Math.floor(Math.random() * 3) + 1,
    min_price: [35, 45, 28, 85, 55, 350, 25, 120, 30, 40][i % 10],
    stock_total: Math.floor(Math.random() * 200) + 10,
    is_active: i % 7 !== 0,
    is_featured: i % 3 === 0,
    is_subscription_eligible: i < 6,
    order_count: Math.floor(Math.random() * 500) + 50,
    created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  }
})

export default function ProductList() {
  const navigate = useNavigate()

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', flexShrink: 0,
          }}>
            🥛
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'variants_count',
      header: 'Variants',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{val}</span>,
    },
    {
      key: 'min_price',
      header: 'Starting ₹',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>₹{val}</span>,
    },
    {
      key: 'stock_total',
      header: 'Stock',
      align: 'center',
      render: (val) => (
        <span style={{
          fontWeight: 600,
          color: val < 20 ? 'var(--color-danger)' : val < 50 ? 'var(--color-warning)' : 'var(--color-success)',
        }}>
          {val}
        </span>
      ),
    },
    {
      key: 'order_count',
      header: 'Orders',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (val) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
          background: val ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          color: val ? 'var(--color-success)' : 'var(--color-danger)',
        }}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'is_featured',
      header: 'Featured',
      align: 'center',
      render: (val) => val ? <span style={{ fontSize: '1rem' }}>⭐</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/products/${row.id}/edit`) }}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Products" subtitle={`${mockProducts.length} products`}>
        <Button variant="primary" size="md" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        } onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={mockProducts}
        onRowClick={(row) => navigate(`/products/${row.id}/edit`)}
        pagination={{ total: mockProducts.length, limit: 20, offset: 0 }}
        emptyTitle="No products found"
      />
    </div>
  )
}
