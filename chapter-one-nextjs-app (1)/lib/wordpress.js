/**
 * Thin data layer for a headless WordPress backend.
 *
 * Point NEXT_PUBLIC_WORDPRESS_API_URL at your WP REST root, e.g.
 *   NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.chapterone.com/wp-json/wp/v2
 *
 * If the env var isn't set, or the request fails, every function here
 * resolves to `null` and the calling component falls back to the local
 * demo data built into components/ChapterOneApp.js, so the app always
 * renders something even before WordPress is wired up.
 *
 * Expected WordPress setup (see README.md for full steps):
 *   - Custom Post Type UI plugin -> post type "connection_listing"
 *   - Advanced Custom Fields plugin, fields: connection_type, tone,
 *     location, minimum_age, requirements, nice_to_have,
 *     what_to_expect, applicant_count
 *   - "ACF to REST API" plugin (or WPGraphQL if you prefer GraphQL)
 *   - CORS headers enabled on WordPress for your Vercel domain
 */

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function wpFetch(path, options = {}) {
  if (!WP_API_URL) return null;
  try {
    const res = await fetch(`${WP_API_URL}${path}`, {
      // Next.js ISR hint, only applies when called from a server component.
      next: { revalidate: 60 },
      ...options,
    });
    if (!res.ok) {
      console.error(`WordPress API error ${res.status} for ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("WordPress fetch failed:", err);
    return null;
  }
}

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").trim();
}

function mapListing(post) {
  const acf = post.acf || {};
  return {
    id: post.id,
    title: stripHtml(post.title?.rendered) || "Untitled listing",
    type: acf.connection_type || "Friendship",
    tone: acf.tone || "forest",
    location: acf.location || "Remote",
    age: Number(acf.minimum_age) || 21,
    description: stripHtml(post.excerpt?.rendered || post.content?.rendered),
    requirements: (acf.requirements || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    niceToHave: (acf.nice_to_have || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    expect: acf.what_to_expect || "",
    applicants: Number(acf.applicant_count) || 0,
  };
}

/** Fetch all published connection listings. Returns null on failure/unset. */
export async function getListings() {
  const posts = await wpFetch("/connection_listing?per_page=50&status=publish");
  if (!posts) return null;
  return posts.map(mapListing);
}

/** Fetch a single listing by its WordPress post ID. */
export async function getListingById(id) {
  const post = await wpFetch(`/connection_listing/${id}`);
  if (!post) return null;
  return mapListing(post);
}

/**
 * Submit a candidate application to WordPress.
 * Expects a custom REST route registered on the WP side, e.g. via
 * register_rest_route() in a small must-use plugin:
 *   POST /wp-json/chapter-one/v1/applications
 */
export async function submitApplication(payload) {
  if (!WP_API_URL) return { ok: false, reason: "not_configured" };
  const base = WP_API_URL.replace(/\/wp\/v2$/, "");
  try {
    const res = await fetch(`${base}/chapter-one/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok };
  } catch (err) {
    console.error("Failed to submit application:", err);
    return { ok: false, reason: "network_error" };
  }
}
