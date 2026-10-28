# Demo QA report

Verified 27 October 2026 against a local Next.js production build.

## Result

Ready for the local demonstration flows tested below. Production build succeeds, all 24 reported Node tests pass, 26 HTTP checks pass, and 189 browser assertions pass. The clean production browser session reports no warning or error logs.

## Browser coverage

| Area | Desktop light/dark | Mobile light/dark |
| --- | --- | --- |
| All eight service cards open booking and select the correct treatment | Pass | Pass |
| Complete request form, date/time selection, confirmation and dashboard deletion | Pass | Pass |
| Search, favourites and empty states | Pass | Pass |
| Gallery open/close and FAQ chat | Pass | Pass |
| Home, services, booking, dashboard and gallery navigation | Pass | Pass |

Additional checks:

- All seven category filters return the expected treatment counts.
- Search is case-insensitive; clearing search and empty results work.
- Favourite and request persistence survive reload; theme preference survives reload.
- Favourite hearts operate independently of the card's booking action.
- Calendar blocks past dates and earlier months; next/previous month navigation works.
- Quick booking transfers the service and date, including 1 November across the month boundary.
- Quick booking recovers when all services were previously deselected.
- Home category links and View all clear stale search/filter state.
- Multi-service duration/price calculations and unpriced consultation quotes display correctly.
- Missing date/time, blank names and punctuation-only phone numbers are rejected.
- WhatsApp URLs contain the correct branch, treatments, preferred date/time and contact details. No messages were sent.
- Mobile menu opens, navigates and dismisses correctly.
- Gallery supports Escape, traps Tab focus, restores focus and prevents background interaction/scrolling.
- Calendar text is 16px on desktop and 15px on mobile; contact/chat fields are 16px.
- Targeted computed-color checks confirm the dark booking screen and chat bubbles have readable foreground/background pairs. This is not a formal WCAG audit; the simple scanner cannot calculate contrast over photographs/gradients.

## Responsive coverage

60 layout cases pass: home, services, booking, dashboard and gallery at 320, 360, 390, 768, 1024 and 1440 CSS pixels, in both themes. No horizontal document overflow was detected. Full interactive flows were exercised at 390px and 1440px.

Testing used the Chromium-based in-app browser with viewport overrides, not physical phones or separate Safari/Firefox installations.

## Automated checks

- `npm test`: 24 reported tests pass, including the existing salon logic tests and chat route validation, the 2,000-character limit, mocked AI response parsing, and mocked HTTP/network/empty-response fallbacks.
- Production build: compiled, type/lint checks, static page generation and tracing complete successfully.
- `node scripts/verify-http.mjs`: 26 checks pass for the homepage, eight build assets, eight photos, missing-page response, unsupported chat method, invalid JSON/payloads and the real local FAQ endpoint.
- The real paid AI service was not called. AI success/failure paths were exercised using test doubles; the demo browser used FAQ mode.

## Corrections made during QA

- Corrected dark chat message bubbles, footer and favourites badge contrast.
- Improved supporting text contrast in the light theme.
- Removed the mobile opening-hours badge overlap with the heading.
- Hid the closed mobile drawer from accessibility navigation.
- Added gallery/mobile-drawer focus handling and gallery background isolation.
- Scrolled to the request confirmation after submission.
- Cleared stale home-page filters and matched quick booking to the displayed treatment.
- Separated development (`.next-dev`) from production build output and set the correct project tracing root, preventing concurrent build corruption.
- Added repeatable chat API tests and the HTTP verification script.

## Evidence

- [Browser assertion results](browser-results.json)
- [Desktop light](desktop-light.png)
- [Desktop dark](desktop-dark.png)
- [Mobile light](mobile-light.png)
- [Mobile dark](mobile-dark.png)

## Local demo

The verified production demo runs at http://127.0.0.1:3001 in FAQ mode. The existing development server remains on port 3000.

To reproduce this isolated demo in PowerShell from the project folder:

```powershell
$env:NEXT_DIST_DIR = '.next-demo'
npm run build
$env:OPENAI_API_KEY = ''
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001
```

In another terminal, run `npm test` and `node scripts/verify-http.mjs http://127.0.0.1:3001`.

## Scope limits

Bookings and favourites remain browser-local demo data. WhatsApp delivery, real staff confirmation, live scheduling and paid AI connectivity have not been verified. No external booking or message was submitted. This pass does not certify public-production security, load capacity, physical-device behavior or cross-browser compatibility.
