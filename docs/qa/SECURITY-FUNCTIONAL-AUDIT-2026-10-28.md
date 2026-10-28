# Security and functional audit — 28 October 2026

## Scope and result

Audited the Next.js source, installed production dependencies, customer routes, owner APIs, booking lifecycle, media publishing and responsive layouts. Production checks were read-only or invalid-input checks; synthetic bookings and uploads used an isolated production server at localhost:3016 with separate files and a QA owner. No real appointment or published media was modified.

This is a bounded application audit, not a guarantee that all vulnerabilities or device-specific issues have been eliminated.

## Findings corrected

1. **Serverless logout replay / throttling — high priority:** environment authentication kept revoked sessions and failed login counts in instance memory. A different server instance could accept a logged-out token or reset the attempt limit. Production now uses the existing private Blob store for shared security state, atomic updates, hashed revoked tokens and expiry pruning. Invalid/unavailable shared state fails closed. Added cross-instance logout/throttling and outage regression tests. Private Blob availability is now also required for production owner login/session verification.
2. **Outdated PostCSS — dependency advisory:** Next 15.5.28 installed PostCSS 8.4.31. Added a pinned override to PostCSS 8.5.32; production build and npm audit pass. No untrusted CSS-processing feature was found, so the advisory did not establish an exploitable public endpoint in this app. Reference: https://github.com/advisories/GHSA-fxqj-rqcc-2cmp
3. **Missing browser defense headers:** added nosniff, frame denial, referrer policy, disabled unused camera/microphone/geolocation, and a limited Content Security Policy restricting framing, objects and base URLs. This is not a complete script-src CSP.

## Verification evidence

- 88 automated tests passed: auth, password hashing, cookies, CSRF, environment configuration, shared auth state, bookings, concurrency, receipts, media access/type validation, Blob conditional writes, search, navigation, chatbot scope and keyboard viewport calculations.
- Production build completed successfully with Next 15.5.28 and patched PostCSS.
- npm audit --omit=dev: zero known vulnerabilities at audit time.
- 38 isolated HTTP workflow/security checks: owner authorization, CSRF, protected files, customer receipt tokens, server-derived prices/duration, conflicting confirmations, cancellation/rebooking, private availability output, upload/draft/publish/unpublish, byte ranges, spoofed image rejection and logout replay.
- 55 HTTP checks passed locally and 55 on the existing live deployment: marketing pages, customer pages, legacy redirects, build assets, photos, invalid input handling and chatbot response.
- 10 additional live checks passed for owner API protection, private file protection and availability privacy.
- 64 browser layout states passed: 16 customer/marketing/owner routes at 390px and 1440px in light and dark themes. No document overflow or loaded broken image detected.
- Browser interactions passed: search for hair after selecting Nails, favourites and booking handoff, mobile booking submission, receipt recovery after refresh, mobile owner confirmation, customer confirmed receipt, media publication, gallery next/previous/close, and gallery refresh.
- No tracked .env/private credential files found. No configured Groq/Blob/session-secret values found in the production client assets.

Evidence JSON and screenshots are stored privately under .data/qa-evidence/. Synthetic data is under .data/qa-security-run/ and is not committed.

## Remaining risks / limits

- **Public endpoint abuse:** booking and AI chat do not yet have a distributed per-client quota or bot challenge. Origin checks are not bot protection. Add Vercel firewall/rate rules for /api/chat and POST /api/appointments; monitor Groq quotas and Blob usage. Hosting rules were not changed during this audit.
- Owner login uses a single account and password, with a shared account-wide five-attempt throttle. This stops cross-instance brute-force bypass but can temporarily block the owner if someone repeatedly submits bad credentials. MFA or an identity provider and IP-aware throttling would improve this.
- Shared auth-state expiry pruning and one-hour sessions limit replay/storage exposure, but security-state reads/writes add Blob requests and owner access depends on storage availability.
- Browser checks used responsive emulation, not physical iOS/Android keyboards. Unit coverage verifies viewport calculations; physical keyboard behavior was not re-certified.
- No destructive live booking/media tests, load testing, third-party phone/WhatsApp/email delivery, or externally hosted branch-site checks were performed. Those links require user action; the app does not send messages automatically.
- The complete script policy, WAF configuration, account recovery and production monitoring remain future hardening work.
