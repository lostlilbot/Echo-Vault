# EchoVault

Free, local AI-powered memory reflection and synthesis. Store your thoughts as Pastebin notes, then let on-device AI generate insights and connect ideas — no external AI API costs, no data leaving your machine.

## Features

- **Secure Authentication** – JWT-based auth with bcrypt password hashing
- **Memory Storage** – Save memories as Pastebin notes with title and content
- **AI Insights (Echoes)** – Each memory gets a reflective AI-generated insight using a local transformer model (Flan-T5 Small)
- **Synthesis** – Combine multiple memories into a unified insight
- **Zero AI Costs** – All AI runs locally via Transformers.js; no Claude/Gemini/Grok API keys needed
- **SQLite Database** – Drizzle ORM with better-sqlite3; migrations included
- **TypeScript** – Fully typed backend and API routes
- **Next.js 16** – App Router, Server Components by default

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.9.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Drizzle ORM | 0.45.x | Database ORM |
| SQLite (better-sqlite3) | – | Local file-based database |
| Transformers.js | 2.17.x | Local ONNX AI inference (Flan-T5 Small) |
| bcrypt | 6.x | Password hashing (12 rounds) |
| jsonwebtoken | 9.x | JWT authentication |
| zod | 4.x | Input validation |

## Prerequisites

- **Node.js 20+** (for Next.js compatibility)
- **Bun** package manager (recommended) – install: `curl -fsSL https://bun.sh/install \| bash`
- **Pastebin API Dev Key** – free from https://pastebin.com/doc_api#1

## Quick Start

1. **Clone & install**
   ```bash
   git clone <your-repo-url>
   cd echovault
   bun install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add:
   - `JWT_SECRET` – a strong random string (min 32 chars)
   - `PASTEBIN_DEV_KEY` – your Pastebin developer key

3. **Set up database**
   ```bash
   bun db:generate   # generate migrations (already included)
   bun db:migrate    # apply migrations to echovault.db
   ```

4. **Start development server**
   ```bash
   bun dev
   ```
   App runs at http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ Yes | Strong random secret for signing JWT tokens (e.g. 256-bit hex) |
| `PASTEBIN_DEV_KEY` | ✅ Yes | Pastebin developer API key (get from pastebin.com) |
| `DATABASE_URL` | ⚠️ Optional | Path to SQLite file (default: `./echovault.db`) |

### Generating a JWT Secret

```bash
# Using OpenSSL
openssl rand -hex 32

# Or with Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

All endpoints expect JSON bodies and return JSON responses.

### Authentication

#### `POST /api/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Errors:** 400 (validation), 409 (email exists), 500 (server)

---

#### `POST /api/auth/login`

Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Include `token` in subsequent requests as `Authorization: Bearer <token>`.

**Errors:** 400, 401 (invalid credentials), 500

---

### Memories

#### `GET /api/memories`

Fetch all memories for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "memories": [
    {
      "id": 1,
      "title": "My First Memory",
      "pastebinUrl": "https://pastebin.com/abc123",
      "pastebinKey": "abc123",
      "content": "Full text content...",
      "createdAt": "2025-05-02T10:00:00.000Z",
      "userId": 1
    }
  ]
}
```

---

#### `POST /api/memories`

Create a new memory. Content is automatically uploaded to Pastebin, then stored locally. AI insight (echo) is generated asynchronously.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Project Idea",
  "content": "Build an app that helps people..."
}
```

**Response (201):**
```json
{
  "id": 3,
  "userId": 1,
  "pastebinUrl": "https://pastebin.com/xyz789",
  "pastebinKey": "xyz789",
  "title": "Project Idea",
  "content": "Build an app that helps people...",
  "createdAt": "2025-05-02T10:30:00.000Z"
}
```

**Errors:** 400 (validation), 401, 500

---

### Echoes (AI Insights)

#### `POST /api/echoes`

