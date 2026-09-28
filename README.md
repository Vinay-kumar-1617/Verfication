# Vehicle KYC Sandbox

This project is a minimal Expo + React Native app that demonstrates how to keep API Setu client communication on the server side through Supabase Edge Functions rather than in the mobile app.

The workspace currently contains a safe, configuration-driven integration skeleton. It does not call API Setu directly from React Native, and it does not store secrets in the app bundle or Git.

## What this project includes

- Expo React Native app shell
- Supabase client helper for `supabase.functions.invoke(...)`
- Reusable API Setu helper functions and request validation
- Edge Function scaffolding for DigiLocker and vehicle flows
- SQL migrations for transaction and request tracking with RLS
- Tests for the Setu client logic
- Documentation for required manual dashboard configuration

## Required manual API Setu configuration

The following values must be configured in the official API Setu dashboard or your service account before the live integration will work. This project intentionally does not guess the exact Setu endpoints or headers because the official specification and enabled services for this account are not present in the workspace.

Required items:

1. API Setu sandbox environment and base URL
2. DigiLocker enablement and sandbox callback configuration
3. Vehicle service enablement for the requested vehicle APIs
4. Client ID, client secret, and API key values for the service account
5. Exact auth header, request payload, and callback URI requirements from the API Setu specification
6. Redirect URI registration for DigiLocker callback handling in the API Setu dashboard

This app expects the actual values to be supplied through Supabase Edge Function secrets or environment variables, never in the React Native app code.

## Project architecture

- React Native app: UI and user interaction only
- Supabase Auth: authenticated user session and RLS-based access control
- Supabase Edge Functions: API Setu server-side integration
- PostgreSQL: only for data that truly needs persistence (transactions and audit records)

## Local setup

1. Install Node.js 22+ and npm.
2. Run `npm install` in this folder.
3. Copy `.env.example` to a local environment file and fill the values for your Supabase project.
4. Start the app with `npm start`.
5. For Android or iOS use `npm run android` or `npm run ios`.

## Required environment variables

Expo app variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DEEP_LINK_SCHEME=myapp
EXPO_PUBLIC_API_SETU_BASE_URL=https://sandbox-api.setu.co
```

Supabase Edge Function secrets (server-side only):

- `API_SETU_BASE_URL`
- `API_SETU_CLIENT_ID`
- `API_SETU_CLIENT_SECRET`
- `API_SETU_API_KEY`
- `API_SETU_AUTH_HEADER_NAME`
- `API_SETU_AUTH_HEADER_VALUE`
- `API_SETU_DIGILOCKER_AUTH_PATH`
- `API_SETU_VEHICLE_PATH`
- `DIGILOCKER_REDIRECT_URI`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No values should be checked into Git.

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL migrations in `supabase/migrations`.
3. Deploy the Edge Functions from `supabase/functions`.
4. Configure their secrets in the Supabase dashboard.
5. Turn on Supabase Auth and ensure the app uses the authenticated user session.

## DigiLocker flow

This project includes a configuration-driven DigiLocker flow scaffold:

- `digilocker-start` creates the authorization request and returns the auth URL
- `digilocker-callback` handles the redirect and token exchange when the API Setu spec is configured
- `digilocker-documents` retrieves post-authentication document metadata

The actual URL path, callback contract, and redirect handling must be confirmed from the official API Setu DigiLocker documentation and the current sandbox account configuration.

## Vehicle service flow

This project includes a vehicle request scaffold:

- `vehicle-service` validates the registration number before invoking the configured server-side Setu path
- Status, transaction id, and error handling are included in the response model
- The app does not send raw API Setu credentials or private values to the client

The exact vehicle API endpoint and request parameters must match the API Setu vehicle sandbox documentation for the services enabled on your account.

## Deep linking

The app includes a default deep-link scheme in `app.json`:

```json
"scheme": "myapp"
```

For the actual production or sandbox run, the redirect URI must match exactly what API Setu expects for DigiLocker. The app should be configured to register the same URI in both the app and the API Setu dashboard.

## Testing

Run the project verification commands:

```bash
npm test
npm run typecheck
npm run lint
```

These checks validate the helper functions and the integration scaffolding. They do not require live API Setu credentials.

## Known limitations

- The project cannot complete live API Setu calls without the official API Setu sandbox credentials, enabled services, callback configuration, and exact path values.
- The Edge Function code is intentionally generic so it does not invent the undocumented API contract.
- The current workspace does not contain the official API Setu documentation or a live sandbox account, so the production contract must be added manually.

## Troubleshooting

- If the app shows a configuration error, confirm the Supabase and Expo environment variables are set.
- If the DigiLocker flow fails, verify the callback registration and auth path in the API Setu dashboard.
- If vehicle requests fail, confirm the enabled service and path value match the sandbox configuration.
- If the Edge Function returns 401 or 403, re-check the server-side secrets and auth headers.
- If the request is rejected as invalid, validate the exact payload required by the API Setu sandbox for your enabled service.

This app is intentionally designed to be safe and documentation-first. It avoids hard-coding credentials and avoids guessing undocumented API Setu behavior.
