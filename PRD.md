# PRD — guileite.dev personal site

> Multilingual personal developer site with an About/Contact landing page and a CRUD-managed projects showcase.
> Owner: @guileite · Status: Draft v3 · Target URL: `https://guileite.dev`

---

## 1. Summary

Personal site with **two public pages**, served in multiple languages:

- `/{locale}` — landing with about-me, contact, a suggested extra section, and a featured-projects strip.
- `/{locale}/projects` — paginated list of all projects.

Backed by a **NestJS** API that exposes a CRUD for projects. Each project has multiple images, optional repo/demo links, a manual ordering index, and **per-locale translations** for its title and description.

Static UI strings (section titles, button labels, bio paragraph, etc.) live in **JSON message files** on the frontend, one per locale.

## 2. Goals

- One coherent personal site, not two disjoint apps.
- Fast and SEO-friendly: server-rendered home and projects pages, with **localized URLs**.
- Add/edit/remove projects (and their translations) without redeploying the frontend.
- Mobile-first, accessible, dark-mode-friendly.
- Easy to add a new locale later (drop in a JSON file + run translation migrations).

## 3. Non-Goals (v1)

- Blog / articles.
- Multi-user accounts, comments, social interactions.
- In-app image upload pipeline (v1 stores image URLs only; upload is a v2 enhancement).
- Auto-translation. Translations are authored manually.

## 4. Internationalization (i18n)

### 4.1 Supported locales
- `pt-BR` — **default**
- `en`

(Adding `es` or others later is a JSON file + Prisma rows, no code change.)

### 4.2 URL strategy
- Path-based: `/pt-BR`, `/en`, `/pt-BR/projects`, `/en/projects`.
- A `[locale]` segment at the root of the App Router handles all pages.
- Middleware detects the user's preferred language on first visit (`Accept-Language`) and redirects to the matching locale; user choice is then persisted via cookie.

### 4.3 Static UI strings
- One JSON file per locale under `apps/web/messages/`:
  ```
  messages/
    pt-BR.json
    en.json
  ```
- Handled by **`next-intl`** (best fit with App Router server components).
- Example shape:
  ```json
  {
    "home": {
      "hero": { "headline": "...", "bioLine1": "...", "ctaProjects": "...", "ctaContact": "..." },
      "skills": { "title": "..." },
      "featured": { "title": "...", "seeMore": "..." },
      "contact": { "title": "...", "emailLabel": "..." }
    },
    "projects": { "title": "...", "empty": "...", "pagination": { "prev": "...", "next": "..." } },
    "common": { "switchLanguage": "..." }
  }
  ```

### 4.4 Project content
- Title and description are translated **per locale** (see data model §6).
- Language-agnostic fields (`projectUrl`, `githubUrl`, `orderIndex`, `images`) live on `Project`.
- API calls pass `?locale=` and receive the resolved translation. Missing translation → fall back to the default locale (`pt-BR`).

### 4.5 Language switcher
- Visible in the header on every page.
- Switching swaps the path prefix (`/en/projects?page=2` ↔ `/pt-BR/projects?page=2`) preserving the current route and query string.

## 5. Pages

### 5.1 `/{locale}` (Home)

Sections, in order:

1. **Hero / About**
   - Profile image (rounded, ~200–320px).
   - Name + one-line headline (e.g. *"Software developer based in São Paulo"*).
   - Short bio (~3–5 sentences).
   - Primary CTAs: **"See projects"** (→ `/{locale}/projects`) and **"Contact me"** (smooth-scrolls to contact section).

2. **Skills / Tech Stack** *(suggested extra section)*
   - Grouped chips: Languages · Frameworks · Tools · Databases.
   - Defined in code or in a small JSON file (no API endpoint needed in v1).
   - **Why this one:** strong signal for recruiters/collaborators, fills the visual gap between hero and projects, low maintenance.
   - **Alternatives if you prefer something else:** *Experience timeline*, *Now*, *Writing/Talks*, or *OSS contributions*.

3. **Featured Projects**
   - Fetched from `GET /projects/featured?limit=3&locale={locale}` (top N by `orderIndex`).
   - Card per project: cover image (first of `images[]`), title, short description, repo/demo link icons (only when present).
   - **"See more →"** button → `/{locale}/projects`.

4. **Contact**
   - Email (`mailto:`), LinkedIn, GitHub, X/Twitter — icons + labels.
   - Optional inline form (name, email, message) → `POST /contact`. Out of scope for v1 unless wanted.

5. **Footer**
   - Small print, current year, link to the site's repo, language switcher (also).

