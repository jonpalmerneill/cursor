import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "What's up Grand Rapids?",
  description: "Things to do and activities happening in Grand Rapids. Leave a comment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/config.js" strategy="beforeInteractive" />
        <Script src="/app.js" strategy="beforeInteractive" />
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
