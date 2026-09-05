import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { keycloak, keycloakConfig } from './keycloak'
import { RecipesPage } from './pages/RecipesPage'
import { RoutinePage } from './pages/RoutinePage'
import { CartPage } from './pages/CartPage'
import { SettingsPage } from './pages/SettingsPage'
import { AboutSettingsPage, AccountSettingsPage, AppearanceSettingsPage, InteractiveCookingSettingsPage, PrivacyPolicyPage, RecipeCreationSettingsPage, SecuritySettingsPage, TermsPage } from './pages/SettingsNestedPages'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 5 * 60_000, refetchOnWindowFocus: false } },
})

const nav = [
  { to: '/recipes', label: 'Recipes', icon: '🍴' },
  { to: '/routines', label: 'Routine', icon: '▣' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/settings', label: 'Settings', icon: '●' },
]

const mobileLogo = 'https://raw.githubusercontent.com/USANJAY05/cooking_compass_mobile/main/assets/icon.png'

let keycloakInitPromise: Promise<boolean> | null = null
type KeycloakInitOptions = Parameters<typeof keycloak.init>[0]
function initializeKeycloak(options: KeycloakInitOptions = keycloakConfig) {
  if (!keycloakInitPromise) keycloakInitPromise = keycloak.init(options)
  return keycloakInitPromise
}

// Only an authorization code or an explicit OAuth error means this is an
// authentication callback. Keycloak logout redirects can contain `state`
// without an authorization code; treating that as a login callback causes
// the app to incorrectly show "without an authenticated session" after logout.
function hasKeycloakCallback() {
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error')
}

function LoginPage() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // If the user manually opens the login URL while already signed in,
  // check the existing Keycloak session and take them straight home.
  // check-sso does not start a login redirect for unauthenticated users.
  useEffect(() => {
    let cancelled = false

    initializeKeycloak()
      .then((authenticated) => {
        if (cancelled) return
        if (authenticated || keycloak.authenticated) {
          navigate('/recipes', { replace: true })
          return
        }
        setCheckingSession(false)
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Keycloak session check failed', error)
        setCheckingSession(false)
        setLoginError(error instanceof Error ? error.message : 'Unable to check your secure session.')
      })

    return () => { cancelled = true }
  }, [navigate])

  const login = async () => {
    if (loginLoading || checkingSession) return
    setLoginError(''); setLoginLoading(true)
    try {
      await initializeKeycloak()
      await keycloak.login({ redirectUri: `${window.location.origin}/recipes`, scope: 'openid profile email' })
    } catch (error) {
      console.error('Keycloak login failed', error)
      setLoginLoading(false)
      setLoginError(error instanceof Error ? error.message : 'Unable to start secure sign-in.')
    }
  }

  if (checkingSession) {
    return <div className="app-state"><div><div className="state-dot" /><p>Checking your session…</p></div></div>
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <nav className="nav"><div className="brand-mark"><img src={mobileLogo} alt="MUVETH Kitchen" className="brand-logo" /><span className="brand-divider">/</span><span className="brand-health">HEALTH</span></div><span className="nav-caption">THREE DIMENSIONS. ONE LIFE.</span></nav>
      <section className="hero"><div className="hero-copy"><div className="eyebrow">YOUR KITCHEN, REIMAGINED</div><h1>Eat well.<span>Live better.</span></h1><p>Create beautiful meals, understand what you eat, and make every recipe work for you.</p><div className="feature-strip"><div><strong>🍴</strong><span>Recipes</span></div><div><strong>🌿</strong><span>Ingredients</span></div><div><strong>♡</strong><span>Nutrition</span></div></div><div className="actions"><button onClick={login} className="primary-button" disabled={loginLoading}><span className="button-copy"><b>{loginLoading ? 'Opening your kitchen…' : 'Continue with MUVETH'}</b><small>Secure sign in</small></span>{!loginLoading && <span className="button-arrow">↗</span>}</button></div>{loginError && <p className="error-message">{loginError}</p>}<div className="trust-row"><span className="lock">✦</span><span>Secure authentication</span><span className="divider" /><span>Three Dimensions. One Life.</span></div></div><div className="login-visual" aria-hidden="true"><div className="visual-orb" /><div className="visual-ring" /><div className="logo-card"><img src={mobileLogo} alt="" className="login-logo-image" /></div><div className="floating-card card-top"><span>01</span><strong>Recipes</strong><small>Cook with confidence</small></div><div className="floating-card card-bottom"><span>02</span><strong>Nutrition</strong><small>Understand your food</small></div></div></section>
      <footer><span>© 2026 MUVETH KITCHEN</span><span>COOK. NOURISH. MOVE.</span></footer>
    </main>
  )
}

