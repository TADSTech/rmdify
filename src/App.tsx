import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { useScrollbarStyles } from 'stylisticscroll/react'

const Home = lazy(() => import('./pages/Home'))
const Desktop = lazy(() => import('./pages/App.tsx'))
const Mobile = lazy(() => import('./pages/MApp.tsx'))
const NotFound = lazy(() => import('./pages/NotFound.tsx'))
const MobileWeb = lazy(() => import('./pages/mobileWeb.tsx'))

function App() {
  useScrollbarStyles({ hideScrollbar: true })
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Desktop />} />
        <Route path="/mapp" element={<Mobile />} />
        <Route path="/mobile" element={<MobileWeb />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App