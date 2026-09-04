import Keycloak from 'keycloak-js'

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
const realm = import.meta.env.VITE_KEYCLOAK_REALM
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID

if (!keycloakUrl || !realm || !clientId) {
  console.warn('Keycloak is not configured. Add VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM and VITE_KEYCLOAK_CLIENT_ID to .env.')
}

export const keycloak = new Keycloak({
  url: keycloakUrl || 'https://keycloak.example.com',
  realm: realm || 'dev',
  clientId: clientId || 'muveth-kitchen-web',
})

export const keycloakConfig = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
}
