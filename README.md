# Curio

A paper-inspired collection of creative projects, technology, and businesses, with a personal library for stories and private notes.

## Foundation status

This branch replaces the static prototype with a Next.js App Router application. Navigation remains **Explore ideas, Places, Saved ideas, About**. All 19 entries, their attribution, the map references, and original SVG illustrations are retained. Editorial copy remains in version control; there is no CMS or automated weekly publishing yet.

Without Supabase configuration the app supports browser-local saves and notes. With configuration and the SQL migration applied, it supports email-code sign-in and account-backed saves and notes. No hosted backend or Vercel deployment has been provisioned. This is a draft foundation, not a production launch.

## Development

Use Node 24 and pnpm 11. Install with `pnpm install`, then run `pnpm dev` and open http://127.0.0.1:3000. Localhost is a development preview on your computer, not the public hosting destination.

Development-tool installation was declined in the implementation session. Those dependencies are declared but have not been installed or locked; regenerate and commit `pnpm-lock.yaml` with `pnpm install` before merging. The checked-in lock currently covers runtime dependencies only. This draft is not release-ready until that step and the checks below pass.

- `pnpm typecheck`: TypeScript checks.
- `pnpm test`: migration and filtering tests.
- `pnpm build`: production compilation and static story generation.
- `pnpm test:e2e`: browser flows; first install Chromium with `pnpm exec playwright install chromium`.

Initial verification: the 23 source TypeScript/TSX modules compile through the installed Next SWC compiler; migration/filter unit tests pass. SWC compilation is not type checking or a production build. Browser and hosted database tests remain outstanding.

## Routes and code

- `/`: featured ideas and collection; category, theme, and search state are in the URL.
- `/stories/[slug]`: permanent story pages with metadata, saving, and notes.
- `/places`: historical/regional references, not current visitor availability.
- `/saved`: personal library, searchable by story titles and notes.
- `/about`: manifesto.
- `/account`: email-code authentication and explicit browser-library import.
- `src/content/catalog.ts`: published content and explicit featured order.
- `src/components/`: UI and library state; user text is never rendered as HTML.
- `src/lib/`: storage migration, filtering, Supabase client.
- `supabase/`: account-library schema, row-level security, story-ID seed.
- `research/`: original research references.

Existing `#ideas`, `#places`, `#saved`, and `#about` links redirect to new routes. `#main` remains a skip-to-content anchor. The legacy `commonwealth-saved` key is read for compatibility; new guest saves use `curio-library-v1`. Migration works only on the same browser origin: a new domain cannot read old local storage. Existing cloud notes take precedence during explicit account import.

## Connect Supabase

1. Create a Supabase project. Apply `supabase/migrations/202609220001_foundation.sql`, then `supabase/seed.sql` through the SQL editor or your migration runner. Neither script has been executed against a hosted project yet.
2. Enable email authentication. Configure the email template to include the OTP using `{{ .Token }}`; this UI accepts a code, not a magic-link callback. Configure a verified sender/SMTP service for public use.
3. Copy `.env.example` to `.env.local`. Set the project URL and **publishable** key. Never put a service-role/secret key in a `NEXT_PUBLIC_` variable.
4. Restart. Test sign-up, sign-in, sign-out, expiry, and import with dedicated test accounts.

The database contains published story IDs and private saved-story rows. Each row has one editable note (up to 10,000 characters), a save timestamp, and an owner. RLS restricts read/update/delete to that owner. Insert requires a published story. Browser clients cannot publish content. Editorial text is still deployed from the catalog; changing the database published flag alone does not withdraw a public page.

## Vercel preview and production

Vercel is the intended hosting option. After dependency locking and verification, import the existing GitHub repository, choose Next.js, repository root, Node 24, and `pnpm build`. Configure Supabase public environment variables separately for Preview and Production. Use a separate test Supabase project for previews. Redeploy after changing public environment variables because they are included at build time.

Connect the foundation branch to a preview first. Review desktop/mobile navigation, direct story links, saving, notes, and two-user access tests before merging. The GitHub repository URL still uses `commonwealth`; the product is Curio. No new domain or contact-address ownership is assumed.

Vercel rollback restores frontend code, not database state. Keep migrations additive, preserve seeded story IDs, and back up before destructive schema changes. Private notes must never enter static content, analytics payloads, or build logs.

## Before public accounts launch

- Run typecheck, unit tests, production build, and browser tests.
- Apply schema in a test project; verify account A cannot read, insert, change, or delete B's rows through direct API calls. Anonymous callers must have no library access; account users must not publish stories.
- Verify nonexistent/unpublished story inserts and saved-row identity changes fail.
- Verify cross-device persistence, sign-out privacy, duplicate-safe import, and preservation of existing cloud notes.
- Test failed/offline writes: show failure and retain typed text; never silently fall back from cloud to browser storage.
- Check mobile, keyboard, skip-link focus, reduced motion, and navigation with unsaved notes. Same-account concurrent edits currently use last-write-wins; version history is not implemented.
- Add account deletion/export, privacy information, verified transactional email, monitoring, backups and a restore drill.
- Reverify inherited editorial claims before public launch. This migration does not re-audit sources.

Richer profiles, an editorial CMS, drafts/revisions, scheduled publishing, and collaboration are later increments.
