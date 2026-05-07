import { useState, useEffect } from 'react'

export default function OnlineUsersPanel() {
  const [count,    setCount]    = useState(0)
  const [activity, setActivity] = useState([])

  useEffect(() => {
    const handler = (e) => setCount(e.detail.count)
    window.addEventListener('online:count', handler)
    return () => window.removeEventListener('online:count', handler)
  }, [])

  return (
    <div style={{
      background: 'white', border: '1px solid #f0f0f0',
      borderRadius: '12px', padding: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' }}/>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Live users online</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>{count}</p>
        </div>
      </div>
      {activity.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '8px 0' }}>
          Waiting for activity...
        </p>
      ) : (
        activity.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '6px' }}>
            <span>{item.action === 'online' ? '🟢' : '🔴'}</span>
            <span style={{ color: '#555', fontWeight: '500' }}>{item.name}</span>
            <span style={{ marginLeft: 'auto', color: '#bbb' }}>
              {new Date(item.time).toLocaleTimeString()}
            </span>
          </div>
        ))
      )}
    </div>
  )
}