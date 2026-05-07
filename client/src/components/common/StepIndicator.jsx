function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, i) => {
        const num    = i + 1
        const done   = num < current
        const active = num === current

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${done   ? 'bg-green-500 text-white'
                : active ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                :          'bg-gray-100 text-gray-400'}`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap font-medium
                ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all
                ${done ? 'bg-green-400' : 'bg-gray-200'}`}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator