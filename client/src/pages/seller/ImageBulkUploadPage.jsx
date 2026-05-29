import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiUploadCloud, FiX, FiAlertTriangle, FiCheckCircle,
  FiInfo, FiPlus, FiArrowLeft, FiImage, FiAlertCircle,
} from 'react-icons/fi'

const f = '"DM Sans", system-ui, sans-serif'

const NOT_ALLOWED = [
  { label: 'Watermark image',       desc: 'No logos or watermarks on product' },
  { label: 'Fake branded/1st copy', desc: 'No counterfeit brand products' },
  { label: 'Image with price',      desc: 'No price tags visible in image' },
  { label: 'Pixelated image',       desc: 'Image must be clear and sharp' },
  { label: 'Inverted image',        desc: 'No flipped or mirrored photos' },
  { label: 'Blur/unclear image',    desc: 'Image must be in focus' },
  { label: 'Incomplete image',      desc: 'Full product must be visible' },
  { label: 'Stretched/shrunk image',desc: 'Correct aspect ratio required' },
  { label: 'Image with props',      desc: 'No extra objects/backgrounds' },
  { label: 'Image with text',       desc: 'No overlaid text on product' },
]

const TIPS = [
  { icon: '📐', title: 'Square format',    desc: '1:1 ratio, minimum 500×500px' },
  { icon: '💡', title: 'Good lighting',    desc: 'Bright, even, no harsh shadows' },
  { icon: '🎨', title: 'White background', desc: 'Clean white or light grey BG preferred' },
  { icon: '📸', title: 'Multiple angles',  desc: 'Front, back, side & detail shots' },
]

