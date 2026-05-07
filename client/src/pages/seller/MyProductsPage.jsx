import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiSearch, FiRefreshCw } from 'react-icons/fi'

import { getMyProductsAPI, deleteProductAPI } from '../../api/sellerAPI.js'

const STATUS_TABS = [
  { key: '',          label: 'All',      color: 'text-gray-600' },
  { key: 'active',    label: 'Active',   color: 'text-green-600' },
  { key: 'pending',   label: 'Pending',  color: 'text-yellow-600' },
  { key: 'rejected',  label: 'Rejected', color: 'text-red-600' },
  { key: 'out_of_stock', label: 'Out of stock', color: 'text-orange-600' },
]

const STATUS_BADGE = {
  active:       'badge-active',
  pending:      'badge-pending',
  rejected:     'badge-rejected',
  out_of_stock: 'text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-medium',
  deleted:      'text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium',
}

export default function MyProductsPage() {
  const navigate = useNavigate()

  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [search,    setSearch]    = useState('')

  const LIMIT = 12

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getMyProductsAPI({ page, limit: LIMIT, status: status || undefined })
      setProducts(data.data)
      setTotal(data.pagination.total)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    try {
      await deleteProductAPI(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch { toast.error('Failed to delete') }
  }

  const filtered = search
    ? products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">My Products</h1>
          <button onClick={() => navigate('/seller/products/add')} className="btn-primary text-sm flex items-center gap-2">
            <FiPlus size={16}/> Add Product
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => { setStatus(tab.key); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                status === tab.key ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search + refresh */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9"
            />
          </div>
          <button onClick={fetchProducts} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <FiRefreshCw size={16}/>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100"/>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-gray-400" size={28}/>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">No products yet</h3>
            <p className="text-sm text-gray-400 mb-5">Start adding products to sell</p>
            <button onClick={() => navigate('/seller/products/add')} className="btn-primary text-sm">
              Add First Product
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div key={product._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow group">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.title}
                      className="w-full h-40 object-cover"
                    />
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors">
                        <FiEdit2 size={14} className="text-orange-600"/>
                      </button>
                      <button onClick={() => handleDelete(product._id, product.title)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                        <FiTrash2 size={14} className="text-red-500"/>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug">{product.title}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">₹{product.sellingPrice}</span>
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={STATUS_BADGE[product.status] || 'badge-pending'}>
                        {product.status?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{product.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  ← Prev
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}