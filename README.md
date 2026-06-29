# InterviewPrep Frontend

Next.js 16 (App Router) frontend for the InterviewPrep application.

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | Next.js 16 (App Router)                       |
| Language   | TypeScript (strict mode)                      |
| Styling    | SCSS with CSS Modules (no Tailwind)           |
| State      | React Context API                              |
| HTTP       | Axios with interceptors                        |

## Local Development

```bash
npm install
npm run dev
```

Opens at `https://localhost:3000` (HTTPS for Secure cookies).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Auth routes (login, register)
│   ├── (protected)/      # Protected routes (dashboard)
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable UI components
├── config/               # API endpoints, configuration
├── context/              # React Context (auth, theme, progress)
├── data/                 # Static content
├── hooks/                # Custom React hooks
├── lib/                  # Axios instance + interceptors
├── services/             # API service functions
├── types/                # TypeScript interfaces
└── utils/                # Cookie, storage, formatting helpers
```

## Deployment

### Architecture

```
GitHub (master push) → GitHub Actions CI (lint) → Build Docker image → Push to OCIR → SSH to Oracle VM → docker compose up
```

VM runs 4 containers:
- **nginx** (port 80) → routes `/` to frontend, `/api/` to backend
- **frontend** (port 3000) → Next.js app
- **api** (port 8080) → .NET backend
- **db** (internal) → PostgreSQL

### CI/CD Pipeline

- **CI**: Lint on every push/PR to `master`
- **CD**: Build Docker image → push to OCIR → SSH deploy to Oracle VM

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `OCIR_USERNAME` | OCIR namespace + email |
| `OCIR_AUTH_TOKEN` | OCI auth token for registry |
| `ORACLE_VM_HOST` | VM public IP |
| `ORACLE_VM_USER` | SSH username (`ubuntu`) |
| `ORACLE_VM_SSH_KEY` | SSH private key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Docker

```bash
# Build locally
docker build -t interviewprep-frontend .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 interviewprep-frontend
```

### Manual Deploy

```bash
# On VM
cd ~/interviewprep
docker compose down
docker compose pull frontend
docker compose up -d
docker compose ps
```

### VCN Security Rules

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH |
| 80 | TCP | Nginx (frontend + API proxy) |
| 8080 | TCP | API direct access |

### Access

- **Frontend**: `http://YOUR_VM_IP`
- **API**: `http://YOUR_VM_IP/api/`
- **Health**: `http://YOUR_VM_IP/health`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