Generate an AI insight (echo) for a specific memory. If an echo already exists, returns the cached one.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "memoryId": 3
}
```

**Response (201):**
```json
{
  "id": 5,
  "memoryId": 3,
  "insight": "Considering your idea for a helpful app, you might explore user-centered design early...",
  "createdAt": "2025-05-02T10:31:00.000Z"
}
```

**Errors:** 400, 401 (unauthorized), 403 (not your memory), 404 (memory not found), 500

---

### Synthesis

#### `POST /api/synthesis`

Generate a synthesized insight connecting multiple memories.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "memoryIds": [1, 3, 7]
}
```

**Response (200):**
```json
{
  "synthesis": "Looking across your notes on project ideas and learning goals, a common thread emerges: you're drawn to building tools that democratize access to knowledge...",
  "memoryCount": 3
}
```

**Errors:** 400, 401, 404 (no memories found), 500

---

## How AI Works (Free & Local)

EchoVault uses **Transformers.js** (ONNX runtime) to run the **Flan-T5 Small** model entirely in-process. No external API calls, no per-token fees, and your data never leaves the server.

- **Model:** `Xenova/flan-t5-small` (~300MB download on first run, cached in `.model-cache/`)
- **Inference:** CPU-based, runs in a Web Worker-like environment
- **Performance:** ~1–3 seconds per inference on modern CPUs
- **Privacy:** 100% local; no network requests to AI providers

### Why This Matters

Most apps integrate Claude, Gemini, or GPT and incur costs per token. EchoVault demonstrates a cost-effective alternative using open models. Trade-off: slightly lower quality than frontier models, but still coherent and useful for reflection tasks.

## Database Schema

```
users
  id (PK)
  email (unique)
  password_hash
  created_at

memories
  id (PK)
  user_id → users.id
  pastebin_url
  pastebin_key
  title
  content
  created_at

echoes
  id (PK)
  memory_id → memories.id
  insight (AI-generated)
  created_at

tags
  id (PK)
  name (unique)

tag_assignments
  tag_id → tags.id (FK, PK part)
  memory_id → memories.id (FK, PK part)
  Composite PK: (tag_id, memory_id)
```

### Indexes

- `users_email_idx` on `users.email`
- `memories_user_id_idx` on `memories.userId`
- `echoes_memory_id_idx` on `echoes.memoryId`
- `tags_name_idx` on `tags.name`

## Scripts

