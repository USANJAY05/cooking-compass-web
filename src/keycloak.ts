import Keycloak from 'keycloak-js'

const rawUrl = import.meta.env.VITE_KEYCLOAK_URL?.trim() || ''
const configuredRealm = import.meta.env.VITE_KEYCLOAK_REALM?.trim() || ''
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID?.trim() || 'cooking_compass_web'

function normalizeKeycloakUrl(value: string, realmValue: string) {
  const defaultRealm = 'dev'

  if (!value) {
    return { baseUrl: 'http://localhost:8080', realm: realmValue || defaultRealm }
  }

  const clean = value.replace(/\/$/, '')
  const marker = '/realms/'
  const markerIndex = clean.indexOf(marker)

  if (markerIndex >= 0) {
    const baseUrl = clean.slice(0, markerIndex)
    const realmFromUrl = clean.slice(markerIndex + marker.length).split('/')[0]
    return { baseUrl, realm: realmFromUrl || realmValue || defaultRealm }
  }

  return { baseUrl: clean, realm: realmValue || defaultRealm }
}

const { baseUrl, realm } = normalizeKeycloakUrl(rawUrl, configuredRealm)

if (!rawUrl) {
  console.warn('VITE_KEYCLOAK_URL is not configured. Using http://localhost:8080 and realm dev for local development.')
}

export const keycloak = new Keycloak({
  url: baseUrl,
  realm,
  clientId,
})

// Keep Keycloak initialization passive. The login page must not perform an
// automatic SSO check. The Login button explicitly initializes Keycloak and
// then starts the authorization redirect. If Keycloak redirects back with a
// code/state callback, the same initialization processes that callback.
export const keycloakConfig = {
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
  scope: 'openid profile email',
}

export { baseUrl as keycloakBaseUrl, realm as keycloakRealm, clientId as keycloakClientId }
