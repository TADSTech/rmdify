export default function MobileWeb() {
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>RMDify Mobile</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Welcome to RMDify Mobile!
        </h2>
        <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>
          Experience the power of Markdown editing on your mobile device. Create, edit, and manage your documents on the go!
        </p>
        <p className="text-lg mb-6 decoration-violet-300 dark:decoration-violet-400" style={{ color: 'var(--text-muted)' }}>
            Coming soon to native mobile apps for iOS and Android.
        </p>
        <a href="https://github.com/tadstech/rmdify" className="text-lg font-semibold bg-accent dark:bg-accent-dark" style={{ color: 'var(--text)' }}>
            Open Github
        </a>
      </main>
    </div>
  )
}