import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold mb-4" style={{ color: 'var(--color-accent)' }}>
            404
          </h1>
          <h2 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Page Not Found
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link 
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{ 
              backgroundColor: 'var(--color-accent)', 
              color: '#000'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border font-medium transition-all"
            style={{ 
              borderColor: 'var(--border)', 
              color: 'var(--text)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

