# Customer and owner QA — 28 October 2026

Tested a production build on localhost:3010 with isolated appointment, authentication and media files. Real customer records and uploads were not used or modified.

## Findings fixed

1. Refreshing a submitted booking lost the customer's receipt. The customer can now reload the same tab and recover their request and current status. Only its opaque access handle is kept in session storage; customer names and phone numbers are fetched through the protected receipt endpoint. Explicitly starting another request clears the old handle. Failed recovery offers retry instead of silently encouraging duplicate requests.
2. At 768px the owner's account email crowded the header and pushed sign-out off screen. The account label is now hidden at narrower widths. Sign-out remains available. Retested all owner size/theme combinations successfully.

## Automated results

- 63 unit tests passed, zero failed.
- 72 production HTTP/API checks passed, including all public sections, owner authentication/logout/session replay, unauthenticated access denial, origin checks, appointment validation, protected receipt access, conflict blocking, cancellation, media draft privacy, publication, MIME validation, byte ranges, and API deletion of isolated test media.
- Optimized Next.js production build passed compilation, type/lint validation and route generation.
- 40 unique images referenced by rendered customer pages returned 200 with nonempty content.
- No browser console errors appeared in the final customer-section sweep.

## Browser workflows exercised

- Desktop and mobile service discovery, category/text search, stale category reset, empty search and clear, saved-service persistence across refresh, service-to-booking navigation.
- Booking date/time selection, required fields, invalid phone and missing consent, multiple services/duration, submission, pending receipt, owner confirmation, refreshed confirmed receipt.
- Owner login failure and success, password visibility, mobile logout/login, appointment search, confirmation, overlapping-treatment rejection, cancellation confirmation and keeping the appointment, declining a mobile request, completed historical visit, dashboard totals and upcoming confirmed appointments.
- Confirmed appointments remove overlapping available times; cancelling releases the reserved interval.
- Desktop photo upload, persistent success feedback, caption editing, publish/unpublish, draft exclusion from customer gallery.
- Mobile video upload, publish and reorder; customer video loaded and played (19.319 seconds, readyState 4, no media error).
- Desktop/mobile image viewer next, previous and Escape. Mobile viewer close/navigation controls fit within the viewport.
- Live chatbot returned a reply. At a reduced mobile viewport height of 500px, the typed text and send control remained visible.
- Location search finds Noida 104 after selecting Delhi; maps and telephone destinations are present.
- Contact and franchise forms prepare WhatsApp enquiries. No WhatsApp messages were sent.
- Blog preview and return to article list worked.

## Responsive coverage

104 customer layout checks: 13 sections × widths 320, 390, 768 and 1440 × light/dark. Each had its section heading and no document horizontal overflow.

16 owner layout checks: dashboard and media library × the same widths × both themes. All passed after the tablet header fix.

These are browser viewport checks, supplemented by desktop and mobile interaction journeys; they do not certify every physical device or browser. A physical iOS/Android keyboard was not available. Phone calls, WhatsApp delivery and third-party publisher/video availability were not initiated or certified.

## Evidence

- `deep-responsive-results.json`
- `deep-owner-responsive-results.json`
- `deep-api-results.json`
- `deep-image-results.json`
- `mobile-confirmed-refresh.png`

Temporary QA data and credentials remain under ignored `.data` files for reproducibility and must not be published.