### 5.2 `/{locale}/projects`

- Paginated grid (default 9 per page = 3×3 on desktop).
- Same card shape as on home.
- Pagination control: numbered pages + prev/next, reflected in the URL (`?page=2`).
- Clicking a card opens a **modal** with full description and an image carousel. Promote to a dedicated `/{locale}/projects/[id]` route later if needed.

## 6. Tech Stack

### Frontend — Next.js
- **Next.js 14+** with **App Router**
- React 18+, **TypeScript**
- **`next-intl`** for i18n routing + message resolution in server components
- **Tailwind CSS** + **shadcn/ui** primitives (Button, Card, Dialog, Skeleton, Carousel)
- `next/image` for image optimization
- `lucide-react` for icons
- Data fetching: **React Server Components** with **ISR** (`fetch(..., { next: { revalidate: 60 } })`) so admin changes propagate within ~1 minute.

### Backend — NestJS
- **NestJS 10+**, TypeScript
- **Prisma** as ORM
- **PostgreSQL** (Neon / Supabase / Railway in prod)
- `class-validator` + `class-transformer` for DTOs
- `@nestjs/swagger` → API docs at `/docs`
- `helmet`, `@nestjs/throttler`
- **JWT** in HTTP-only cookie for admin endpoints

### Image storage
- **v1:** image URLs stored in DB; host on **Cloudflare R2** / **S3** / **Cloudinary**.
- **v2:** add `POST /admin/projects/:id/images` for direct upload.

### Hosting (suggested)
- Frontend: **Vercel**. Backend: **Fly.io** / **Railway** / **Render**.
- DB: managed Postgres (Neon, Supabase, Railway).
- Domain layout: `guileite.dev` → web, `api.guileite.dev` → NestJS.

## 7. Data Model

### `Project` (language-agnostic)

| Field         | Type                          | Notes |
|---------------|-------------------------------|-------|
| `id`          | `string (cuid)`               | PK |
| `projectUrl`  | `string (url) \| null`        | Optional — live/demo link |
| `githubUrl`   | `string (url) \| null`        | Optional — repo link |
| `orderIndex`  | `int`                         | Lower = earlier; default `0` |
| `createdAt`   | `timestamp`                   | Auto |
| `updatedAt`   | `timestamp`                   | Auto |
| `images`      | relation → `ProjectImage[]`   | One-to-many |
| `translations`| relation → `ProjectTranslation[]` | One-to-many |

### `ProjectTranslation` (per-locale content)

| Field         | Type             | Notes |
|---------------|------------------|-------|
| `id`          | `string (cuid)`  | PK |
| `projectId`   | `string (fk)`    | → `Project.id`, on delete cascade |
| `locale`      | `string`         | BCP-47 tag, e.g. `"pt-BR"`, `"en"` |
| `title`       | `string`         | ≤120 chars |
| `description` | `string`         | Plain text v1 (markdown later) |
| **Constraint**| `UNIQUE(projectId, locale)` | One translation per locale per project |

### `ProjectImage`

| Field       | Type            | Notes |
|-------------|-----------------|-------|
| `id`        | `string (cuid)` | PK |
| `projectId` | `string (fk)`   | → `Project.id`, **on delete cascade** |
| `url`       | `string`        | Required |
| `alt`       | `string`        | Optional, recommended for a11y |
| `order`     | `int`           | Position within project; `0` is the cover |

### Sorting & resolution rules
- Lists sort by `orderIndex ASC, createdAt DESC`.
- Card previews use the image where `order = 0`.
- For a requested `locale`, the API returns the matching `ProjectTranslation`; if missing, it falls back to the **default locale** (`pt-BR`). The response always includes the locale actually served, e.g. `"resolvedLocale": "pt-BR"`.

## 8. API (NestJS)

Base: `/api/v1`. JSON in/out. All public read endpoints accept `?locale=` (default `pt-BR`). Errors follow Nest's default exception filter:

```json
{ "statusCode": 400, "error": "Bad Request", "message": ["title should not be empty"] }
```

### Public

| Method | Path                       | Description |
|--------|----------------------------|-------------|
| GET    | `/projects`                | Paginated list. Query: `?page` (default 1), `?limit` (default 9, max 50), `?locale` (default `pt-BR`). Returns `{ data, meta: { page, limit, total, totalPages, locale } }`. Each item is a **flattened** project (translation merged in). |
| GET    | `/projects/featured`       | Top N by `orderIndex`. Query: `?limit` (default 3), `?locale`. |
| GET    | `/projects/:id`            | Single project with images and the resolved translation included. Query: `?locale`. |
| GET    | `/locales`                 | Returns the list of supported locales the API has data for. |
| GET    | `/health`                  | Liveness probe. |

