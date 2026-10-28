# Appointment workflow QA — 27 October 2026

## Delivered behavior

- Customer requests are saved in shared local-server storage instead of only localStorage.
- Pending requests appear in the owner dashboard and do not block availability.
- Owner confirmation reserves the entire treatment duration on that date. Confirmed and completed reservations exclude overlapping new starts; adjacent starts remain allowed.
- The server validates availability again on request submission and confirmation. A file lock serializes concurrent writes, so two overlapping requests cannot both become confirmed.
- Cancellation releases the reservation and remains in history. Completion is permitted only after the scheduled end time.
- The selected status is shown immediately after a successful owner action. Counts, upcoming confirmed visits, search, date filtering and cancellation history improve the dashboard.
- Visible clients poll every five seconds and refresh on focus. A customer confirmation view updates to confirmed/cancelled automatically.

## Verification

- Production build succeeds with no compilation warnings.
- npm test reports 47 passing tests. Appointment tests include treatment-derived duration/price, invalid payloads, closing hours, salon timezone, exact date matching, adjacent intervals, all-times-full days, state transitions, two-store concurrency, persistence and HTTP route contracts.
- Customer and owner were tested in separate tabs. Confirming a 10 AM colour treatment lasting 150 minutes removed 10 AM, 11 AM and 12 PM from new haircut requests, while 1 PM remained available.
- Cancelling that reservation restored the blocked times.
- Two overlapping requests were created. Confirming one caused the other's confirmation to fail with a conflict message. After cancellation, the remaining haircut request could be confirmed.
- Confirmation remained visible after reload and on the production server at 127.0.0.1:3001, independent of the development server and localhost browser storage.
- A pending request on the following day did not hide its requested time.
- Search, the Today date filter, clearing filters and cancelled history were checked in the browser. The native date picker could not be reliably filled by the browser automation; date filtering was exercised with the dashboard's Today control instead.
- Sixteen layout cases passed: dashboard and booking at 320, 390, 768 and 1440px in actual light and dark themes. No horizontal document overflow; the confirmed time remained absent in each booking case.
- The clean production browser reported no warning/error logs.

## Demo data

Clearly named sample guests were created through the form for the workflow checks: one confirmed haircut, one pending spa request and two cancelled colour requests. Phone values are test-only zeroes. No messages or calls were sent. These records remain available for trying the dashboard and can be cancelled through its controls.

## Scope

The file store is persistent on this computer and shared by browsers using this server. It is a single-schedule local demo, with an intentionally open owner view. Production owner login, database deployment and actual salon integration remain outside this change. This file-based store is not intended for independent multi-server/serverless instances.

## Evidence

- [Light owner dashboard](appointments-dashboard-light.png)
- [Dark owner dashboard](appointments-dashboard-dark.png)
- [Responsive case results](appointments-layout-results.json)

Use http://localhost:3000 or the verified production preview at http://127.0.0.1:3001.
