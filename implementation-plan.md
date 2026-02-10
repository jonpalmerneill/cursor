# Portfolio Web App – Implementation Plan

## Goal

Expand the current static portfolio into a web app with:

- **Google sign-in** – Users can sign in with their Google account
- **AI chat widget** – A chat interface that answers questions about your work (projects, experience, skills)
- **Comment section** – Signed-in users can leave messages (e.g. on the whole site or per section)

---

## 1. Services Needed

### Authentication: Supabase Auth (recommended)

- **Why**: Single provider for both auth and database; supports Google OAuth; generous free tier; works with static sites via client-side JS.
- **Alternative**: Firebase Authentication – also supports Google sign-in and is well documented; you would then use Firebase or another service for the database.
- **Choice**: Use **Supabase Auth** so one platform handles both “who is signed in” and “where comments are stored.”

### Database: Supabase (PostgreSQL)

- **Why**: Same project as auth; PostgreSQL with real-time optional; Row Level Security (RLS) to restrict who can insert/update/delete comments; REST and JS client.
- **Use for**: Storing comments (user id, display name, avatar URL, body, timestamp, optional section/page id).
- **Alternative**: Firebase Firestore if you prefer Firebase for auth and NoSQL.

### AI: Backend proxy (serverless) + OpenAI (or similar)

- **Why**: API keys must never live in the browser. A small backend receives the user’s message, calls OpenAI (or another provider), and returns the reply.
- **Services**:
  - **AI provider**: OpenAI API (e.g. GPT-4 or GPT-3.5) or Anthropic Claude. Use a system prompt that includes your portfolio content (bio, projects, skills) so the bot “knows” your work.
  - **Backend**: A single serverless function (e.g. Vercel, Netlify, or Cloudflare Workers) that:
    - Accepts POST requests with the user’s message (and optionally session/auth if you want to restrict or rate-limit by user).
    - Calls the AI API with a fixed system prompt + user message.
    - Returns the assistant reply (e.g. JSON or plain text).
- **Alternative**: A small always-on backend (Node, Python) if you prefer not to use serverless.

### Hosting

- **Frontend**: Keep the current static setup – deploy to **Vercel**, **Netlify**, or **GitHub Pages** (HTML/CSS/JS only).
- **Backend**: Use the same platform’s serverless functions where possible (Vercel Functions, Netlify Functions) so the AI proxy lives next to the same repo and env.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (your portfolio: HTML + CSS + JS)                       │
│  - Renders portfolio, chat widget, comment section               │
│  - Supabase JS client: signInWithOAuth("google"), session        │
│  - Fetches comments from Supabase (read)                         │
│  - Inserts comment when user is signed in (write)                │
│  - Sends chat messages to YOUR backend only (no AI key in browser)│
└──────────────┬─────────────────────────────┬─────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│  Supabase                 │    │  Your serverless function       │
│  - Auth (Google OAuth)    │    │  (e.g. /api/chat)                │
│  - PostgreSQL (comments)  │    │  - Receives: { message }         │
│  - RLS: read all;         │    │  - Loads OPENAI_API_KEY from env │
│    insert if signed in    │    │  - Calls OpenAI with system     │
│                           │    │    prompt (your bio, projects)   │
│                           │    │  - Returns: { reply }            │
└──────────────────────────┘    └─────────────────────────────────┘
                                               │
                                               ▼
                                ┌─────────────────────────────────┐
                                │  OpenAI API (or other provider)  │
                                └─────────────────────────────────┘
```

- **Data flow – Auth**: User clicks “Sign in with Google” → redirect to Google → callback to Supabase → Supabase sets session; your JS reads `session` and shows “Signed in as …” and enables the comment form.
- **Data flow – Comments**: Page load → JS fetches comments from Supabase (public read). On submit (when signed in) → JS inserts row into `comments`; RLS allows insert only if `auth.uid()` is set.
- **Data flow – Chat**: User types in widget → JS POSTs to `https://your-site.com/api/chat` with `{ message }` → serverless function calls OpenAI with system prompt + user message → returns reply → JS displays it.

---

## 3. Security Considerations

- **Never expose AI API keys**: Use them only in the serverless function; store in environment variables (e.g. `OPENAI_API_KEY`) and never in frontend or repo.
- **Auth and comments**:
  - Use Supabase RLS so only authenticated users can insert/update/delete their own comments; allow public read for comments if you want them visible to everyone.
  - Validate and sanitize comment text (max length, strip HTML or render as plain text) to avoid XSS and abuse.