**Flattened project response (example):**
```json
{
  "id": "ck123",
  "title": "Minha biblioteca em Go",
  "description": "Uma lib pra...",
  "projectUrl": "https://...",
  "githubUrl": "https://github.com/...",
  "orderIndex": 0,
  "resolvedLocale": "pt-BR",
  "requestedLocale": "es",
  "images": [{ "id": "...", "url": "...", "alt": "...", "order": 0 }]
}
```

### Auth

| Method | Path             | Description |
|--------|------------------|-------------|
| POST   | `/auth/login`    | Body `{ password }` → sets HTTP-only cookie |
| POST   | `/auth/logout`   | Clears cookie |
| GET    | `/auth/me`       | `{ authenticated: boolean }` |

### Admin (cookie auth required)

| Method | Path                                          | Description |
|--------|-----------------------------------------------|-------------|
| POST   | `/admin/projects`                             | Create. DTO accepts `translations: [{ locale, title, description }]` (at least one — the default locale — required) and initial `images[]`. |
| PATCH  | `/admin/projects/:id`                         | Update language-agnostic fields |
| DELETE | `/admin/projects/:id`                         | Delete (cascades images + translations) |
| PUT    | `/admin/projects/:id/translations/:locale`    | Upsert a translation for a given locale |
| DELETE | `/admin/projects/:id/translations/:locale`    | Remove a translation (cannot remove the default locale) |
| POST   | `/admin/projects/:id/images`                  | Add image `{ url, alt?, order? }` |
| PATCH  | `/admin/projects/:id/images/:imageId`         | Update image meta |
| DELETE | `/admin/projects/:id/images/:imageId`         | Remove image |
| PATCH  | `/admin/projects/reorder`                     | Bulk reorder: `{ items: [{ id, orderIndex }] }` |

### NestJS module sketch

```
apps/api/src/
  app.module.ts
  prisma/
    prisma.module.ts
    prisma.service.ts
  i18n/
    locales.ts                 # supported locales constant + default
  projects/
    projects.module.ts
    projects.controller.ts          # public reads (with locale resolution)
    projects.service.ts             # flattening + fallback logic
    admin-projects.controller.ts    # protected writes
    dto/
      create-project.dto.ts
      update-project.dto.ts
      upsert-translation.dto.ts
      paginate-query.dto.ts
      reorder.dto.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    jwt-auth.guard.ts
```

Enable global pipe: `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.

## 9. Frontend Structure (Next.js App Router)

```
apps/web/
  app/
    [locale]/
      layout.tsx               # NextIntlClientProvider, header, footer
      page.tsx                 # /{locale}
      projects/
        page.tsx               # /{locale}/projects?page=N
      not-found.tsx
  middleware.ts                # next-intl middleware: locale detection + redirect
  i18n.ts                      # next-intl config (locales, defaultLocale)
  messages/
    pt-BR.json
    en.json
  components/
    hero.tsx
    skills.tsx
    featured-projects.tsx      # server component → /projects/featured?locale=
    contact.tsx
    project-card.tsx
    project-modal.tsx
    pagination.tsx
    theme-toggle.tsx
    language-switcher.tsx
  lib/
    api.ts                     # typed fetch wrapper around API_URL
    types.ts                   # shared Project / ProjectImage / Locale types
```

- All data fetches pass the current locale, e.g.:
  ```ts
  const res = await fetch(
    `${process.env.API_URL}/projects/featured?limit=3&locale=${locale}`,
    { next: { revalidate: 60 } }
  );
  ```
- Static strings via `useTranslations()` (client) or `getTranslations()` (server).
- `<html lang={locale}>` set in `[locale]/layout.tsx`.

## 10. UX & Visual Notes

- Mobile-first; single column on phones, 2–3 column grids on tablet/desktop.
- Hero image lazy-loaded via `next/image`, sized to avoid CLS.
- Card hover: subtle lift + reveal external link icons.
- Dark mode toggle in header, persisted in `localStorage`, defaults to `prefers-color-scheme`.
- **Language switcher** in header (and footer), shows current locale, switches preserving route + query.
- Loading states: skeletons, not spinners.
- Empty states: friendly localized copy + link back home.
- Accessibility: semantic landmarks, visible focus rings, every image has `alt`, contrast AA, keyboard-navigable modal/carousel, `<html lang>` matches current locale.

## 11. Non-Functional Requirements

- **Performance:** Lighthouse ≥ 90 on `/{locale}` and `/{locale}/projects`; LCP < 2.0s on 4G.
- **SEO:**
  - Per-page localized `<title>` and `<meta description>`.
  - `<link rel="alternate" hreflang="..."/>` tags for each supported locale on every page.
  - Localized `sitemap.xml` (one entry per locale per page) and `robots.txt` via Next's Metadata API.
  - OpenGraph image (profile pic on home, first project cover on `/projects`).
- **Security:**
  - HTTPS only + HSTS.
  - JWT cookie: `HttpOnly; Secure; SameSite=Lax`.
  - Admin password as bcrypt/argon2 hash in env var.
  - CORS: only allow `https://guileite.dev`.
  - Throttle `/auth/login` (5 req/min/IP).
  - Validate every DTO; reject unknown fields.
