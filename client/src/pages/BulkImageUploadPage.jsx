import { useState, useEffect } from 'react'
import axios from 'axios'

// ─── CONFIG — change this to your API base URL ────────────────────────────────
const API = 'http://localhost:5000/api'

export default function BulkImageUploadPage() {
  const [products, setProducts]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [uploads,  setUploads]    = useState({})   // { productId: FileList }
  const [status,   setStatus]     = useState({})   // { productId: 'uploading'|'done'|'error' }
  const [token,    setToken]      = useState('')
  const [loggedIn, setLoggedIn]   = useState(false)
  const [email,    setEmail]      = useState('')
  const [password, setPassword]   = useState('')
  const [loginErr, setLoginErr]   = useState('')

  const login = async () => {
    setLoginErr('')
    try {
      const { data } = await axios.post(`${API}/auth/login`, { emailOrPhone: email, password })
      const t = data.token || data.data?.token || data.accessToken
      if (!t) return setLoginErr('Token not found in response')
      setToken(t)
      setLoggedIn(true)
    } catch (e) {
      setLoginErr(e.response?.data?.message || 'Login failed')
    }
  }

  useEffect(() => {
    if (!loggedIn) return
    axios.get(`${API}/seller/products`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      const all = data.data || data.products || []
      // Only show products with empty or broken images
      const needsImg = all.filter(p =>
        !p.images?.length ||
        p.images.every(img => !img || img.includes('undefined') || img.includes('localhost'))
      )
      setProducts(needsImg)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [loggedIn, token])

  const handleFileChange = (productId, files) => {
    setUploads(prev => ({ ...prev, [productId]: files }))
  }

  const uploadImages = async (product) => {
    const files = uploads[product._id]
    if (!files || files.length === 0) return alert('Select at least 1 image')

    setStatus(prev => ({ ...prev, [product._id]: 'uploading' }))

    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('images', f))

    // Send keepImages as empty array (replace all)
    formData.append('keepImages', JSON.stringify([]))

    // Also resend required fields so validation passes
    formData.append('title',       product.title)
    formData.append('description', product.description)
    formData.append('mrp',         product.mrp)
    formData.append('sellingPrice',product.sellingPrice)
    formData.append('variants',    JSON.stringify(product.variants))

    try {
      await axios.put(`${API}/seller/products/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      setStatus(prev => ({ ...prev, [product._id]: 'done' }))
      setProducts(prev => prev.filter(p => p._id !== product._id))
    } catch (e) {
      console.error(e)
      setStatus(prev => ({ ...prev, [product._id]: 'error:' + (e.response?.data?.message || e.message) }))
    }
  }

  const uploadAll = async () => {
    for (const product of products) {
      if (uploads[product._id]) {
        await uploadImages(product)
      }
    }
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F9FB', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1A1A2E' }}>Bulk Image Upload</h2>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6B7280' }}>Login as seller to re-upload product images</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Seller email"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
        {loginErr && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '10px' }}>{loginErr}</p>}
        <button onClick={login}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          Login & Load Products
        </button>
      </div>
    </div>
  )

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', fontFamily: 'Poppins, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Bulk Image Upload</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
              {loading ? 'Loading...' : `${products.length} products need images`}
            </p>
          </div>
          {products.length > 0 && (
            <button onClick={uploadAll}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
              Upload All Selected
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#16A34A' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1A1A2E' }}>All products have images!</h3>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>Nothing left to upload.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(product => {
              const st = status[product._id]
              const isDone    = st === 'done'
              const isUploading = st === 'uploading'
              const isError   = st?.startsWith('error:')
              return (
                <div key={product._id} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #EBEBF0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                  {/* No Image placeholder */}
                  <div style={{ width: '64px', height: '64px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: '#94A3B8', fontWeight: '600', textAlign: 'center', lineHeight: '1.3' }}>
                    No<br/>Image
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>₹{product.sellingPrice} &nbsp;•&nbsp; {product.status}</p>
                    {isError && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{st.replace('error:', '')}</p>}
                  </div>

                  {/* File input */}
                  {!isDone && !isUploading && (
                    <label style={{ cursor: 'pointer', padding: '8px 14px', border: '1px dashed #C0C0D0', borderRadius: '8px', fontSize: '12px', color: '#6B7280', flexShrink: 0, textAlign: 'center', minWidth: '120px' }}>
                      {uploads[product._id] ? `${uploads[product._id].length} file(s) selected` : '📁 Select Images'}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                        onChange={e => handleFileChange(product._id, e.target.files)} />
                    </label>
                  )}

                  {/* Upload button */}
                  {!isDone && (
                    <button onClick={() => uploadImages(product)} disabled={isUploading || !uploads[product._id]}
                      style={{ padding: '8px 16px', background: isUploading ? '#94A3B8' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '8px', cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '12px', flexShrink: 0, opacity: !uploads[product._id] ? 0.5 : 1 }}>
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}

                  {/* Done badge */}
                  {isDone && (
                    <span style={{ padding: '8px 16px', background: '#DCFCE7', color: '#16A34A', borderRadius: '8px', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>✅ Done</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}