# Owner login verification

Verified locally on 27 October 2026.

## Implemented

- Server-side protection for `/admin` and appointment listing/status changes.
- Single owner account with salted scrypt password hashing, opaque server-side sessions, eight-hour expiry, login throttling and logout revocation.
- HttpOnly, SameSite=Strict session cookies; Secure cookies and HTTPS required outside localhost.
- Same-origin JSON validation for login, logout and appointment mutations.
- Public availability exposes only date, time, duration and status. Customers access their own receipt with a private random token; only its hash is stored.
- Responsive owner login, light/dark styling and owner sign-out. Public navigation no longer exposes dashboard controls.

## Results

- `npm test`: 52 tests passed.
- Production build with `NEXT_DIST_DIR=.next-demo`: passed.
- `node scripts/verify-admin.mjs`: 22 access, cookie, CSRF, privacy and logout checks passed on development and production servers. Final production verification used `http://127.0.0.1:3001`.
- Browser login and logout succeeded. Anonymous direct dashboard access redirected to login. Wrong credentials showed an error.
- Login tested at widths 320, 390, 768 and 1440 in both light and dark mode: no horizontal overflow; password input remained 16px. Desktop footer sign-in link no longer overlaps the chat launcher.
- Public booking → owner confirmation → customer receipt update verified. Confirmed time was removed from availability. QA booking was subsequently cancelled and its time restored.

Screenshots: `admin-login-light.png`, `admin-login-dark.png`. Layout observations: `admin-layout-results.json`.

## Local handoff and deployment

Open `http://localhost:3000/admin/login`. Local credentials are in ignored `.data/admin-login.json`; do not publish this file. `npm run admin:setup` creates an account only if none exists.

The current account, sessions and appointments use local files. Deployment needs persistent storage on a single server; use a shared database before deploying across multiple instances or ephemeral serverless filesystems. Set `APP_ORIGIN` to the deployed HTTPS origin.

Rotate the Groq key that previously appeared in `.env.example`. That example now contains an empty placeholder.