- **Observability:** structured logs (pino), `/health`, uptime check (UptimeRobot / BetterStack).

## 12. Environment Variables

**Frontend (`apps/web`)**
```
NEXT_PUBLIC_SITE_URL=https://guileite.dev
NEXT_PUBLIC_DEFAULT_LOCALE=pt-BR
NEXT_PUBLIC_SUPPORTED_LOCALES=pt-BR,en
API_URL=https://api.guileite.dev/api/v1       # server-side fetches only
```

**Backend (`apps/api`)**
```
DATABASE_URL=postgresql://...
DEFAULT_LOCALE=pt-BR
SUPPORTED_LOCALES=pt-BR,en
JWT_SECRET=...
ADMIN_PASSWORD_HASH=...
CORS_ORIGIN=https://guileite.dev
COOKIE_DOMAIN=.guileite.dev
NODE_ENV=production
```

## 13. Acceptance Criteria

- [ ] Visiting `/` redirects to the user's preferred locale (`/pt-BR` or `/en`) based on `Accept-Language`, persisted via cookie thereafter.
- [ ] `/{locale}` renders hero, skills, **3** featured projects, contact, footer — all UI strings sourced from the correct JSON message file.
- [ ] "See more →" navigates to `/{locale}/projects`.
- [ ] `/{locale}/projects` paginates correctly; `?page=N` reflected in URL; browser back/forward works.
- [ ] Language switcher swaps `/en/...` ↔ `/pt-BR/...` preserving route and query string.
- [ ] Cards show cover image, **localized** title, **localized** short description; project/GitHub link icons appear **only** when set.
- [ ] When a project has no translation for the requested locale, it falls back to the default locale and the response indicates `resolvedLocale !== requestedLocale`.
- [ ] Admin can create a project with at least the default-locale translation; adding an `en` translation later makes it appear on `/en/...` within ~60s (ISR window).
- [ ] Cannot delete the default-locale translation (API returns 400).
- [ ] Deleting a project cascades and removes its images and translations.
- [ ] All write endpoints return **401** without auth and **400** on invalid input.
- [ ] `<html lang>` matches the current locale; `hreflang` alternates present.
- [ ] Layout works down to 360px width.

## 14. Suggested Implementation Order

1. **Monorepo scaffold** (Turborepo or pnpm workspaces): `apps/web`, `apps/api`, `packages/types` (shared interfaces incl. `Locale`).
2. **NestJS API skeleton**: Prisma schema (Project + ProjectTranslation + ProjectImage) → migration → seed 2–3 example projects with both pt-BR and en translations → public read endpoints with locale resolution → DTO validation → Swagger.
3. **Next.js shell**: `[locale]` segment, `next-intl` setup, middleware, message files for pt-BR and en, layout, header (with language switcher), footer, theme provider.
4. **Home page**: hero, skills, contact (all static strings from JSON), then wire **featured projects** via server fetch with locale param.
5. **/{locale}/projects page**: pagination + grid + modal, locale-aware fetch.
6. **Auth + admin endpoints** in NestJS; manage translations via `PUT /admin/projects/:id/translations/:locale`. Postman/curl is fine for v1.
7. **Polish**: SEO metadata + hreflang + localized sitemap, skeletons, error boundaries, deploy to Vercel + Fly.io.

## 15. Future Enhancements

- Image upload endpoint with direct R2/S3 multipart.
- Lightweight **admin UI** with side-by-side translation editor.
- Tags / technologies per project + client-side filter on `/projects`.
- Dedicated `/{locale}/projects/[id]` route with per-project OG image.
- Add `es`, `fr`, etc. — JSON file + translation rows, no code change.
- Contact form with anti-spam (Turnstile / hCaptcha).
- `/{locale}/notes` reusing the same translation pattern.
