# Hosted demo (separate URL)

The real site (`smartstrategiesbuilder.ai`) stays on its "Back Soon" page. A **second, separate
deployment** of this same repo serves the full app on the browser-side mock API, so people can try
it with no backend. Nothing here touches the real site's project, domain or environment.

## One-time setup in Vercel (about 2 minutes)

1. **Add New Project** → import `DowellHd/ssb-web` again (a second project from the same repo).
2. Name it something like `ssb-demo`. Its URL will be `ssb-demo.vercel.app`.
3. Open **Build & Development Settings** → turn on **Override** for **Build Command** and enter:

   ```
   npm run build:demo
   ```

   Leave everything else at the defaults (Framework: Next.js, Root Directory: `.`).
4. **Do not add any environment variables.** The demo needs none, and it ignores Sentry, PostHog and
   GA keys even if present. (`build:demo` sets the three flags itself.)
5. **Deploy.**

Optional: use a custom domain such as `demo.smartstrategiesbuilder.ai`. In the project's **Domains**
tab add it, then create the CNAME record Vercel shows at your DNS provider.

Optional: to avoid a second preview build on every pull request, set **Ignored Build Step** to
`[ "$VERCEL_GIT_COMMIT_REF" != "main" ]`.

## What `npm run build:demo` does

It builds with three flags:

| Flag | Effect |
|------|--------|
| `NEXT_PUBLIC_DEMO_MODE=true` | every API request is answered in the browser (see [DEMO_MODE.md](DEMO_MODE.md)) |
| `NEXT_PUBLIC_BACK_SOON=false` | shows the real app instead of the "Back Soon" page |
| `NEXT_PUBLIC_HOSTED_DEMO=true` | allows demo mode in a production build, and marks the site `noindex` |

The hosted demo is kept out of search engines: `robots.txt` disallows everything, the sitemap is
empty, and every page has `noindex, nofollow`. It never competes with the real site.

## Safety

`next.config.js` still fails any production build that has `NEXT_PUBLIC_DEMO_MODE=true` unless
`NEXT_PUBLIC_HOSTED_DEMO=true` is also set. So the real project cannot ship mock data by accident:
it would need someone to set that second flag on purpose. **Never set either flag on the real
project.**

## Checking a deployment

- The landing page loads (not "We'll be back soon"), and **Try It Free** opens `/app`.
- An amber **DEMO MODE — all data is simulated** banner is shown at the top of the app.
- `/robots.txt` shows `Disallow: /`.
- No sign-in is needed; any email and password also works on the login page.

## Limits

Data changes (paper orders, watchlists, journal entries) live in the browser tab and reset on
reload. Community, enterprise, backtests, fixed income, global markets and alternatives show empty
states (see DEMO_MODE.md).