export default function ImageBulkUploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef()
  const dropRef  = useRef()

  const [files,     setFiles]     = useState([])
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showTips,  setShowTips]  = useState(true)

  const addFiles = useCallback((incoming) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024
    const valid = []
    Array.from(incoming).forEach(file => {
      if (!allowed.includes(file.type)) { toast.error(`${file.name}: only JPG, PNG, WEBP allowed`); return }
      if (file.size > maxSize)          { toast.error(`${file.name}: max 5 MB per image`); return }
      valid.push({ file, url: URL.createObjectURL(file), name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', status: 'ready' })
    })
    setFiles(prev => {
      if (prev.length + valid.length > 50) { toast.error('Max 50 images at once'); return prev }
      return [...prev, ...valid]
    })
  }, [])

  const onDragOver  = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = e => { e.preventDefault(); setDragging(false) }
  const onDrop      = e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }
  const removeFile  = idx => { URL.revokeObjectURL(files[idx].url); setFiles(prev => prev.filter((_, i) => i !== idx)) }

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Add at least one image'); return }
    setUploading(true)
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))
    try {
      for (let i = 0; i < files.length; i++) {
        await new Promise(res => setTimeout(res, 300 + Math.random() * 200))
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f))
      }
      toast.success(`${files.length} image(s) uploaded successfully!`)
    } catch {
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error' } : f))
      toast.error('Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const readyCount = files.filter(f => f.status === 'ready').length
  const doneCount  = files.filter(f => f.status === 'done').length

  return (
    /* ✅ No minHeight:100vh here — SellerLayout provides the shell */
    <div style={{ background: '#F3F4F6', fontFamily: f, minHeight: '100%' }}>

      {/* Alert banner */}
      <div style={{ background: '#FFF7F0', borderBottom: '1px solid #FDDCBC', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertTriangle size={15} style={{ color: '#EA580C', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Image quality matters! </span>
          <span style={{ fontSize: '12px', color: '#9A3412' }}>Poor quality images lead to product rejection. Follow the guidelines on the right.</span>
        </div>
        <button style={{ fontSize: '12px', fontWeight: '700', color: '#7C3AED', background: 'none', border: '1.5px solid #7C3AED', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontFamily: f, whiteSpace: 'nowrap' }}
          onClick={() => setShowTips(v => !v)}>
          {showTips ? 'Hide Guidelines' : 'Show Guidelines'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>

        {/* LEFT: Upload Area */}
        <div style={{ flex: 1, padding: '24px 28px', minWidth: 0 }}>

          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '13px', fontFamily: f, fontWeight: '600', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#111827'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
              <FiArrowLeft size={16} />
            </button>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Image Bulk Upload</h1>
          </div>

          {/* Promo banner */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom,#7C3AED,#4F46E5)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: '#EDE9FE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiImage size={16} style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#1F2937' }}>Upload product images for faster catalog creation</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>Add front images and get prefilled catalog template · Max 50 images at once</p>
              </div>
            </div>
            <button onClick={() => navigate('/seller/products/add')}
              style={{ flexShrink: 0, padding: '8px 18px', background: '#fff', border: '1.5px solid #D1D5DB', borderRadius: '7px', fontSize: '12px', fontWeight: '700', color: '#374151', cursor: 'pointer', fontFamily: f, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#7C3AED' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#374151' }}>
              Get Started
            </button>
          </div>

          {/* Drop zone */}
          <div ref={dropRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => files.length === 0 && inputRef.current?.click()}
            style={{ background: dragging ? '#EDE9FE' : '#fff', border: `2px dashed ${dragging ? '#7C3AED' : '#D1D5DB'}`, borderRadius: '10px', minHeight: files.length === 0 ? '280px' : 'auto', display: 'flex', flexDirection: 'column', alignItems: files.length === 0 ? 'center' : 'stretch', justifyContent: files.length === 0 ? 'center' : 'flex-start', cursor: files.length === 0 ? 'pointer' : 'default', transition: 'all 0.2s', overflow: 'hidden' }}>

            {files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '56px', height: '56px', background: '#EDE9FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiPlus size={28} style={{ color: '#7C3AED' }} />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>Add Images</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>You can drop images here</p>
                <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#C4C4C4' }}>JPG · PNG · WEBP · Max 5MB each · Up to 50 images</p>
                <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{files.length} image{files.length !== 1 ? 's' : ''} selected</span>
                    {doneCount > 0 && <span style={{ fontSize: '11px', fontWeight: '700', background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '20px' }}>✓ {doneCount} uploaded</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '7px', fontSize: '12px', fontWeight: '700', color: '#7C3AED', cursor: 'pointer', fontFamily: f }}>
                      <FiPlus size={13} /> Add More
                    </button>
                    <button onClick={() => { files.forEach(f => URL.revokeObjectURL(f.url)); setFiles([]) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '7px', fontSize: '12px', fontWeight: '700', color: '#DC2626', cursor: 'pointer', fontFamily: f }}>
                      <FiX size={13} /> Clear All
                    </button>
                  </div>
                </div>
                <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                  {files.map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${item.status === 'done' ? '#86EFAC' : item.status === 'error' ? '#FCA5A5' : item.status === 'uploading' ? '#C4B5FD' : '#E5E7EB'}`, background: '#F9FAFB', aspectRatio: '1', transition: 'all 0.2s' }}>
                      <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {item.status === 'uploading' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.4)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      )}
                      {item.status === 'done' && (
                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '22px', height: '22px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiCheckCircle size={13} style={{ color: '#fff' }} />
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '22px', height: '22px', background: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiAlertCircle size={13} style={{ color: '#fff' }} />
                        </div>
                      )}
                      {item.status !== 'uploading' && (
                        <button onClick={() => removeFile(idx)}
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                          className="remove-btn">
                          <FiX size={11} style={{ color: '#fff' }} />
                        </button>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', padding: '16px 5px 4px', opacity: 0, transition: 'opacity 0.15s' }} className="img-info">
                        <p style={{ margin: 0, fontSize: '9px', color: '#fff', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '8px', color: 'rgba(255,255,255,0.7)' }}>{item.size}</p>
                      </div>
                    </div>
                  ))}
                  <div onClick={() => inputRef.current?.click()}
                    style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', background: '#FAFAFA' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.background = '#F5F3FF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA' }}>
                    <FiPlus size={20} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>Add</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload button */}
          {files.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                {readyCount > 0 && `${readyCount} image${readyCount !== 1 ? 's' : ''} ready to upload`}
                {doneCount > 0 && readyCount > 0 && ' · '}
                {doneCount > 0 && `${doneCount} uploaded`}
              </p>
              <button onClick={handleUpload} disabled={uploading || readyCount === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px', background: uploading || readyCount === 0 ? '#E5E7EB' : 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: uploading || readyCount === 0 ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: uploading || readyCount === 0 ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: uploading || readyCount === 0 ? 'none' : '0 4px 14px rgba(124,58,237,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!uploading && readyCount > 0) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <FiUploadCloud size={16} />
                {uploading ? 'Uploading...' : `Upload ${readyCount} Image${readyCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Best practices */}
          <div style={{ marginTop: '24px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ Best Practices</p>
            </div>
            {TIPS.map(tip => (
              <div key={tip.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px' }}>{tip.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{tip.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280', lineHeight: 1.5 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Not Allowed Panel */}
        {showTips && (
          <div style={{ width: '260px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #E5E7EB', overflowY: 'auto' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '20px', height: '20px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiAlertCircle size={12} style={{ color: '#DC2626' }} />
                </div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#DC2626' }}>Image types which are not allowed:</p>
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {NOT_ALLOWED.map((item, i) => (
                <div key={i} style={{ padding: '10px 16px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #F9FAFB', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '52px', height: '52px', flexShrink: 0, background: '#F3F4F6', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '28px', height: '28px', background: '#E5E7EB', borderRadius: '4px' }} />
                    <div style={{ position: 'absolute', bottom: '3px', left: '3px', right: '3px', height: '1.5px', background: '#DC2626', transform: 'rotate(-10deg)', borderRadius: '1px' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#1F2937', lineHeight: 1.3 }}>{item.label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiX size={8} style={{ color: '#DC2626' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: '600' }}>NOT ALLOWED</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#9CA3AF', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 16px', background: '#FFFBEB', borderTop: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <FiInfo size={13} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '10px', color: '#92400E', lineHeight: 1.6 }}>
                  Products with non-compliant images will be <strong>rejected during review</strong>. Ensure all images meet quality standards before uploading.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        .remove-btn { opacity: 0 !important; }
        div:hover > .remove-btn { opacity: 1 !important; }
        div:hover > .img-info { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
      `}</style>
    </div>
  )
}