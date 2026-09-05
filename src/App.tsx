import { useEffect, useRef, useState } from 'react'
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

// The adapter is initialized only on an explicit login click or when the
// browser returns from Keycloak with an OAuth callback. We intentionally do
// not run an SSO check on the public login page.
let keycloakInitPromise: Promise<boolean> | null = null

function initializeKeycloak(options: typeof keycloakConfig = keycloakConfig) {
  if (!keycloakInitPromise) {
    keycloakInitPromise = keycloak.init(options)
  }
  return keycloakInitPromise
}

function LoginPage() {
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const login = async () => {
    if (loginLoading) return
    setLoginError('')
    setLoginLoading(true)

    try {
      // This is the only place that starts Keycloak from the public page.
      await initializeKeycloak()
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
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await keycloak.logout({ redirectUri: window.location.origin })
    } catch (error) {
      console.error('Logout failed', error)
      setLoggingOut(false)
      toast.error('Unable to sign out right now.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button onClick={() => navigate('/recipes')} className="sidebar-brand"><span className="brand-dot" /><span>MUVETH</span><small>KITCHEN</small></button>
        <nav className="sidebar-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
        <button className="logout-button" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button>
      </aside>
      <div className="content-shell">
        <header className="app-header"><div><p>MUVETH KITCHEN</p><h1>Cook. Nourish. Move.</h1></div><button className="mobile-logout" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button></header>
        <main className="app-content"><Outlet /></main>
        <nav className="mobile-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
      </div>
    </div>
  )
}

function ProtectedRoutes() {
  return keycloak.authenticated ? <AppLayout /> : <Navigate to="/" replace />
}

function AppRoutes() {
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

function AuthBootstrap() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const initStarted = useRef(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Keycloak can mutate the callback URL while processing the authorization
    // response. The adapter must therefore finish initialization BEFORE the
    // BrowserRouter is mounted. This also makes the /recipes callback reliable.
    const params = new URLSearchParams(window.location.search)
    const hasAuthCallback = params.has('code') && params.has('state')
    const hasAuthError = params.has('error')

    if (!hasAuthCallback && !hasAuthError) {
      setStatus('ready')
      return
    }

    if (initStarted.current) return
    initStarted.current = true

    if (hasAuthError) {
      const description = params.get('error_description') || params.get('error') || 'Keycloak returned an authentication error.'
      setErrorMessage(description)
      setStatus('error')
      return
    }

    let cancelled = false

    // check-sso is used ONLY for the OAuth callback. It is never executed on
    // the normal public login page, so opening the app does not contact SSO.
    initializeKeycloak({ ...keycloakConfig, onLoad: 'check-sso' }).then((authenticated) => {
      if (cancelled) return

      if (!authenticated) {
        throw new Error('Keycloak returned to the application without an authenticated session.')
      }

      // Remove the one-time authorization code before mounting the router.
      window.history.replaceState({}, '', '/recipes')
      setStatus('ready')
    }).catch((error) => {
      if (cancelled) return
      console.error('Keycloak callback initialization failed', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete secure sign-in.')
      setStatus('error')
    })

    return () => { cancelled = true }
  }, [])

  if (status === 'loading') {
    return <div className="app-state"><div><div className="state-dot" /><p>Signing you in…</p></div></div>
  }

  if (status === 'error') {
    return (
      <div className="app-state">
        <div className="state-card">
          <div className="state-dot error" />
          <h1>Secure sign-in could not complete.</h1>
          <p>{errorMessage || 'Check the Keycloak URL, realm, client ID, and redirect URI configuration.'}</p>
          <button onClick={() => window.location.replace('/')}>Back to login</button>
        </div>
      </div>
    )
  }

  // Important: BrowserRouter is mounted only after any Keycloak callback has
  // been processed. On the normal login page, no Keycloak initialization runs.
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AuthBootstrap /><Toaster position="top-right" toastOptions={{ duration: 3000 }} /></QueryClientProvider>
}
