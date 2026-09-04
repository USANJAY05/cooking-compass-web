import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { keycloak, keycloakConfig } from './keycloak'
import { RecipesPage } from './pages/RecipesPage'
import { RoutinePage } from './pages/RoutinePage'
import { CartPage } from './pages/CartPage'
import { SettingsPage } from './pages/SettingsPage'
import './index.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function LoginPage() {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    keycloak.init(keycloakConfig).then((auth) => {
      if (!mounted) return
      setAuthenticated(auth); setReady(true)
      if (auth) navigate('/recipes', { replace: true })
    }).catch((reason) => {
      console.error(reason)
      if (mounted) { setError('Unable to initialize secure sign-in. Check your Keycloak configuration.'); setReady(true) }
    })
    return () => { mounted = false }
  }, [navigate])

  const login = () => {
    setError('')
    keycloak.login({ redirectUri: `${window.location.origin}/recipes` })
  }

  if (authenticated) return null
  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#dfe7dc] blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#e8ddd0] blur-3xl" />
      <nav className="relative z-10 flex items-center justify-between px-6 py-7 md:px-12">
        <div className="flex items-center gap-2 font-bold tracking-[.18em]"><span className="h-2.5 w-2.5 rounded-full bg-moss" />MUVETH <span className="text-xs font-medium tracking-[.25em] text-sage">KITCHEN</span></div>
        <span className="hidden text-xs font-semibold tracking-[.2em] text-sage md:block">THREE DIMENSIONS. ONE LIFE.</span>
      </nav>
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-110px)] max-w-6xl items-center gap-12 px-6 pb-16 md:grid-cols-2 md:px-12">
        <div>
          <p className="mb-5 text-xs font-bold tracking-[.28em] text-sage">YOUR COOKING COMPASS</p>
          <h1 className="font-display text-6xl leading-[.95] md:text-8xl">Cook with<br /><em>intention.</em></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">Recipes, routines, ingredients and your kitchen in one calm space built around the way you actually cook.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={login} disabled={!ready} className="rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">{ready ? 'Continue with Keycloak →' : 'Preparing secure sign-in…'}</button>
            {error && <p className="w-full text-sm text-red-600">{error}</p>}
          </div>
          <p className="mt-8 text-xs font-medium tracking-wide text-sage">◆ Secure authentication &nbsp; · &nbsp; Private by design</p>
        </div>
        <div className="relative mx-auto flex h-[420px] w-[420px] max-w-full items-center justify-center rounded-[3rem] bg-[#e8e4d8] shadow-inner">
          <div className="flex h-64 w-64 items-center justify-center rounded-full border-[18px] border-white bg-[#f1eee7] shadow-2xl"><div className="h-36 w-36 rounded-full bg-[#c8d0bd] shadow-inner" /></div>
          <div className="absolute right-2 top-10 rounded-2xl bg-white p-4 shadow-xl"><span className="block text-xs text-sage">01</span><b>Plan</b><small className="block text-slate-500">your week</small></div>
          <div className="absolute bottom-10 left-2 rounded-2xl bg-ink p-4 text-white shadow-xl"><span className="block text-xs text-[#a9b99e]">02</span><b>Cook</b><small className="block text-slate-300">with clarity</small></div>
        </div>
      </section>
    </main>
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const logout = () => keycloak.logout({ redirectUri: window.location.origin })
  const nav = [
    { to: '/recipes', label: 'Recipes', icon: '⌂' },
    { to: '/routines', label: 'Routine', icon: '◷' },
    { to: '/cart', label: 'Cart', icon: '□' },
    { to: '/settings', label: 'Settings', icon: '⚙' },
  ]
  return <div className="min-h-screen bg-cream text-ink md:flex">
    <aside className="hidden w-64 flex-col border-r border-black/5 bg-white/60 p-6 md:flex">
      <button onClick={() => navigate('/recipes')} className="mb-12 text-left"><div className="font-bold tracking-[.18em]">MUVETH</div><div className="text-xs font-medium tracking-[.25em] text-sage">KITCHEN</div></button>
      <nav className="space-y-2">{nav.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-ink text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><span className="w-5 text-center">{item.icon}</span>{item.label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-black/5 pt-5"><button onClick={logout} className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">Sign out</button></div>
    </aside>
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-cream/90 px-5 py-4 backdrop-blur md:px-8"><div><p className="text-xs font-bold tracking-[.2em] text-sage">MUVETH KITCHEN</p><p className="font-display text-2xl">Cook with intention.</p></div><button onClick={logout} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold md:hidden">Sign out</button></header>
      <main className="flex-1 px-5 py-7 pb-24 md:px-8 md:py-9"><Outlet /></main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-black/10 bg-white/95 p-2 backdrop-blur md:hidden">{nav.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => `flex flex-col items-center rounded-xl py-2 text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-slate-400'}`}><span className="text-lg">{item.icon}</span>{item.label}</NavLink>)}</nav>
    </div>
  </div>
}

function ProtectedRoutes() {
  if (!keycloak.authenticated) return <Navigate to="/" replace />
  return <AppLayout />
}

export default function App() {
  useEffect(() => { if (keycloak.authenticated) toast.success('Welcome to MUVETH Kitchen', { id: 'welcome' }) }, [])
  return <QueryClientProvider client={queryClient}><BrowserRouter><Routes><Route path="/" element={<LoginPage />} /><Route element={<ProtectedRoutes />}><Route path="/recipes" element={<RecipesPage />} /><Route path="/routines" element={<RoutinePage />} /><Route path="/cart" element={<CartPage />} /><Route path="/settings" element={<SettingsPage />} /></Route><Route path="*" element={<Navigate to={keycloak.authenticated ? '/recipes' : '/'} replace />} /></Routes></BrowserRouter><Toaster position="top-right" toastOptions={{ duration: 3000 }} /></QueryClientProvider>
}
