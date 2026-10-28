# Hair Masters

Salon website with service search, appointment requests, a private owner dashboard, a managed Lookbook and a Groq assistant. Built with Next.js and React. Uses local files for persistence; no database is required for the current single-server setup.

## Quick start

Open **this folder**, `hair-masters`, in your editor. Run commands from the folder containing `package.json`.

```powershell
npm ci
# Fresh checkout only: copy .env.example to .env; do not overwrite an existing .env.
npm run admin:setup
npm run dev
```

Customer site: http://localhost:3000. Owner access: http://localhost:3000/admin/login.

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

Deploy on one Node.js server with persistent writable storage and HTTPS. Set `APP_ORIGIN` to the exact public origin. Independent replicas and ephemeral serverless disks are unsuitable for the current local-file stores; read the deployment section in the workflow guide first.
