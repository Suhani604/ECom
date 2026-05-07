import { useRef, useState } from 'react'

// ─── OTPInput ─────────────────────────────────────────────────────────────────
// 6-digit OTP input with auto-advance and backspace handling
// Props: onComplete(otpString), loading

function OTPInput({ onComplete, loading }) {
  const [values, setValues] = useState(['', '', '', '', '', ''])
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const newValues = [...values]
    newValues[index] = val
    setValues(newValues)

    // Auto advance
    if (val && index < 5) {
      refs[index + 1].current?.focus()
    }

    // Auto submit when all filled
    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newValues = pasted.split('')
      setValues(newValues)
      refs[5].current?.focus()
      onComplete(pasted)
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={loading}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-12 text-center text-lg font-semibold border-2 rounded-xl
            transition-all duration-200 outline-none
            ${val ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 bg-white text-gray-800'}
            focus:border-pink-400 focus:ring-2 focus:ring-pink-100
            disabled:opacity-50`}
        />
      ))}
    </div>
  )
}

export default OTPInput