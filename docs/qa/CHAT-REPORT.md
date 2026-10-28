# Chat follow-up QA — 27 October 2026

## Layout result

The mobile/tablet chat overflow is fixed. Suggestions now belong to the scrollable conversation region. The header, disclosure, booking links and input occupy separate grid rows; the conversation can shrink without pushing the composer out of the panel. Long text wraps. The panel uses dynamic viewport height and Visual Viewport resize/scroll events to respond to keyboard-related viewport changes.

Verified on the updated production build:

- 20 conversation layout cases: 10 viewport sizes in actual light and dark themes.
- 14 initial-suggestion layout cases: seven viewport sizes in both themes, covering the original failure state.
- Sizes include 320×320, 320×568, 360×640, 390×680, 390×844, 768×400, 768×600, 844×390, 1024×600 and 1440×900.
- No panel overflow, booking/input overlap or hidden composer in these cases. The conversation retained at least 40px of height even at 320×320.
- A focused input remains visible after resizing to 390×400. This is a reduced-height simulation, not a physical phone keyboard test.
- The clean production browser has no warning/error logs.
- Production build succeeds. `npm test` reports 30 passing tests, including safe authentication/quota/rate-limit/model failure responses and uncached assistant configuration status.
- `node scripts/verify-http.mjs` passes 27 HTTP checks.

## API diagnosis

The old port-3001 demo process had explicitly disabled OPENAI_API_KEY for FAQ-only testing. It has been restarted without that override and now loads the project environment.

A minimal live request using the saved project environment reached OpenAI but returned HTTP 401 with code invalid_api_key. Re-checks after the user's update confirmations returned the same result. At the last check, the on-disk project .env still showed a saved timestamp of 10:09 AM. Its value was not printed or copied into any report, browser output or source file.

Live AI therefore remains blocked by the configured credential. The chat provides an explicit FAQ fallback notice. Authentication errors are distinguished from quota, rate-limit, model/settings and temporary service errors using fixed reason codes. Raw upstream error text is never returned to the browser, because it may contain credentials.

Save a valid OpenAI API key in the project .env, run `npm run check:ai`, then restart the server. That command makes one small real request and prints only a safe pass/fail diagnosis. It does not print the key. The agent did not modify the .env file.

## Evidence

- [Mobile light](chat-mobile-light.png)
- [Mobile dark](chat-mobile-dark.png)
- [Layout measurements](chat-layout-results.json)

Local production preview: http://127.0.0.1:3001