function AppLayout() {
  const navigate = useNavigate(); const [loggingOut, setLoggingOut] = useState(false)
  const logout = async () => { if (loggingOut) return; setLoggingOut(true); try { await keycloak.logout({ redirectUri: window.location.origin }) } catch (error) { console.error('Logout failed', error); setLoggingOut(false); toast.error('Unable to sign out right now.') } }
  return <div className="app-shell"><aside className="sidebar"><button onClick={() => navigate('/recipes')} className="sidebar-brand"><img src={mobileLogo} alt="MUVETH Kitchen" className="sidebar-logo" /><span className="sidebar-wordmark">MUVETH <small>KITCHEN</small></span></button><nav className="sidebar-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav><button className="logout-button" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button></aside><div className="content-shell"><header className="app-header"><div><p>MUVETH KITCHEN</p><h1>Cook. Nourish. Move.</h1></div><button className="mobile-logout" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button></header><main className="app-content"><Outlet /></main><nav className="mobile-nav">{nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}</nav></div></div>
}

function ProtectedRoutes() { return keycloak.authenticated ? <AppLayout /> : <Navigate to="/" replace /> }

function AppRoutes() {
  return <Routes>
    <Route path="/" element={keycloak.authenticated ? <Navigate to="/recipes" replace /> : <LoginPage />} />
    <Route element={<ProtectedRoutes />}>
      <Route path="/recipes" element={<RecipesPage />} /><Route path="/routines" element={<RoutinePage />} /><Route path="/cart" element={<CartPage />} /><Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/appearance" element={<AppearanceSettingsPage />} /><Route path="/settings/recipe-creation" element={<RecipeCreationSettingsPage />} /><Route path="/settings/interactive-cooking" element={<InteractiveCookingSettingsPage />} /><Route path="/settings/account" element={<AccountSettingsPage />} /><Route path="/settings/security" element={<SecuritySettingsPage />} /><Route path="/settings/about" element={<AboutSettingsPage />} /><Route path="/settings/privacy" element={<PrivacyPolicyPage />} /><Route path="/settings/terms" element={<TermsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={keycloak.authenticated ? '/recipes' : '/'} replace />} />
  </Routes>
}

function AuthBootstrap() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading'); const [errorMessage, setErrorMessage] = useState('')
  useEffect(() => {
    if (!hasKeycloakCallback()) { setStatus('ready'); return }
    let cancelled = false
    initializeKeycloak().then((authenticated) => { if (cancelled) return; if (!authenticated) throw new Error('Keycloak returned without an authenticated session.'); window.history.replaceState({}, document.title, '/recipes'); setStatus('ready') }).catch((error) => { if (cancelled) return; console.error('Keycloak callback processing failed', error); setErrorMessage(error instanceof Error ? error.message : 'Unable to complete secure sign-in.'); setStatus('error') })
    return () => { cancelled = true }
  }, [])
  if (status === 'loading') return <div className="app-state"><div><div className="state-dot" /><p>Signing you in…</p></div></div>
  if (status === 'error') return <div className="app-state"><div className="state-card"><div className="state-dot error" /><h1>Secure sign-in could not complete.</h1><p>{errorMessage || 'Check the Keycloak URL, realm, client ID, and redirect URI configuration.'}</p><button onClick={() => window.location.replace('/')}>Back to login</button></div></div>
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default function App() { return <QueryClientProvider client={queryClient}><AuthBootstrap /><Toaster position="top-right" toastOptions={{ duration: 3000 }} /></QueryClientProvider> }
