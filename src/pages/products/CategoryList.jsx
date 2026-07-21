import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'

export default function CategoryList() {
  const dispatch = useDispatch()
  const { items: categories, status, error } = useSelector((state) => state.categories)
  
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', display_order: 0, is_active: true, image_url: '' })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories())
    }
  }, [status, dispatch])

  const handleEdit = (cat) => {
    setEditingCategory(cat)
    setForm({ 
      name: cat.name, 
      slug: cat.slug || '', 
      description: cat.description || '', 
      display_order: cat.display_order || 0, 
      is_active: cat.is_active,
      image_url: cat.image_url || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await dispatch(deleteCategory(id)).unwrap()
        toast.success("Category deleted successfully")
      } catch (err) {
        toast.error(err || "Failed to delete category")
      }
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(prev => {
      const updated = { ...prev, name }
      if (!editingCategory) {
        updated.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Category Name is required')
    if (!form.slug.trim()) return toast.error('Category Slug is required')

    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, categoryData: form })).unwrap()
        toast.success("Category updated successfully")
      } else {
        await dispatch(createCategory(form)).unwrap()
        toast.success("Category created successfully")
      }
      setShowModal(false)
    } catch (err) {
      toast.error(err || "Failed to save category")
    }
  }

  const columns = [
    {
      key: 'display_order', header: '#', width: '50px', align: 'center',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>{val}</span>,
    },
    {
      key: 'name', header: 'Category',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', flexShrink: 0, overflow: 'hidden'
          }}>
            {row.image_url ? <img src={row.image_url} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📁'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>/{row.slug}</div>
          </div>
        </div>
      ),
    },
    { key: 'product_count', header: 'Products', align: 'center', render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{val || 0}</span> },
    {
      key: 'is_active', header: 'Status',
      render: (val) => (
        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: val ? 'var(--color-success-light)' : 'var(--color-danger-light)', color: val ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(row) }}>Edit</Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`}>
        <Button variant="primary" size="md" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        } onClick={() => { 
          setEditingCategory(null); 
          setForm({ name: '', slug: '', description: '', display_order: categories.length + 1, is_active: true, image_url: '' }); 
          setShowModal(true) 
        }}>
          Add Category
        </Button>
      </PageHeader>

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <LoadingSpinner size="md" />
        </div>
      )}
      
      {error && (
        <div style={{ padding: '16px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {status !== 'loading' && !error && (
        <DataTable columns={columns} data={categories} emptyTitle="No categories found" />
      )}

      {/* Category Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Category Name *</label>
            <input type="text" value={form.name} onChange={handleNameChange} placeholder="e.g. Milk & Cream" required
              className="admin-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Slug (URL Path) *</label>
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. milk-cream" required
              className="admin-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: form.image_url ? '1fr auto' : '1fr', gap: '12px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Image URL</label>
              <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/image.jpg"
                className="admin-input"
              />
            </div>
            {form.image_url && (
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief category description..."
              className="admin-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                />
                Active Status
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
