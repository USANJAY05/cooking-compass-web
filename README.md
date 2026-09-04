# MUVETH Kitchen Web

MUVETH Kitchen is the web frontend for the MUVETH cooking platform. It provides an authenticated cooking workspace for discovering recipes, managing cooking routines, viewing the shopping cart, and accessing account settings.

> **MUVETH** — Three Dimensions. One Life.

## Current Application Flow

```text
Login
  ↓
Recipes (Home)
  ├── Routines
  ├── Cart
  └── Settings
```

After successful Keycloak authentication, the user is taken to the **Recipes** page, which is the main application home page.

## Features

- Keycloak authentication
- Authorization Code flow with PKCE (S256)
- Protected application routes
- Recipes home page
- Recipe search and API integration
- Cooking routines page
- Shopping cart page
- Settings page
- Responsive desktop and mobile navigation
- React Query for server-state management and caching
- Axios API client
- Automatic Keycloak bearer-token injection
- Keycloak token refresh before API requests
- Toast notifications
- Loading, error, and empty states
- Tailwind CSS styling
- TypeScript

## Tech Stack

- **React**
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
├── api/                 # Axios/API integration
├── components/          # Reusable UI components
├── layouts/             # Application layouts/navigation
├── pages/
│   ├── Recipes/         # Main/home recipe experience
│   ├── Routines/        # Cooking routines
│   ├── Cart/            # Shopping cart
│   └── Settings/        # User/application settings
├── routes/              # React Router configuration and guards
├── keycloak.ts          # Keycloak client configuration
├── App.tsx              # Application root
├── main.tsx             # React entry point
└── index.css            # Tailwind/global styles

public/
└── silent-check-sso.html
```

## Requirements

- Node.js 18+
- npm
- A running MUVETH Kitchen backend
- A configured Keycloak realm and client

## Environment Variables

Create a local `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_KEYCLOAK_URL=https://your-keycloak-server
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=muveth-kitchen-web
```

### Important

Do **not** put a Keycloak client secret in the frontend environment. Browser applications must use a public Keycloak client.

The `.env` file is intentionally excluded from Git. Use `.env.example` as the configuration template.

## Keycloak Configuration

Configure the Keycloak client as a browser/public client using PKCE with the `S256` code challenge method.

For local development, the client should allow the application's local origin, for example:

```text
http://localhost:5173/*
```

The production frontend origin must also be added to the client's valid redirect URIs and web origins.

The application uses:

```text
/silent-check-sso.html
```

for silent SSO checks.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/USANJAY05/cooking-compass-web.git
cd cooking-compass-web
npm install
```

Create `.env` using the variables above, then start the development server:

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

## Production Build

Build the application with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Authentication

The frontend initializes Keycloak when the application starts.

Unauthenticated users are presented with the MUVETH Kitchen login experience. Selecting **Continue with Keycloak** redirects the user to Keycloak for authentication.

Authenticated users can access:

- `/recipes`
- `/routines`
- `/cart`
- `/settings`

The application attaches the current Keycloak access token to protected backend requests as:

```http
Authorization: Bearer <access-token>
```

## API Integration

The frontend uses Axios and TanStack React Query for backend communication and server-state management.

The API layer is based on the project's OpenAPI contract and currently provides integration points for:

- Recipes
- Recipe search
- Routines
- Routine search
- Cart
- Categories
- Ingredients

The backend URL is configured through `VITE_API_BASE_URL`.

## Navigation

The authenticated application uses a common application shell with navigation between the core areas:

| Route | Purpose |
|---|---|
| `/recipes` | Main/home recipe experience |
| `/routines` | Cooking routines |
| `/cart` | Shopping cart |
| `/settings` | Settings and account actions |

## Notifications

Toast notifications are provided through React Hot Toast and are intended for user-facing feedback such as successful actions, API errors, authentication events, and other transient application messages.

## Development Notes

- Keep secrets out of frontend source code and Git.
- Use environment variables for deployment-specific configuration.
- Keep API models aligned with the backend OpenAPI specification.
- Use React Query for API/server state instead of duplicating request state throughout components.
- Keep reusable UI in components rather than duplicating page-level markup.

## License

This project is currently maintained as part of the MUVETH Kitchen application and does not yet define a public open-source license.
