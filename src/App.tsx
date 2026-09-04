import { useEffect, useState } from 'react'
import { keycloak, keycloakConfig } from './keycloak'

function App() {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    keycloak
      .init(keycloakConfig)
      .then((isAuthenticated) => {
        if (!mounted) return
        setAuthenticated(isAuthenticated)
        setReady(true)
      })
      .catch((reason) => {
        console.error(reason)
        if (!mounted) return
        setError('Unable to initialize secure sign-in. Please check your Keycloak configuration.')
        setReady(true)
      })

    return () => {
      mounted = false
    }
  }, [])

  const login = () => {
    setError('')
    keycloak.login({ redirectUri: window.location.origin })
  }

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="nav">
        <div className="brand-mark" aria-label="MUVETH Kitchen">
          <span className="brand-dot" />
          <span>MUVETH</span>
          <small>KITCHEN</small>
        </div>
        <div className="nav-caption">THREE DIMENSIONS. ONE LIFE.</div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">YOUR COOKING COMPASS</div>
          <h1>Cook with<br /><em>intention.</em></h1>
          <p>
            Bring recipes, ingredients, routines and your kitchen into one calm,
            intelligent space built around the way you actually cook.
          </p>

          <div className="actions">
            {!ready ? (
              <button className="primary-button" disabled>Preparing secure sign-in…</button>
            ) : authenticated ? (
              <button className="primary-button" onClick={() => window.location.assign('/app')}>
                Enter MUVETH Kitchen <span>→</span>
              </button>
            ) : (
              <button className="primary-button" onClick={login}>
                Continue with Keycloak <span>→</span>
              </button>
            )}
            {authenticated && <button className="text-button" onClick={logout}>Sign out</button>}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="trust-row">
            <span className="lock">◈</span>
            <span>Secure authentication</span>
            <span className="divider" />
            <span>Private by design</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="plate-shadow" />
          <div className="plate">
            <div className="plate-inner">
              <div className="dish">
                <span className="leaf leaf-a" />
                <span className="leaf leaf-b" />
                <span className="leaf leaf-c" />
                <span className="tomato tomato-a" />
                <span className="tomato tomato-b" />
                <span className="herb herb-a" />
                <span className="herb herb-b" />
              </div>
            </div>
          </div>
          <div className="floating-card card-top">
            <span>01</span>
            <strong>Plan</strong>
            <small>your week</small>
          </div>
          <div className="floating-card card-bottom">
            <span>02</span>
            <strong>Cook</strong>
            <small>with clarity</small>
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 MUVETH</span>
        <span>COOKING COMPASS / v0.1</span>
      </footer>
    </main>
  )
}

export default App
