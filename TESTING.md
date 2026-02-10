# Local testing guide

The app runs at **http://localhost:8000** when you start a local server (e.g. `python3 -m http.server 8000` or `npx serve .`).

Before testing auth, chat, and comments:

1. **config.js** – Replace the placeholders with your real Supabase **Project URL** and **anon public** key (Supabase Dashboard → Project Settings → API).
2. **Supabase** – Google provider enabled, redirect URL includes `http://localhost:8000` (Authentication → URL Configuration).
3. **Comments** – Run the migration `supabase/migrations/20250209000000_create_comments.sql` in the SQL Editor.
4. **Chat** – Deploy the Edge Function and set the secret:  
   `supabase functions deploy chat` and `supabase secrets set OPENAI_API_KEY=sk-...`

---

## 1. Google sign-in flow

1. Open http://localhost:8000
2. In the header you should see **Sign in with Google**
3. Click **Sign in with Google**
4. You should be redirected to Google (or Supabase), then back to the site
5. After sign-in, the header should show your name and a **Sign out** button
6. Click **Sign out** – you should be signed out and see **Sign in with Google** again

---

## 2. AI chat responses

1. Open http://localhost:8000
2. Click the **Chat** button (bottom-right)
3. The chat panel should open with title “Ask about my work”
4. Type a question, e.g. “What projects has this person worked on?” or “What’s their background?”
5. Click **Send**
6. You should see your message and then a reply from the AI (based on the portfolio system prompt)
7. Close the panel with the **×** button

If you see “Sorry, something went wrong”, check that the `chat` Edge Function is deployed and `OPENAI_API_KEY` is set in Supabase secrets.

---

## 3. Leaving a comment (signed-in only)

1. Sign in with Google (see section 1)
2. Scroll to the **Comments** section (or click **Comments** in the nav)
3. You should see a form: “Your message” textarea and **Post comment**
4. Enter a short message and click **Post comment**
5. The new comment should appear in the list above the form (your name and the message)
6. (Optional) Refresh the page – the comment should still be there

If the form is missing, you’re not signed in or the comments table/RLS isn’t set up.
