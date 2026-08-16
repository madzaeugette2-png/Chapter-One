# Chapter One: Frontend

A Next.js port of the Chapter One prototype, built to deploy on **Vercel** with
**WordPress** running headless as the content backend.

This mirrors the original single-file prototype almost exactly: same design
system, same 10 screens, same interactions. It's just restructured into a
real Next.js app, and the Browse Connections listings can now be pulled live
from WordPress instead of hard-coded demo data.

## Project structure

This is the full project root, ready to push to GitHub as-is:

```
package.json
next.config.js
tailwind.config.js
postcss.config.js
.gitignore
.env.local.example
app/
  layout.js         Root layout, metadata, viewport
  globals.css        Tailwind + font import
  page.js            Mounts the app at /
components/
  ChapterOneApp.js   All 10 screens (client component; same interactive SPA
                     the prototype was, nav switches sections, no full
                     page reloads)
lib/
  wordpress.js       Fetch helpers for the WordPress REST API, with graceful
                     fallback to local demo data if WordPress isn't configured
```

`app/page.js` is what Next.js and Vercel look for to confirm this is a valid
app-router project. If your build ever fails with "Couldn't find any pages
or app directory," it means Vercel is looking in the wrong folder, see the
GitHub/Vercel section below.

## Run it locally

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Without any environment variables set, the
app runs entirely on its built-in demo data, nothing else to configure to
see it working.

## Deploying via GitHub and Vercel

**1. Push this project so these files land at the repo root**, not inside a
subfolder. After unzipping, the folder you're pushing should directly
contain `package.json`, `app/`, `components/`, and `lib/` at its top level:

```bash
cd chapter-one-app        # the unzipped folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

If you instead drag the whole `chapter-one-app` folder into an existing
repo (so it sits at `your-repo/chapter-one-app/app/...`), Vercel's default
Root Directory setting (`.`) won't find `app/` and the build will fail with
"Couldn't find any pages or app directory." If you do need to keep it
nested, go to Vercel, Project, Settings, General, Root Directory and set it
to `chapter-one-app`.

**2. In Vercel:** New Project, Import your repo. Framework preset
auto-detects as **Next.js**, no build settings to change.

**3. Add the environment variable** under Settings, Environment Variables
(only needed once WordPress is live, safe to skip until then):

```
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
```

**4. Deploy.** Every push to `main` redeploys automatically; every PR gets
its own preview URL.

## Wiring up WordPress

The app treats WordPress purely as a content API, no theme, no PHP
rendering, nothing user-facing lives on the WP side.

**1. Install these plugins on your WordPress site:**
- **Custom Post Type UI**: create a post type called `connection_listing`
  (this becomes the `/wp-json/wp/v2/connection_listing` REST endpoint).
- **Advanced Custom Fields (ACF)**: add a field group to `connection_listing`
  with these fields (match these exact names):
  - `connection_type` (text: "Friendship", "Dating", "Travel Companion", etc.)
  - `tone` (text: "forest", "brown", or "gold", controls the accent color)
  - `location` (text)
  - `minimum_age` (number)
  - `requirements` (textarea, one requirement per line)
  - `nice_to_have` (textarea, one item per line)
  - `what_to_expect` (textarea)
  - `applicant_count` (number)
- **ACF to REST API**: exposes those ACF fields on the REST response as
  `post.acf.*` (this is what `lib/wordpress.js` reads).

**2. Enable CORS** on WordPress for your Vercel domain, e.g. in your theme's
`functions.php` or a small must-use plugin:

```php
add_action('rest_api_init', function () {
  header('Access-Control-Allow-Origin: https://your-app.vercel.app');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
});
```

**3. Set `NEXT_PUBLIC_WORDPRESS_API_URL`** locally (copy
`.env.local.example` to `.env.local`) and in Vercel, as shown above.

Once that's set, Browse Connections fetches real listings from WordPress on
load. If the request fails for any reason (WP down, misconfigured field,
wrong URL), the page quietly falls back to the local demo listings instead
of breaking, safe to ship even mid-setup.

**Writing back to WordPress** (submitting an application, publishing a new
listing, sending a Pen Pal message) isn't wired up yet, those still update
local component state only, same as the original prototype. `lib/wordpress.js`
includes a `submitApplication()` stub showing the pattern (a custom REST
route registered in a WP must-use plugin) if you want to extend that.

## Responsiveness

The layout is built mobile-first with Tailwind breakpoints throughout:
single-column layouts below `sm` (640px), 2-column grids from `sm`, full
grids from `md`/`lg`. The nav collapses to a hamburger menu below `lg` and
includes Apply/Sign in there too. Reduced-motion preferences are respected
globally in `globals.css`. Worth spot-checking on an actual phone (not just
a resized browser window) before launch, iOS Safari in particular handles
sticky headers and viewport units slightly differently than desktop Chrome.
