// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Locked deployment target (REBUILD_PLAN / Phase 1 product decisions).
// Custom domain work is explicitly out of scope for this phase.
const SITE = 'https://gautham-balaji.vercel.app';

export default defineConfig({
  site: SITE,

  // Static-first. Individual routes opt into on-demand rendering with
  // `export const prerender = false` (currently only /api/contact).
  output: 'static',
  adapter: vercel(),

  integrations: [
    react(),
    // The sitemap emits trailing slashes by default, while `absoluteUrl()` in
    // src/lib/seo.ts strips them from every canonical. That left the two
    // disagreeing about the address of the same page
    // (/projects/vera/ against /projects/vera), which is exactly the kind of
    // mixed signal canonicals exist to prevent. The canonical form wins here;
    // the site root keeps its slash because that is its canonical form too.
    sitemap({
      serialize: (item) => ({
        ...item,
        url: item.url.length > SITE.length + 1 ? item.url.replace(/\/$/, '') : item.url,
      }),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // Type-safe environment variables. Secrets are server-only and never
  // reach the client bundle. Optional secrets let the app build and run
  // locally without credentials; /api/contact reports its own readiness.
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      CONTACT_TO_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        default: 'gautham.balajis@gmail.com',
      }),
      CONTACT_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        default: 'Portfolio Contact <onboarding@resend.dev>',
      }),
    },
  },
});
