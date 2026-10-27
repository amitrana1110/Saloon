# Hair Masters

Next.js App Router and React salon website with service discovery, a shared appointment schedule, an owner dashboard and a Groq-powered assistant.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: run `npm run build`, then `npm start`. Development uses `.next-dev`; production uses `.next`. `NEXT_DIST_DIR` selects an isolated build directory when needed.

## Booking and owner confirmation

1. A customer chooses treatments, a date and an available start time, then submits a request.
2. The request appears as **Awaiting confirmation** in **Owner dashboard**. Pending requests do not reserve time.
3. The owner selects **Confirm appointment**. The treatment's entire duration is reserved in the shared schedule. Overlapping start times disappear from the customer form on that date.
4. A competing request cannot be confirmed if its treatment overlaps an existing reservation. This is checked on the server inside a locked write, including concurrent confirmations.
5. Cancelling a confirmed appointment releases its time. Cancellation requires a second click and remains visible in history. Completed appointments can be recorded after their scheduled end time.

The app has one shared reservation lane, not separate staff calendars. Available start times are hourly from 10 AM to 6 PM; treatments must finish by the listed 9 PM closing time. Date/time validation uses Asia/Kolkata. A day with no suitable starts is disabled in the calendar.

The dashboard includes pending/confirmed/completed/cancelled filters, counts, upcoming visits, customer/treatment/phone search, visit-date filtering, contact links, end times, estimated prices and reference IDs. Successful changes open the matching status tab. Other visible browser tabs refresh approximately every five seconds and on focus.

## File storage

Appointments persist on this local server in `.data/appointments.json`, which is ignored by Git. Atomic file replacement and an exclusive lock coordinate writes between local server processes. Restarting the app does not erase this file. Browsers using the same server see the same schedule.

Owner access now requires a server-verified session at `/admin`. Customers receive availability only; customer details and management actions are private. The current file-backed account and booking stores are intended for this single-server app. Use a production database before a multi-server/serverless deployment. No WhatsApp messages or customer notifications are sent automatically; sharing via WhatsApp is an explicit optional user action. This concept is not the official salon's scheduling system.

Favourites stay in localStorage. Previous browser-only requests are preserved and can be imported into the owner dashboard when their service/date/time remains valid.

## AI setup

Set these values in the project's `.env` or `.env.local` (see `.env.example`):

```env
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-20b
```

Save the file and restart the server after environment changes. `npm run check:ai` makes one small live request and prints a safe diagnosis without printing the key. `OPENAI_API_KEY` and `OPENAI_MODEL` are no longer used. Missing keys, authentication failures, provider limits and outages fall back to the FAQ assistant. Account quotas and billing remain controlled by your Groq account.

## Verification

- `npm test`: 54 reported tests pass, including appointment validation, duration overlap, salon timezone, closing hours, simultaneous confirmation conflicts, persistence, cancellation, API handling, chat failures and keyboard geometry.
- Production build passes.
- Two-tab customer/owner checks cover submission, automatic confirmation updates, reserved-slot removal, cancellation/reopening and conflict rejection.
- Sixteen dashboard/booking layout checks pass at 320, 390, 768 and 1440px in light and dark themes.


Prices, treatment durations and reference imagery remain illustrative. Only salon staff can verify real-world availability and actual pricing.

## Owner sign-in

Open http://localhost:3000/admin/login. On a new checkout, run `npm run admin:setup` to create your private owner account. Initial login details are in `.data/admin-login.json`; keep that file private and save the credentials before removing the delivery file. It is ignored by Git and is not served by the website.

For a fresh installation, run `npm run admin:setup` once. It generates a strong owner password and saves a salted scrypt hash in `.data/admin-auth.json`. Optional `ADMIN_SETUP_EMAIL` and `ADMIN_SETUP_PASSWORD` environment values can supply the first account; the password must be at least 16 characters. Setup never overwrites an existing account. There is no public registration.

Owner sessions use HttpOnly, SameSite=Strict cookies, expire after eight hours and are invalidated on sign-out. Five failed logins trigger a 15-minute cooldown. Set `APP_ORIGIN` to the site's exact public HTTPS origin when deploying; HTTPS sessions use Secure host-only cookies. Customer booking remains public, while public availability responses omit names, phone numbers and booking IDs. A customer can check their own submitted request using its private receipt token.

Run `node scripts/verify-admin.mjs http://localhost:3000` to verify access restrictions, cookie flags, origin checks and logout using the local owner's credentials without printing them. This check requires the local credential delivery file.



### Owner media library (no database)

Sign in at `/admin/login`, then choose **Media Library**. Upload JPG/PNG/WebP photos (8 MB maximum) or MP4/WebM videos (30 MB maximum), add a caption and category, then save. Uploads start as owner-only drafts. Change Visibility to Published and save to show an item in the customer Lookbook. Move up/down controls change display order; Delete removes an item permanently after confirmation.

Files and metadata live in `.data/media/` (`library.json` plus randomly named media files). Back up the entire folder together. The folder is ignored by Git and is not served as a public directory. The server checks owner sessions for uploads, edits, ordering, deletion and draft viewing; customers receive published items only. Uploaded images open at full size, and videos use playback controls with byte-range support.

Use one application server with a persistent writable disk. Ephemeral hosting will lose local uploads; multiple application instances must not maintain separate local media folders. Set `MEDIA_DATA_DIR` to an absolute persistent folder if needed. Uploading media does not require an external service or database.
