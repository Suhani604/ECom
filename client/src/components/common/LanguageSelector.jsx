import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    flag: '🇬🇧',
    greeting: 'Welcome to StyleHub',
    sub: 'India\'s fastest growing fashion marketplace',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    flag: '🇮🇳',
    greeting: 'StyleHub में आपका स्वागत है',
    sub: 'भारत का सबसे तेज़ी से बढ़ता फैशन मार्केटप्लेस',
  },
  {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
    flag: '🏵️',
    greeting: 'StyleHub मध्ये आपले स्वागत आहे',
    sub: 'भारतातील सर्वात वेगाने वाढणारा फॅशन मार्केटप्लेस',
  },
]

const f = 'Poppins, sans-serif'

export default function LanguageSelector({ onSelect }) {
  const { i18n } = useTranslation()
  const [selected, setSelected] = useState('en')
  const [animating, setAnimating] = useState(false)

  const active = LANGUAGES.find(l => l.code === selected)

  const handleContinue = () => {
    if (animating) return
    setAnimating(true)
    i18n.changeLanguage(selected)
    localStorage.setItem('i18nextLng', selected)
    setTimeout(() => onSelect(selected), 400)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: f,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <svg width="48" height="48" viewBox="0 0 38 38" fill="none">
          <defs>
            <linearGradient id="lgSplash" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E91E8C"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
          <rect width="38" height="38" rx="10" fill="url(#lgSplash)"/>
          <rect x="9" y="16" width="20" height="14" rx="2" fill="white" fillOpacity="0.95"/>
          <path d="M14 16V13.5C14 11.015 16.015 9 18.5 9H19.5C21.985 9 24 11.015 24 13.5V16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="15.5" cy="23" r="1.2" fill="#E91E8C"/>
          <circle cx="19"   cy="23" r="1.2" fill="#7C3AED"/>
          <circle cx="22.5" cy="23" r="1.2" fill="#E91E8C"/>
        </svg>
        <div>
          <p style={{ fontWeight: '900', fontSize: '24px', margin: 0, lineHeight: 1, background: 'linear-gradient(135deg,#E91E8C,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StyleHub</p>
          <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '600' }}>Fashion Store</p>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '400px',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(0.96)' : 'scale(1)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>

        {/* Heading — changes with selected language */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: '0 0 6px', lineHeight: 1.3 }}>
            {active.greeting}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            {active.sub}
          </p>
        </div>

        {/* Label */}
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 14px', textAlign: 'center' }}>
          🌐 Choose Your Language
        </p>

        {/* Language options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {LANGUAGES.map(lang => {
            const isActive = selected === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  background: isActive ? 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(124,58,237,0.2))' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1.5px solid rgba(233,30,140,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: f,
                  boxShadow: isActive ? '0 4px 20px rgba(233,30,140,0.2)' : 'none',
                }}
              >
                <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: 0, lineHeight: 1.2 }}>{lang.native}</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0', fontWeight: '500' }}>{lang.name}</p>
                </div>
                {/* Radio dot */}
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: isActive ? '2px solid #E91E8C' : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {isActive && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }} />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #E91E8C, #7C3AED)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            fontFamily: f,
            letterSpacing: '0.5px',
            boxShadow: '0 8px 24px rgba(233,30,140,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(233,30,140,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(233,30,140,0.35)' }}
        >
          {selected === 'hi' ? 'जारी रखें →' : selected === 'mr' ? 'पुढे जा →' : 'Continue →'}
        </button>
      </div>

      {/* Bottom note */}
      <p style={{ fontSize: '11px', color: '#475569', marginTop: '24px', textAlign: 'center' }}>
        You can change language anytime from your profile
      </p>
    </div>
  )
}