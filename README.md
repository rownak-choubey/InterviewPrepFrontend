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
GitHub (master push) → GitHub Actions CI (lint + build) → Deploy to Netlify
```

### CI/CD Pipeline

- **CI**: Lint + build on every push/PR to `master`
- **CD**: Build + deploy to Netlify on push to `master`

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., `http://YOUR_VM_IP:8080`) |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Netlify site ID |

### Setup

1. **Netlify**: Connect your GitHub repo at https://app.netlify.com
2. **GitHub Secrets**: Set the 3 secrets above in repo Settings → Secrets
3. **Backend URL**: Set `NEXT_PUBLIC_API_URL` to your Oracle VM API endpoint

### Deploy

Push to `master` — GitHub Actions builds and deploys to Netlify automatically.

### Manual Deploy

```bash
npm run build
# Deploy .next/ output to your hosting provider
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

## Architecture

- **Auth**: HttpOnly cookies set by backend, Axios interceptors for refresh
- **Theme**: CSS variables, dark/light mode via ThemeContext
- **Progress**: localStorage persistence via ProgressContext
- **Route Protection**: Client-side AuthGuard in `(protected)/layout.tsx`
