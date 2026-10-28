# Search fixes

Verified 28 October 2026.

The reported failure came from combining a new text search with an old category selection. Text queries now search all service categories and reset the category selector to All. Selecting a category clears the previous query. Old URLs with both a conflicting category and query render correct results on the server and normalize to the global search URL.

Location text searches clear stale region filters; owner appointment searches clear stale status/date filters. Shared text matching handles case, extra spaces, punctuation and word order. Service aliases remain supported. A pending catalog scroll no longer takes focus away while typing.

## Verification

- 61 automated tests and production build passed.
- Twelve service query checks passed on mobile/desktop, covering Hair, hair color, beard trim with extra spaces, facial, mani pedi and wedding makeup. Each started from Nails and returned the expected service globally.
- The reported Hair/Nails case passed at 320, 390, 768 and 1440 pixels in both themes: All selected, six results, typing focus retained, no horizontal overflow.
- Homepage search, clearing, no-results feedback and refresh with an old conflicting search URL passed.
- Delhi region → Noida 104 query returned the matching location with region reset to All.
- Owner searches reset a future date and Pending status and found existing appointments on desktop and mobile. Customer records were not changed.

Evidence: search-regression-results.json, search-fixed-desktop.png and search-fixed-mobile.png.
