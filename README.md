# MUVETH Kitchen Web

The web version of [Cooking Compass Mobile](https://github.com/USANJAY05/cooking_compass_mobile). The web application follows the same MUVETH Kitchen product language, authentication model, core navigation, and health-first visual design while using web-native React tooling.

> **MUVETH** — Three Dimensions. One Life.
>
> **MUVETH Kitchen** — Cook. Nourish. Move.

## Application Flow

```text
Login
  ↓
Recipes (Home)
  ├── Routine
  ├── Cart
  └── Settings
```

After Keycloak authentication, `/recipes` is the application's home page.

## Mobile/Web Alignment

The web application is being developed as the browser counterpart to `cooking_compass_mobile`.

Shared product characteristics include:

- MUVETH Kitchen branding
- MUVETH navy `#172554`
- Kitchen green `#22C55E`
- Kitchen green dark `#15803D`
- Light background `#F7FAF7`
- Primary text `#132238`
- Secondary text `#52606D`
- Health-first green/orange nutrition accents
- `Cook. Nourish. Move.` product language
- Recipes, Routine, Cart, and Settings as the core navigation
- Keycloak Authorization Code + PKCE authentication

The source of truth for the mobile design system is the mobile repository's `BRAND.md` and theme tokens.

## Features

- Keycloak authentication
- Authorization Code flow with PKCE using S256
- Protected routes
- Recipes as the authenticated home page
- Recipe search and API integration
- Routine page
- Shopping cart page
- Settings page
- Desktop sidebar navigation
- Mobile bottom navigation
- Axios API client
- TanStack React Query for server state and caching
- Automatic bearer-token injection
- Keycloak token refresh before protected API requests
- React Hot Toast notifications
- Loading, error, and empty states
- Tailwind CSS
- TypeScript

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **TanStack React Query**
- **Axios**
- **Tailwind CSS**
- **React Hot Toast**
- **Keycloak JS**

## Project Structure

```text
src/
├── api.ts
├── keycloak.ts
├── App.tsx
├── main.tsx
├── pages/
│   ├── RecipesPage.tsx
│   ├── RoutinePage.tsx
│   ├── CartPage.tsx
│   └── SettingsPage.tsx
└── styles.css

public/
└── silent-check-sso.html
```

## Requirements

- Node.js 18+
- npm
- Running MUVETH Kitchen backend
- Configured Keycloak realm/client

## Environment Variables

Create a local `.env` file in the project root.

The web configuration accepts the same Keycloak realm URL style used by the mobile application:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_KEYCLOAK_URL=http://localhost:8080/realms/cooking-compass
VITE_KEYCLOAK_REALM=cooking-compass
VITE_KEYCLOAK_CLIENT_ID=cooking-compass-mobile
```

`VITE_KEYCLOAK_REALM` is optional when `VITE_KEYCLOAK_URL` already contains `/realms/<realm>`; the web Keycloak adapter normalizes both forms.

Do **not** put a Keycloak client secret in the frontend. The browser client must be configured as a public client.

The `.env` file is not committed. Use `.env.example` as the starting template.

## Keycloak Configuration

The web frontend uses the same OpenID Connect model as the mobile app: Authorization Code + PKCE.

Configure the Keycloak client with:

- Public/browser client
- PKCE method: `S256`
- Valid redirect URI for local development:

```text
http://localhost:5173/recipes
```

You may also allow the development origin broadly during local setup:

```text
http://localhost:5173/*
```

Add the production frontend URL to Keycloak before deploying.

For silent SSO checks, the application serves:

```text
/silent-check-sso.html
```

The exact redirect URI must match what is configured in Keycloak.

## Why Login Can Fail

The most common causes are configuration mismatches between the browser and Keycloak:

1. `VITE_KEYCLOAK_URL` contains the realm path while the application also appends another realm path.
2. The Keycloak client ID does not match the client configured for the web app.
3. `/recipes` is not included in the client's valid redirect URIs.
4. The browser origin is not included in the client's allowed web origins.
5. The Keycloak server is reachable from the browser only on a private/local hostname or port.
6. The Keycloak client is configured as confidential instead of public for this browser application.

The current web implementation normalizes a Keycloak URL supplied either as a server base URL or as a `/realms/<realm>` URL to avoid the first class of mismatch.

## Installation

```bash
git clone https://github.com/USANJAY05/cooking-compass-web.git
cd cooking-compass-web
npm install
```

Create `.env`, then run:

```bash
npm run dev
```

The default Vite development URL is:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

## Authentication Lifecycle

At startup the application initializes Keycloak using `check-sso`. If the browser is already authenticated, it enters the application and routes to `/recipes`.

Unauthenticated users see the MUVETH Kitchen login experience. Selecting **Continue with MUVETH** starts the Keycloak login flow and returns to `/recipes` after successful authentication.

Protected routes:

- `/recipes`
- `/routines`
- `/cart`
- `/settings`

Protected backend calls include:

```http
Authorization: Bearer <access-token>
```

The frontend refreshes the Keycloak token before API requests when necessary.

## Navigation

The authenticated web shell mirrors the mobile app's four primary tabs:

| Route | Mobile equivalent | Purpose |
|---|---|---|
| `/recipes` | Recipes | Main/home recipe experience |
| `/routines` | Routine | Cooking routines |
| `/cart` | Cart | Shopping cart |
| `/settings` | Settings | Account/application settings |

Desktop uses a left sidebar. Mobile uses a bottom navigation bar.

## API Integration

The API layer uses Axios and TanStack React Query and follows the backend OpenAPI contract.

Current integration areas include:

- Recipes
- Recipe search
- Routines
- Routine search
- Cart
- Categories
- Ingredients

The backend URL is configured with `VITE_API_BASE_URL`.

## Toasts

React Hot Toast is used for transient user feedback including request failures, logout failures, and other application-level notifications.

## Development Notes

- Keep secrets out of source control.
- Keep `.env` local.
- Keep API models and endpoints aligned with the backend OpenAPI specification.
- Prefer React Query for server state.
- Keep authentication in Keycloak rather than implementing a separate frontend login system.
- Keep visual changes consistent with the mobile application's MUVETH Kitchen design tokens.

## Related Project

Mobile application:

https://github.com/USANJAY05/cooking_compass_mobile

## License

This project is maintained as part of the MUVETH Kitchen application and does not currently declare a public open-source license.
