# Separate landing website verification — 28 October 2026

## Delivered

- Minimal marketing homepage with original Hair Masters imagery, service links, branch details, journal previews and booking links.
- Dedicated About, Locations, Women’s services, Men’s services, Franchise, HM News, Blogs and Contact routes inside a shared responsive header/footer.
- Existing booking/customer application at `/salon`, with its informational menus replaced by return links to the website.
- Server redirects for legacy root query links and compatible routing for old hash links. Search/category values are preserved where relevant.
- Shared light/dark preferences, accessible native mobile navigation and real booking links that work before hydration.

## Checks

- 79 automated tests passed, including legacy URL preservation and rejection of private/unknown destinations.
- Optimized production build passed; the eight informational routes are prerendered.
- 55 production HTTP checks passed, plus six additional legacy-routing/privacy checks.
- 72 responsive page/theme checks passed: nine marketing pages × 320, 390, 768 and 1440px × light/dark. Each had its heading, fitted header and no document horizontal overflow.
- Additional header boundary checks passed at 375, 600, 1024, 1101, 1200, 1280 and 1920px.
- Mobile menu exposed Home, all eight requested pages and booking. Escape closed it.
- Location region/search behavior worked. A booking link reached `/salon?section=booking`, and services/date-time/contact steps worked at the new address.
- Women’s-page booking handoff, the booking app’s website-return link, original hash routing, blog preview/back navigation, contact enquiry preparation and franchise enquiry preparation worked.
- No WhatsApp messages or calls were sent, and no appointment/customer/media records were changed during this UI verification.
- No browser console errors appeared in the production interaction checks.

Private screenshot evidence is retained under ignored `.data/qa-evidence`. Testing used responsive browser viewports, not physical-device certification. Historical reports describe previous URL structures; the main workflow guide documents the current routes.
