# Supabase Storage setup (manual, one-time)

Supabase Storage buckets can't be created by a migration file — they have to
be created via the Supabase dashboard or Management API once a real project
exists. This doc is the checklist for whoever provisions that project
(Robert, or a future agent working from this repo).

There is no live Supabase project yet. Do this after `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` have been
added as Vercel env vars (see `.env.example` at the project root).

## Buckets to create

| Bucket name       | Contents                                   | Public / Private        |
|--------------------|---------------------------------------------|--------------------------|
| `property-photos`  | Uploaded/enhanced listing photos (`photos` table `storage_path`) | **Public read** |
| `flyer-pdfs`       | Exported flyer PDFs (`flyers` table `pdf_path`) | **Public read** |

Rationale: this is a demo/marketing product where the whole point of a photo
or an exported flyer is that it gets shared externally (MLS, social media,
a client's inbox, a QR code on a yard sign). Public-read buckets mean the
`url`/`pdf_url` columns can store a plain public URL with no signing/expiry
logic to build. If a truly private/paid tier is added later, switch the
relevant bucket to private and start issuing signed URLs instead — the
`url`/`pdf_url` columns are just `text`, so that change doesn't require a
schema migration, only application code.

## Steps (Supabase Dashboard)

1. Open the project → **Storage** in the left nav.
2. Click **New bucket**.
   - Name: `property-photos`
   - Public bucket: **ON**
   - Leave file size limit / MIME type restrictions at defaults for now (can
     be tightened later to image types only, e.g. `image/jpeg`, `image/png`,
     `image/webp`).
3. Click **New bucket** again.
   - Name: `flyer-pdfs`
   - Public bucket: **ON**
   - MIME type restriction can be set to `application/pdf` once confirmed
     working.
4. No RLS storage policies are needed yet since both buckets are public-read
   and there's no authenticated-user model to scope uploads to (see the RLS
   TODO note at the top of `supabase/migrations/0001_init.sql`). Once real
   auth exists, add storage policies restricting `insert`/`update`/`delete`
   to authenticated users (uploads), while keeping `select` public.

## Steps (equivalent via Supabase CLI / Management API, if preferred)

```bash
supabase storage buckets create property-photos --public
supabase storage buckets create flyer-pdfs --public
```

(Requires the Supabase CLI to be linked to the project — `supabase link`.)

## After buckets exist

No application code changes are needed to start using them — `photos.storage_path`
and `flyers.pdf_path` already store the bucket-relative object path, and
`photos.url` / `flyers.pdf_url` store the resulting public URL
(`<SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>`). Upload logic
(building the Flyer Generator UI, wiring photo upload) is out of scope for
this scaffolding pass — see the follow-up Flyer Generator UI task.
