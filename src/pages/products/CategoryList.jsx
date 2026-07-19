import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
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

  const handleSubmit = async () => {
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
          <div style={{ fontSize: '1.5rem', width: 40, textAlign: 'center' }}>
            {row.image_url || '📁'}
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

      {status === 'loading' && <p>Loading categories...</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>}
      
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
          {['name', 'slug', 'image_url', 'description'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'capitalize' }}>
                {field.replace('_', ' ')}
              </label>
              {field === 'description' ? (
                <textarea value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} rows={3}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              ) : (
                <input type="text" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
                />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
