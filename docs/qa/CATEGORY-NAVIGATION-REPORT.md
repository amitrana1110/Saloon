# Direct category navigation

Verified 28 October 2026.

Category links now open a compact service catalog and move its cards beneath the sticky header. Removed the oversized page introduction, separate filter tabs and pricing banner above results. A compact category select remains beside search, and the pricing note appears after the cards.

Both Discover entry points (quick chips and photo categories) were checked for Hair, Colour, Skin, Nails, Men and Bridal. The 48 final browser checks covered 320px mobile in light mode, 390px mobile in dark mode and 1440px desktop in both themes. Matching service cards were visible immediately and no horizontal overflow occurred. General Services links reset to all services.

Category selection and search are stored in the section URL and rendered correctly after refresh. All six category URLs were checked against the server-rendered HTML. Search persistence and direct booking from a service result were also checked.

59 automated tests passed. Production build passed. Evidence: category-final-checks.json and category-hair-mobile.png.

Women’s and Men’s Services were also checked on mobile and desktop: their service lists now appear before the large promotional photo, and the first treatment options are visible without scrolling.