| Command | Purpose |
|---------|---------|
| `bun dev` | Start Next.js dev server (http://localhost:3000) |
| `bun build` | Production build |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |
| `bun typecheck` | TypeScript type checking |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Apply migrations to SQLite DB |

**Important:** Never run `bun db:migrate` on production automatically without testing. Migrations run automatically in the Kilo sandbox after push.

## Security Notes

- **JWT Secret** – Change from default; use at least 256-bit random value
- **Password Hashing** – bcrypt with 12 rounds (configurable in `src/utils/auth.ts`)
- **API Keys** – Pastebin dev key is required; treat as secret (it has rate limits)
- **Rate Limiting** – Not implemented yet; consider adding for production
- **Input Validation** – All API inputs validated with zod schemas

## Development Guidelines

### Adding New API Routes

Create files under `src/app/api/<route>/route.ts`. Export `GET`, `POST`, etc. Use `NextResponse.json()` for responses.

Example:
```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { myTable } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(myTable);
  return NextResponse.json({ rows });
}
```

### Using the Database

Import `db` and schema tables from `@/db` and `@/db/schema`. Drizzle provides type-safe queries.

```typescript
import { db } from "@/db";
import { users, memories } from "@/db/schema";
import { eq } from "drizzle-orm";

const userMemories = await db
  .select()
  .from(memories)
  .where(eq(memories.userId, userId));
```

### Adding New AI Features

Use the local Transformers.js pipeline in `src/utils/ai/local.ts`. Example:

```typescript
import { generateAIResponse } from "@/utils/ai/local";

const prompt = `Summarize: "${text}"`;
const summary = await generateAIResponse(prompt);
```

The model lazily loads on first invocation (~300MB download cached).

## Project Structure

```
/
├── .env.example              # Environment template
├── .gitignore
├── AGENTS.md                 # Kilo agent instructions
├── drizzle.config.ts         # Drizzle migration config
├── next.config.ts            # Next.js configuration
├── package.json
├── postcss.config.mjs        # Tailwind CSS via PostCSS
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── echoes/route.ts
│   │   │   ├── memories/route.ts
│   │   │   └── synthesis/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── db/
│   │   ├── index.ts          # DB connection
│   │   ├── migrate.ts        # Migration runner
│   │   ├── schema.ts         # Drizzle schema
│   │   └── migrations/       # Auto-generated SQL
│   └── utils/
│       ├── ai/
│       │   └── local.ts      # Transformers.js AI
│       ├── auth.ts           # JWT + bcrypt
│       ├── pastebin.ts       # Pastebin API client
│       └── validation.ts     # Zod schemas
├── .model-cache/             # Cached AI models (gitignored)
├── echovault.db              # SQLite database (gitignored)
└── README.md
```

## Cost & AI Provider Comparison

| Provider | Model | Cost per 1K tokens | Monthly cost (100 users × 10 req/day) |
|----------|-------|--------------------|--------------------------------------|
| **EchoVault (local)** | Flan-T5 Small | $0.00 | $0.00 |
| Anthropic | Claude Sonnet 4 | ~$0.003 – 0.015 | $150 – $780 |
| Google | Gemini Pro | ~$0.0005 – 0.0015 | $30 – $150 |
| xAI | Grok | ~$0.01 – 0.03 | $600 – $1,800 |

**EchoVault choice:** Free, offline, privacy-respecting. Model quality is lower than frontier LLMs but sufficient for reflection tasks.

## Known Limitations & Future Work

- **Rate Limiting** – Not implemented; could be added via `next-rate-limit`
- **Pastebin Reliability** – Pastebin is a free external service; if it's down, memory creation fails. Consider adding local backup storage.
- **AI Quality** – Flan-T5 Small is a 80M parameter model; results are basic. Replace with larger models (Flan-T5 Large, DistilBERT, etc.) by changing model ID in `local.ts`.
- **Tagging System** – Schema exists but UI and API not implemented yet.
- **Tests** – No test suite yet; add with `vitest` or `jest`.
- **CORS** – Not needed for same-origin SPA; adjust if building a separate frontend.
- **Production Deployment** – Ensure `JWT_SECRET` and `PASTEBIN_DEV_KEY` set in hosting env; database file must be writable.

## Troubleshooting

### Model Download Fails

First run downloads ~300MB from Hugging Face. If it fails:
- Check internet connectivity
- Ensure `~/.cache` or project directory is writable
- Set `HF_HOME` env var to custom cache location

### Database Errors

```bash
# Reset DB (development only)
rm echovault.db
bun db:migrate
```

### Type Errors After Adding Packages

If TypeScript can't find types:
```bash
bun add -D @types/<package-name>
```

### Pastebin API Returns Error

- Verify `PASTEBIN_DEV_KEY` is correct
- Check rate limits (free tier: 50/day per IP, dev key raises limit)
- Ensure request body is `application/x-www-form-urlencoded` (handled by code)

## Contributing

This is a starter template optimized for AI-assisted development. Feel free to fork, modify, and extend.

## License

MIT – see LICENSE file for details.

## Acknowledgments

- Next.js team for an amazing React framework
- Vercel for Tailwind CSS v4
- Drizzle ORM team for intuitive database toolkit
- Hugging Face for open models and Transformers.js
- Pastebin for free paste hosting

---

**Built with ❤️ and free AI**
