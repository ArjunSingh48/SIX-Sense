// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Force Nitro on with the Vercel preset so the production build emits the
  // .vercel/output structure Vercel expects (Node serverless function for SSR
  // + static assets), instead of the default Cloudflare Workers bundle.
  //
  // We intentionally do NOT override `tanstackStart.server.entry` here:
  // the Cloudflare-style `src/server.ts` wrapper expects a Workers
  // `fetch(request, env, ctx)` signature and will not run on Vercel's Node
  // runtime. The default TanStack Start server entry works on Vercel.
  nitro: {
    preset: "vercel",
  },
});
