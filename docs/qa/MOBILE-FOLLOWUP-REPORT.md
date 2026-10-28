# Mobile categories, chat context and deployed owner access

Verified locally on 28 October 2026. Live target: https://saloon-seven-henna.vercel.app/.

## Changes

- Homepage service chips use one horizontally scrollable row at widths up to 900px, with keyboard focus/scroll support, scroll snapping and no document overflow.
- Chat sends bounded user/assistant conversation history. Client-supplied system/tool roles are discarded. Short acknowledgements including OK/oky/thanks receive a short local response instead of a repeated greeting. Follow-up questions include the previous turns in the Groq request.
- Added environment-backed owner authentication for serverless hosts. An ignored private export reuses the existing owner account hash and generates a session signing secret. Vercel mode fails closed when these settings are missing. Local file-backed authentication is preserved.
- Added deployment instructions and documented environment session/rate-limit/revocation limits. Appointment/media persistence is a separate requirement and is not fixed by authentication variables.

## Results

- 70 automated tests passed.
- Optimized production build passed.
- Nine production environment-auth HTTP checks plus cookie assertions passed: anonymous redirect/denial, configuration detection, origin rejection, incorrect/correct password, protected dashboard/list and logout cookie clearing.
- Existing local file-auth verification: 22 checks passed.
- Mobile browser: existing owner credentials signed in, dashboard refresh stayed signed in, logout redirected back to login.
- Eight category layout checks (320, 390, 768 and 1440px, light/dark) showed one row and no document overflow. Mobile/tablet widths scrolled; desktop fitted naturally. The final All services chip opened the complete service catalog.
- Live local Groq conversation: services answer followed by `oky` returned “You’re welcome. I’m here if you need anything else.” without a new introduction.

## Live deployment prerequisite

The current live session-status endpoint was checked and returned `configured: false`. Private `ADMIN_AUTH_ACCOUNT`, `ADMIN_SESSION_SECRET` and the correct `APP_ORIGIN` must be configured in the Vercel project and the updated code redeployed before deployed login can be verified. No credentials or customer records were published. Browser tests used viewport emulation; they do not certify a physical device.
