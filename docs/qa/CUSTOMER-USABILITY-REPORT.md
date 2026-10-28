# Customer usability and full-site verification

Verified 28 October 2026.

## Improvements

- Homepage service search with immediate matches and familiar terms; category chips and direct service booking.
- Services & prices, Directions and Book now are prominent. Secondary brand pages are grouped under More and remain available through the side menu.
- Service cards have labelled Book this service buttons instead of an icon-only action.
- Booking is a three-step flow: services, date/time, details. Selecting a service directly skips to date/time. Required fields are validated only in the appropriate step.
- Inline booking errors, step focus management, clear selected states and mobile number validation. Booking location and staff confirmation are stated explicitly.
- Fixed chat stacking above the sticky header so its close control remains clickable. Disabled the local development badge that overlapped the mobile Home control.

## Results

- Production build passed (`.next-customer-check`).
- 59 automated tests passed.
- 120 browser layout checks passed: 12 public sections and three booking steps × 320/390/768/1440px × light/dark. No horizontal overflow; Book now remained available.
- 28 production HTTP checks passed for homepage, build assets, images, 404s, API validation and a live assistant reply.
- 22 production authentication, cookie, CSRF, privacy and logout checks passed.
- Mobile search-to-book request succeeded. Desktop multi-service request succeeded with the expected 135-minute duration.
- Missing service/date/time validation, invalid phone rejection and international number acceptance were checked.
- Owner confirmation appeared in the customer receipt and removed the booked time. Cancellation released it. Only the two agent-created QA requests were removed; existing records were preserved.
- Search aliases and no-results phone help, saved-service persistence across refresh, gallery next/previous/Escape and More/Escape all passed.
- Live chat returned opening hours. At a 390×500 viewport, both the composing input and latest message remained visible. This checks browser viewport behavior, not a physical phone keyboard.

Evidence: `customer-layout-results.json`, `customer-home-mobile.png`, `customer-home-desktop.png`, `customer-booking-mobile.png`.
