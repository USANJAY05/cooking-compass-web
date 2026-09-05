import Keycloak from 'keycloak-js'

const rawUrl = import.meta.env.VITE_KEYCLOAK_URL?.trim() || ''
const configuredRealm = import.meta.env.VITE_KEYCLOAK_REALM?.trim() || ''
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID?.trim() || 'cooking-compass-mobile'

function normalizeKeycloakUrl(value: string, realmValue: string) {
  if (!value) return { baseUrl: 'https://keycloak.example.com', realm: realmValue || 'dev' }

  const clean = value.replace(/\/$/, '')
  const marker = '/realms/'
  const markerIndex = clean.indexOf(marker)

  if (markerIndex >= 0) {
    const baseUrl = clean.slice(0, markerIndex)
    const realmFromUrl = clean.slice(markerIndex + marker.length).split('/')[0]
    return { baseUrl, realm: realmFromUrl || realmValue || 'dev' }
  }

  return { baseUrl: clean, realm: realmValue || 'dev' }
}

const { baseUrl, realm } = normalizeKeycloakUrl(rawUrl, configuredRealm)

if (!rawUrl) {
  console.warn('Keycloak is not configured. Set VITE_KEYCLOAK_URL in .env.')
}

export const keycloak = new Keycloak({
  url: baseUrl,
  realm,
  clientId,
})

export const keycloakConfig = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  scope: 'openid profile email',
}

export { baseUrl as keycloakBaseUrl, realm as keycloakRealm, clientId as keycloakClientId }
