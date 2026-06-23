import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN', native: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'HI', native: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'mr', label: 'MR', native: 'मराठी',    flag: '🏵️' },
]

const f = 'Poppins, sans-serif'

export default function LanguageToggle({ isMobile = false }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0]

  const change = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('i18nextLng', code)
    setOpen(false)
  }

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: isMobile ? '6px 10px' : '6px 12px',
          background: open ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'rgba(233,30,140,0.08)',
          border: `1.5px solid ${open ? 'transparent' : 'rgba(233,30,140,0.3)'}`,
          borderRadius: '20px',
          cursor: 'pointer',
          fontFamily: f,
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: isMobile ? '14px' : '13px' }}>{current.flag}</span>
        {!isMobile && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: open ? 'white' : '#E91E8C', letterSpacing: '0.5px' }}>
            {current.label}
          </span>
        )}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M1 1l4 4 4-4" stroke={open ? 'white' : '#E91E8C'} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          border: '1px solid #F1F5F9',
          overflow: 'hidden',
          minWidth: '150px',
          zIndex: 500,
          animation: 'langDropIn 0.15s ease',
        }}>
          <style>{`@keyframes langDropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: lang.code === current.code ? '#FDF2F8' : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: f,
                borderLeft: lang.code === current.code ? '3px solid #E91E8C' : '3px solid transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (lang.code !== current.code) e.currentTarget.style.background = '#F9FAFB' }}
              onMouseLeave={e => { if (lang.code !== current.code) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '18px' }}>{lang.flag}</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: lang.code === current.code ? '700' : '600', color: lang.code === current.code ? '#E91E8C' : '#1A1A2E', margin: 0, lineHeight: 1.2 }}>
                  {lang.native}
                </p>
                <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontWeight: '500' }}>{lang.label}</p>
              </div>
              {lang.code === current.code && (
                <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}