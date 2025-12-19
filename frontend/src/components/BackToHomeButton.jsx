import { useNavigate } from 'react-router-dom'

export default function BackToHomeButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/home')}
      style={{
        marginBottom: 20,
        padding: '6px 12px',
        cursor: 'pointer',
      }}
    >
      ← Back to Home
    </button>
  )
}
