# Hair Masters

Salon website with service search, appointment requests, a private owner dashboard, a managed Lookbook and a Groq assistant. Built with Next.js and React. Uses local files during development and private Vercel Blob storage in production; no database is required.

## Quick start

Open **this folder**, `hair-masters`, in your editor. Run commands from the folder containing `package.json`.

```powershell
npm ci
# Fresh checkout only: copy .env.example to .env; do not overwrite an existing .env.
npm run admin:setup
npm run dev
```

Landing website: http://localhost:3000. Booking app: http://localhost:3000/salon. Owner access: http://localhost:3000/admin/login.

Owner setup leaves an existing account unchanged. Newly generated credentials are delivered privately in `.data/admin-login.json`; do not commit or share that file.

## Folder map

```text
hair-masters/
├── src/                 Application source
│   ├── app/             Next.js pages, API routes and global CSS
│   ├── components/      React components grouped by feature
│   ├── hooks/           Browser state and viewport hooks
│   └── lib/             Business rules, content and server stores
├── public/              Static images and original media
├── tests/unit/          Automated tests
├── scripts/             Setup and verification commands
├── docs/                Workflow and QA documentation
├── .data/               Private records and uploads (ignored by Git)
├── .env                 Local secrets (ignored by Git)
├── .env.example         Safe configuration template
├── next.config.mjs      Framework configuration
└── package.json         Dependencies and commands
```

**Read [the complete project workflow](docs/PROJECT-WORKFLOW.md)** for detailed architecture, customer/owner journeys, APIs, configuration, storage, backups, maintenance and deployment.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm test` | Unit and route-handler tests |
| `npm run build` | Optimized production build |
| `npm start` | Serve the production build |
| `npm run admin:setup` | Create first owner account if absent |
| `npm run check:ai` | Small live Groq check |
| `npm run check:http -- http://localhost:3000` | Check running pages and assets |
| `npm run check:admin -- http://localhost:3000` | Verify authentication using local credentials |

Requires Node.js 20.9+. Generated folders `.next`, `.next-dev` and `node_modules` are not source code. Do not edit them.

Deployment options: one Node.js server with a persistent disk, or Vercel with a connected **Private Blob** store. Vercel automatically uses cloud JSON/media storage through `BLOB_READ_WRITE_TOKEN`; it never writes bookings to its temporary disk. Set `APP_ORIGIN` to the exact public origin. Read the deployment section in the workflow guide first.

For the deployed Vercel owner-login setup, see [Owner login on Vercel](docs/PROJECT-WORKFLOW.md#16-owner-login-on-vercel). `npm run admin:export` prepares private hosting values using your existing account; never commit the generated file. Also connect a Private Blob store for durable appointments and uploads.

The main website contains About, Locations, Women’s services, Men’s services, Franchise, HM News, Blogs and Contact at dedicated URLs. Booking links first open `/salon?section=services`; selecting a treatment continues to booking. The booking workspace keeps services, Lookbook, favourites and appointments; old `/?section=...` links redirect to the appropriate new address.
