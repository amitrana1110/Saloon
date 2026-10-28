# Vercel bookings and media storage verification

Verified 28 October 2026 against https://saloon-seven-henna.vercel.app/.

## Cause and implementation

The app previously wrote appointment JSON, upload metadata and media bytes to local disk. Vercel Functions cannot persist those files. Added a private Vercel Blob adapter; no database was added. Local development without a Blob token keeps filesystem storage.

Booking and media JSON updates use fresh origin reads and conditional ETag commits with retry. Initial object creation forbids overwrite. Direct owner uploads bypass the Functions request-body limit, then finalize through authenticated validation. Draft media remains private. Published video is delivered through a streaming/range API. The upload control stays disabled until the UI knows the selected storage mode.

## Verification

- 76 automated tests passed, including concurrent initial writes, overlapping confirmations from independent cloud-store instances, cloud media byte validation, ranges, deletion, origin checks and denial of unauthenticated direct-upload/finalization requests.
- Optimized production build passed.
- Vercel reported deployment success; live availability and owner configuration returned 200.
- 25 live API checks passed: login; public access denial; booking creation and private receipt; confirmation; availability privacy; duplicate interval rejection; cancellation and time release; photo upload; authenticated draft preview; public draft denial; publication; public metadata privacy; ranged bytes; unpublication; deletion; logout.
- Mobile browser: logged in as owner, uploaded the existing salon film (8,949,314 bytes) as a private draft, saw success feedback, played it, and published it.
- Anonymous API: downloaded the complete 8,949,314-byte published video successfully; requested a 100-byte seek range and received 206 with exactly 100 bytes.
- Mobile customer browser: submitted a named QA booking, refreshed and recovered its receipt, then saw the confirmed receipt after confirmation through the mobile owner UI.
- Test photo/video were deleted via authenticated APIs. Both QA bookings were cancelled; cancelled test records remain in owner history. No real customer request or existing upload was changed.

Browser testing used viewport emulation, not a physical phone. Private screenshot evidence and verification outputs are retained only under ignored `.data/qa-evidence`, not published to GitHub. The new storage connection starts with cloud data; existing local `.data` is not automatically migrated.
