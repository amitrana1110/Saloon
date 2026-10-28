# Services-first booking and regional locations — 28 October 2026

## Changes

- Landing-page booking actions now enter Services & prices. Choosing a service continues to the existing booking form with that service selected. Explicit booking-form URLs retain their original behavior.
- Replaced the flat location list with grouped, expandable city/region sections. Desktop has a region sidebar and mobile has a native region selector. Opening-soon locations remain separate.
- Retained every directory record, directions, phone numbers and source-detail links. Search crosses regions and exact region searches avoid partial-name collisions.

## Verification

- 83 automated tests passed, including preservation of all location records, exact regional filtering, cross-region area search, display labels and old URL routing.
- Production build passed.
- Sixteen responsive state/theme checks passed: All/Punjab at 320, 390, 768 and 1440px in light/dark mode. No horizontal overflow was observed.
- Desktop Punjab filter showed 11 branches; Delhi showed 17. Mobile Punjab selection showed the same 11 branches in one group.
- Searching Noida 104 after Delhi selection found the single Sector 104 branch. A no-match search and Show all recovery worked.
- All booking-entry links across the homepage and eight informational pages pointed to the service catalog.
- Clicking Book now opened the catalog; selecting Signature haircut opened date/time selection with that service selected.
- No customer bookings or uploaded media were modified during verification.

Testing used browser viewport emulation rather than physical-device certification. Private screenshot evidence is retained under ignored `.data/qa-evidence`.
