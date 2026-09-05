import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { keycloak, keycloakConfig } from './keycloak'
import { RecipesPage } from './pages/RecipesPage'
import { RoutinePage } from './pages/RoutinePage'
import { CartPage } from './pages/CartPage'
import { SettingsPage } from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 5 * 60_000, refetchOnWindowFocus: false } },
})

const nav = [
  { to: '/recipes', label: 'Recipes', icon: '🍴' },
  { to: '/routines', label: 'Routine', icon: '▣' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/settings', label: 'Settings', icon: '●' },
]

function LoginPage() {
  const navigate = useNavigate()
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (keycloak.authenticated) navigate('/recipes', { replace: true })
  }, [navigate])

  const login = async () => {
    if (loginLoading) return
    setLoginError('')
    setLoginLoading(true)
    try {
      await keycloak.login({
        redirectUri: `${window.location.origin}/recipes`,
        scope: 'openid profile email',
      })
    } catch (error) {
      console.error('Keycloak login failed', error)
      setLoginLoading(false)
      setLoginError(error instanceof Error ? error.message : 'Unable to start secure sign-in.')
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <nav className="nav">
        <div className="brand-mark"><span className="brand-dot" /><span>MUVETH</span><span className="brand-divider">/</span><span className="brand-health">HEALTH</span></div>
        <span className="nav-caption">THREE DIMENSIONS. ONE LIFE.</span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">YOUR KITCHEN, REIMAGINED</div>
          <h1>Eat well.<span>Live better.</span></h1>
          <p>Create beautiful meals, understand what you eat, and make every recipe work for you.</p>
          <div className="feature-strip">
            <div><strong>🍴</strong><span>Recipes</span></div>
            <div><strong>🌿</strong><span>Ingredients</span></div>
            <div><strong>♡</strong><span>Nutrition</span></div>
          </div>
          <div className="actions">
            <button onClick={login} className="primary-button" disabled={loginLoading}>
              <span className="button-copy"><b>{loginLoading ? 'Opening your kitchen…' : 'Continue with MUVETH'}</b><small>Secure sign in</small></span>
              {!loginLoading && <span className="button-arrow">↗</span>}
            </button>
          </div>
          {loginError && <p className="error-message">{loginError}</p>}
          <div className="trust-row"><span className="lock">✦</span><span>Secure authentication</span><span className="divider" /><span>Three Dimensions. One Life.</span></div>
        </div>

        <div className="login-visual" aria-hidden="true">
          <div className="visual-orb" />
          <div className="visual-ring" />
          <div className="logo-card"><div className="logo-fallback">MUVETH<br /><small>KITCHEN</small></div></div>
          <div className="floating-card card-top"><span>01</span><strong>Recipes</strong><small>Cook with confidence</small></div>
          <div className="floating-card card-bottom"><span>02</span><strong>Nutrition</strong><small>Understand your food</small></div>
        </div>
      </section>

      <footer><span>© 2026 MUVETH KITCHEN</span><span>COOK. NOURISH. MOVE.</span></footer>
    </main>
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const logout = async () => {
    try { await keycloak.logout({ redirectUri: window.location.origin }) }
    catch (error) { console.error('Logout failed', error); toast.error('Unable to sign out right now.') }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button onClick={() => navigate('/recipes')} className="sidebar-brand"><span className="brand-dot" /><span>MUVETH</span><small>KITCHEN</small></button>
        <nav className="sidebar-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
        <button className="logout-button" onClick={logout}>Sign out</button>
      </aside>
      <div className="content-shell">
        <header className="app-header"><div><p>MUVETH KITCHEN</p><h1>Cook. Nourish. Move.</h1></div><button className="mobile-logout" onClick={logout}>Sign out</button></header>
        <main className="app-content"><Outlet /></main>
        <nav className="mobile-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
      </div>
    </div>
  )
}

function ProtectedRoutes() { return keycloak.authenticated ? <AppLayout /> : <Navigate to="/" replace /> }

function AuthBootstrap() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    let mounted = true
    keycloak.init(keycloakConfig).then((authenticated) => {
      if (!mounted) return
      setStatus('ready')
      if (authenticated && window.location.pathname === '/') window.history.replaceState({}, '', '/recipes')
    }).catch((error) => {
      console.error('Keycloak initialization failed', error)
      if (mounted) setStatus('error')
    })
    return () => { mounted = false }
  }, [])

  if (status === 'loading') return <div className="app-state"><div><div className="state-dot" /><p>Preparing MUVETH Kitchen…</p></div></div>
  if (status === 'error') return <div className="app-state"><div className="state-card"><div className="state-dot error" /><h1>Secure sign-in could not start.</h1><p>Check the Keycloak URL, realm, client ID, and redirect URI configuration.</p><button onClick={() => window.location.reload()}>Try again</button></div></div>

  return (
    <Routes>
      <Route path="/" element={keycloak.authenticated ? <Navigate to="/recipes" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/routines" element={<RoutinePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={keycloak.authenticated ? '/recipes' : '/'} replace />} />
    </Routes>
  )
}

export default function App() {
  return <QueryClientProvider client={queryClient}><BrowserRouter><AuthBootstrap /></BrowserRouter><Toaster position="top-right" toastOptions={{ duration: 3000 }} /></QueryClientProvider>
}
