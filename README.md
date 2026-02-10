# Personal Portfolio Web App

A minimalist, single-page portfolio with **Google sign-in**, an **AI chat widget** (OpenAI) that answers questions about your work, and a **comment section** for signed-in users. Built with vanilla HTML, CSS, and JavaScript; auth and data via Supabase.

## What This Project Is

- **Hero, Projects, About, Contact**: Same portfolio content as before
- **Google sign-in**: Sign in with Google only (no email/password)
- **AI chat**: Floating “Chat” button opens a panel; asks OpenAI (via Supabase Edge Function) questions about your work
- **Comments**: Signed-in users can post messages; everyone can read

## Features

- **Vanilla stack**: HTML, CSS, JS; Supabase client for auth and database
- **Auth**: Supabase Auth with Google OAuth
- **AI**: Supabase Edge Function calls OpenAI (API key stored in Supabase secrets)
- **Comments**: PostgreSQL table with RLS (read all; insert/update/delete own)
- **Minimalist design**: Black and white, text-focused

## Project Structure

```
.
├── index.html          # Main page (portfolio + auth + chat + comments)
├── styles.css          # Styles
├── app.js              # Auth, chat widget, comments logic
├── config.example.js   # Copy to config.js and add Supabase URL + anon key
├── .env.example        # Reference for env vars (Supabase; OpenAI lives in Edge Function secrets)
├── supabase/
│   ├── functions/
│   │   └── chat/
│   │       └── index.ts   # Edge Function: OpenAI chat
│   └── migrations/
│       └── 20250209000000_create_comments.sql   # comments table + RLS
└── README.md
```

## Setup (Supabase, config, chat, comments)

1. **Supabase project**
   - Create a project at [supabase.com](https://supabase.com).
   - In **Authentication → Providers**, enable **Google** and add your OAuth client ID and secret (from Google Cloud Console).
   - In **Project Settings → API**, copy the **Project URL** and **anon public** key.

2. **Frontend config**
   - Copy `config.example.js` to `config.js`.
   - Set `window.__SUPABASE_URL__` and `window.__SUPABASE_ANON_KEY__` in `config.js` (from step 1).  
   - Do not commit `config.js` (it is in `.gitignore`).

3. **Comments table**
   - In Supabase **SQL Editor**, run the contents of `supabase/migrations/20250209000000_create_comments.sql` (creates `comments` table and RLS policies).

4. **AI chat (Edge Function)**
   - Install [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project: `supabase link --project-ref YOUR_REF`.
   - Set the OpenAI API key as a secret:  
     `supabase secrets set OPENAI_API_KEY=sk-your-key`
   - Deploy the function **without JWT verification** so the browser preflight (OPTIONS) succeeds:  
     `supabase functions deploy chat --no-verify-jwt`
   - (Optional) Edit the system prompt in `supabase/functions/chat/index.ts` to match your name and bio, then redeploy.

5. **Redirect URL**
   - In Supabase **Authentication → URL Configuration**, set **Site URL** and add **Redirect URLs** for your app (e.g. `http://localhost:8000`, `https://your-site.com`).

## How to Run Locally

### Option 1: Simple HTTP Server (Recommended)

Using Python (if installed):

```bash
# Navigate to the project directory
cd /path/to/cursor

# Start a local server
python3 -m http.server 8000

# Open your browser and visit:
# http://localhost:8000/index.html
```

### Option 2: Using Node.js `serve`

If you have Node.js installed:

```bash
# Navigate to the project directory
cd /path/to/cursor

# Install serve globally (if not already installed)
npm install -g serve

# Or use npx to run without installing
npx serve .

# Follow the URL shown in the terminal (usually http://localhost:3000)
```

### Option 3: Direct File Opening

You can also open `index.html` directly in your browser, though some features (like loading Google Fonts) may work better with a local server.

## Customization

To personalize this portfolio:

1. **Update `index.html`**:
   - Replace "Your Name" with your actual name
   - Update the tagline in the hero section
   - Add your project details (titles, descriptions, tech stacks, links)
   - Write your bio in the About section
   - Update Twitter and LinkedIn links in the Contact section

2. **Update `styles.css`** (optional):
   - Adjust typography sizes
   - Modify spacing and layout
   - Change the color scheme (currently black and white)

## Deployment

This static site can be deployed to any static hosting service:

- **GitHub Pages**: Enable Pages in your repository settings
- **Netlify**: Drag and drop the folder or connect via Git
- **Vercel**: Connect your Git repository or use the CLI

No build step required. Ensure `config.js` is present on the server (or set `SUPABASE_URL` / `SUPABASE_ANON_KEY` via your host’s env and inject them into a small config script if needed).

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- CSS Custom Properties (for future enhancements)

## License

This project is open source and available for personal use.
