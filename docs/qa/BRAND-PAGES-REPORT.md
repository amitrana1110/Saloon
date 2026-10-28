# Brand pages verification

Reviewed https://www.hmsalon.co.uk/ on 28 October 2026. Added About, Locations, Women’s Services, Men’s Services, Franchise, HM News, Blogs and Contact while preserving the existing salon design, booking flow, owner authentication and media library.

## Content and media

- 75 current branch entries and 20 upcoming locations, searchable by name, region and address. Sector 104 uses local booking; other branches use their published branch contact links.
- Six original blog covers and article previews linking to full articles.
- Eight press cards linking to the publishers listed on the source site.
- Fifteen original Lookbook photos plus one original salon film, alongside owner-published uploads.
- Original video served locally, with seven click-to-load YouTube franchise stories.
- Original image provenance stored in `public/images/original/SOURCES.json`. WebP derivatives keep image payloads smaller.
- Contact/franchise forms prepare a WhatsApp draft. Visitors review and send it themselves. No enquiry is automatically transmitted or claimed to be received.

## Verification

- Production build passed with `.next-reference-check`.
- 57 automated tests passed, including navigation privacy, original asset presence and branch directory checks.
- 64 browser layout checks: eight tabs × four widths (320, 390, 768, 1440) × light/dark. No horizontal document overflow.
- All nine brand/gallery sections render directly from their section URLs without a Discover flash.
- 65 local original-media URLs returned HTTP 200.
- Original MP4 playback started successfully in the browser with a 19.3-second duration and no media error. A franchise YouTube story mounted on click.
- Directory search found the Hazipur branch and handled no-result searches. Blog preview/back navigation and franchise enquiry preparation passed.

Screenshots: `brand-about-desktop.png`, `brand-franchise-desktop.png`, `brand-blogs-mobile.png`. Layout results: `brand-responsive-results.json`.

External publishers and YouTube remain third-party destinations; full articles are linked rather than copied into the local application.
