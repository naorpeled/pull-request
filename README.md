# Pull Request.dev - OSS Contribution Chatbot

A chatbot that helps developers find good first issues in open source projects, powered by the [goodfirstissues](https://github.com/iedr/goodfirstissues) dataset.

## Features

- **Chat-based interface** for finding open source issues
- **Language filtering** - Select your preferred programming languages
- **LLM-powered recommendations** - Get personalized issue suggestions
- **Privacy-first** - Chat messages are not stored in our database
- **Consent-gated analytics** - Mixpanel and Google Analytics (opt-in only)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Vercel AI SDK
- **Storage**: Vercel KV (Upstash Redis)
- **LLM**: OpenAI GPT-4o-mini (via Vercel AI SDK)
- **Analytics**: Mixpanel, Google Analytics 4
- **Deployment**: Vercel

## Setup

### Prerequisites

- Node.js 20+ (required for Next.js 16) 
- pnpm (install via `npm install -g pnpm` or see [pnpm.io](https://pnpm.io/installation))
- Vercel account
- OpenAI API key
- Vercel KV database (created via Vercel dashboard)
- (Optional) Mixpanel account and Google Analytics 4 property

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pull-request-minimal
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key

# Vercel KV (required)
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Cron Secret for dataset refresh (required for production)
CRON_SECRET=your_random_secret_string

# Analytics (optional - only if you want analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

### Getting Vercel KV Credentials

1. Go to your Vercel dashboard
2. Navigate to your project → Storage → Create Database → KV
3. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN` from the dashboard

### Initial Dataset Load

Before using the chatbot, you need to load the dataset:

1. **Manual trigger** (for development):
```bash
curl -X POST http://localhost:3000/api/admin/refresh-dataset \
  -H "Authorization: Bearer your_cron_secret"
```

2. **Vercel Cron** (for production):
   - Add a cron job in `vercel.json` (see below)
   - Or use Vercel Cron Jobs in the dashboard

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Vercel Cron Configuration

Create a `vercel.json` file in the root directory:

```json
{
  "crons": [
    {
      "path": "/api/admin/refresh-dataset",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This will refresh the dataset daily at 2 AM UTC.

Alternatively, you can set up cron jobs in the Vercel dashboard:
- Go to your project → Settings → Cron Jobs
- Add a new cron job:
  - Path: `/api/admin/refresh-dataset`
  - Schedule: `0 2 * * *` (daily at 2 AM UTC)

**Important**: Make sure to set the `CRON_SECRET` environment variable in Vercel. The cron job will automatically include the `x-vercel-cron` header, but you can also protect it with a Bearer token.

## API Endpoints

### `POST /api/chat`
Chat endpoint that returns streaming LLM responses with issue recommendations.

**Request:**
```json
{
  "message": "Find me Python issues",
  "preferredLanguages": ["Python"]
}
```

**Response:** Server-Sent Events (SSE) stream with:
- LLM text chunks
- Final `recommendedIssues` array with issue details

### `GET /api/preferences`
Get user preferences (languages, consent status).

**Response:**
```json
{
  "preferredLanguages": ["Python", "JavaScript"],
  "consent": true
}
```

### `PUT /api/preferences`
Update user preferences.

**Request:**
```json
{
  "preferredLanguages": ["Python"],
  "consent": true
}
```

### `POST /api/admin/refresh-dataset`
Refresh the dataset from the goodfirstissues repository.

**Headers:**
- `Authorization: Bearer <CRON_SECRET>` (or `x-vercel-cron` header for Vercel Cron)

**Response:**
```json
{
  "success": true,
  "issueCount": 1234,
  "languageCount": 45
}
```

## Privacy & Analytics

- **Chat messages are NOT stored** in our database
- **Analytics are opt-in only** - Users must consent before any tracking
- **Anonymous metrics only** - No personal information is collected
- See `/privacy` page for full details

## Rate Limiting

The chat API is rate-limited to 20 requests per minute per user (based on anonymous ID + IP address).

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/              # Chat API endpoint
│   │   ├── preferences/       # User preferences API
│   │   └── admin/
│   │       └── refresh-dataset/ # Dataset refresh endpoint
│   ├── privacy/               # Privacy policy page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main chat page
│   └── globals.css            # Global styles
├── components/
│   ├── ChatInterface.tsx      # Main chat UI
│   ├── LanguagePicker.tsx     # Language selection component
│   ├── IssueCards.tsx         # Issue recommendation cards
│   ├── ConsentBanner.tsx      # Analytics consent banner
│   └── PrivacyDisclaimer.tsx  # Privacy notice component
├── lib/
│   ├── analytics.ts           # Analytics helpers (GA4, Mixpanel)
│   ├── kv.ts                  # Vercel KV utilities
│   └── dataset.ts             # Dataset normalization and filtering
└── README.md
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for LLM |
| `KV_REST_API_URL` | Yes | Vercel KV REST API URL |
| `KV_REST_API_TOKEN` | Yes | Vercel KV REST API token |
| `CRON_SECRET` | Yes (prod) | Secret for protecting cron endpoints |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | No | Mixpanel project token |

## License

MIT