- **Chat endpoint**:
  - Rate limit by IP (or by authenticated user if you pass a token) to avoid abuse and cost overrun.
  - Validate request body (e.g. single `message` string, max length).
  - Use CORS so only your portfolio origin can call the API.
- **Google OAuth**: Rely on Supabase (or Firebase) to handle redirects and token exchange; keep OAuth client credentials in Supabase dashboard (or env for server-side if you ever need them there).
- **HTTPS**: Serve the site and API over HTTPS only (handled by Vercel/Netlify by default).

---

## 4. Step-by-Step Implementation Phases

### Phase 1: Project setup and Google sign-in

1. **Supabase project**
   - Create a project at [supabase.com](https://supabase.com).
   - Enable Google provider in Authentication → Providers; add Google OAuth client ID and secret (from Google Cloud Console).
   - Get project URL and anon (public) key for the frontend.

2. **Frontend auth**
   - Add Supabase JS client (e.g. one script tag or a small bundle).
   - Add “Sign in with Google” and “Sign out” buttons; wire to `signInWithOAuth({ provider: 'google' })` and `signOut()`.
   - On load, call `getSession()` and show signed-in state (e.g. name, avatar from `user.user_metadata`) or signed-out state.
   - Keep session in memory (and optionally use Supabase’s persistence); no need to store API keys.

3. **Deploy**
   - Deploy the static site as-is; confirm Google sign-in works in production (add your production URL to Supabase and Google OAuth redirect URIs).

### Phase 2: AI chat backend and widget

1. **System prompt**
   - Draft a system prompt that describes you and your work: short bio, list of projects with names and descriptions, skills, contact info. This will be sent with every chat request so the model answers from “your” perspective.

2. **Serverless function**
   - Create one endpoint (e.g. `api/chat.js` or `api/chat.ts`) that:
     - Accepts POST with JSON body `{ message: string }`.
     - Reads `OPENAI_API_KEY` from env.
     - Calls OpenAI (or other) API with system prompt + user message.
     - Returns `{ reply: string }` (or stream if you prefer).
   - Add rate limiting (e.g. by IP) and CORS for your domain.
   - Deploy (Vercel/Netlify/Cloudflare) and set the API key in the dashboard.

3. **Chat widget (frontend)**
   - Add a small chat UI (e.g. floating button that opens a panel) consistent with your black-and-white, text-only style.
   - On “Send”, POST the user message to `/api/chat` (or your deployed URL), then display the reply.
   - No auth required for chat unless you want to restrict or rate-limit by user later.

### Phase 3: Comment section

1. **Database**
   - In Supabase, create a table e.g. `comments` with columns: `id` (uuid), `user_id` (uuid, from auth), `author_name` (text), `author_avatar_url` (text, optional), `body` (text), `section_id` (text, optional, e.g. "about", "projects"), `created_at` (timestamptz).
   - Enable RLS: policy for SELECT to allow anyone; policy for INSERT to allow only when `auth.uid() = user_id` (and optionally restrict to your site). No UPDATE/DELETE or allow only “own row” if you want edit/delete later.

2. **Frontend**
   - Add a “Comments” section or block; fetch comments on load via Supabase client and render them (author name, body, date; optionally avatar).
   - If signed in, show a form (textarea + submit); on submit, insert into `comments` with current user’s id and metadata from session.
   - Sanitize or escape comment body when rendering (or store as plain text and render in a safe way).

### Phase 4: Polish and security

1. **Rate limiting**: Ensure the chat endpoint is rate-limited; add rate limiting for comment submission if needed (e.g. per user or per IP).
2. **Input validation**: Enforce max length and strip/escape HTML in comments; validate chat message length and type.
3. **Error handling**: Show user-friendly messages for auth errors, chat failures, and comment submit failures.
4. **Accessibility**: Keep keyboard and screen-reader support for the new UI (sign-in, chat, comment form).
5. **Docs**: Update README and claude.md with env vars (e.g. `OPENAI_API_KEY`), Supabase keys, and how to run the serverless function locally if applicable.

---

## Summary Table

| Concern           | Service / approach                                      |
|------------------|---------------------------------------------------------|
| Auth             | Supabase Auth (Google OAuth)                            |
| Database         | Supabase PostgreSQL (comments table + RLS)              |
| AI               | Serverless function + OpenAI (or similar)             |
| Hosting          | Static site + same host’s serverless (Vercel/Netlify)  |
| Security         | Keys in env only; RLS; rate limit; sanitize input; CORS |

This plan keeps your existing static portfolio and design, adds minimal backend (one serverless function), and uses one external platform (Supabase) for auth and comments so the architecture stays simple and maintainable.
