import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, deleteProduct } from '../../store/slices/productSlice'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import { toast } from 'react-toastify'

export default function ProductList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items: products, status, error } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap()
        toast.success("Product deleted successfully")
      } catch (err) {
        toast.error(err || "Failed to delete product")
      }
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', flexShrink: 0, overflow: 'hidden'
          }}>
            {row.thumbnail ? <img src={row.thumbnail} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🥛'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.category_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'variants_count',
      header: 'Variants',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{val || 0}</span>,
    },
    {
      key: 'min_price',
      header: 'Starting ₹',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>₹{val || 0}</span>,
    },
    {
      key: 'stock_total',
      header: 'Stock',
      align: 'center',
      render: (val) => {
        const stock = Number(val || 0);
        return (
          <span style={{
            fontWeight: 600,
            color: stock < 20 ? 'var(--color-danger)' : stock < 50 ? 'var(--color-warning)' : 'var(--color-success)',
          }}>
            {stock}
          </span>
        );
      },
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
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/products/${row.id}/edit`) }}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Products" subtitle={`${products.length} products`}>
        <Button variant="primary" size="md" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        } onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </PageHeader>
      
      {status === 'loading' && <p>Loading products...</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>}

      {!error && status !== 'loading' && (
        <DataTable
          columns={columns}
          data={products}
          onRowClick={(row) => navigate(`/products/${row.id}/edit`)}
          pagination={{ total: products.length, limit: 20, offset: 0 }}
          emptyTitle="No products found"
        />
      )}
    </div>
  )
}
