// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Force Nitro on with the Vercel preset and explicitly restore Vercel's
  // Build Output API paths. The Lovable config defaults Nitro output to dist/,
  // which Vercel deploys as an empty/static app and returns NOT_FOUND.
  //
  // We intentionally do NOT override `tanstackStart.server.entry` here:
  // the Cloudflare-style `src/server.ts` wrapper expects a Workers
  // `fetch(request, env, ctx)` signature and will not run on Vercel's Node
  // runtime. The default TanStack Start server entry works on Vercel.
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    },
  },
});
