"use strict";

// Generates config.js from env vars so Vercel (or other hosts) can inject Supabase config.
// Set SUPABASE_URL and SUPABASE_ANON_KEY in the host's environment.

const fs = require("fs");
const path = require("path");

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

const out = [
  "// Generated at build time from environment variables",
  "window.__SUPABASE_URL__ = " + JSON.stringify(url) + ";",
  "window.__SUPABASE_ANON_KEY__ = " + JSON.stringify(key) + ";",
].join("\n");

const outPath = path.join(__dirname, "config.js");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote config.js from env (SUPABASE_URL set:", !!url, ")");
