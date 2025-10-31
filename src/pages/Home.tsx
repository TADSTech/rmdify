import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

export default function Home() {
  const navigate = useNavigate()
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavigate = () => {
    const target = deviceWidth < 768 ? '/mapp' : '/app'
    navigate(target)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <section id="home" aria-labelledby="home-title" className="w-full max-w-3xl text-center px-4">
          <h1
            id="home-title"
            className="mb-6 text-4xl md:text-6xl font-extrabold underline decoration-8"
            style={{ color: 'var(--color-accent)', textDecorationColor: 'var(--color-accent)' }}
          >
            RMD
            <span className="font-mono">ify</span>
          </h1>

          <p className="mb-8 text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Markdown made easy. Edit, preview and export without friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={handleNavigate}
              aria-label="Get started with Rmdify"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-base transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-accent)]"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-contrast)' }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              <span className="ml-2">Get Started</span>
            </motion.button>

            <Link
              to="/mobile"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Open mobile version of Rmdify"
            >
              Check out our mobile version
            </Link>
          </div>

          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            No account required. Works offline and exports to common formats.
          </p>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Rmdify
      </footer>
    </div>
  )
}

function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = document.documentElement.getAttribute('data-theme')
    return (saved as 'light' | 'dark') || 'light'
  })

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <header className="w-full border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between md:justify-start md:gap-8">
          <div className="flex-1 md:flex-none">
            <div className="text-center md:text-left">
              <Link to="/" className="text-2xl font-bold">Rmdify</Link>
            </div>
          </div>

          <motion.button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            style={{ 
              backgroundColor: theme === 'light' ? 'transparent' : 'transparent',
              color: 'inherit'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'light' ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
