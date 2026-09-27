# Developer Setup

How to get Hiraya running on your computer and deploy it. Follow the steps in order.
This guide contains **no secrets**. Never put keys or passwords in the repository, screenshots, or chats.

**Related:** full documentation → [DOCUMENTATION.md](DOCUMENTATION.md)

---

## 1. Install the tools

- [Node.js](https://nodejs.org) 20 or newer (check with `node -v`)
- [Git](https://git-scm.com)
- A code editor, e.g. [VS Code](https://code.visualstudio.com)

## 2. Get the code

```bash
git clone https://github.com/helidastar/Hiraya.git
cd Hiraya
git checkout development
npm install
```

`development` is the working branch. `main` only receives tested work through pull requests.

## 3. Set up Supabase

You can reuse the original ZAMDevs project or create a new one.

**Reusing the original project.** Free Supabase projects pause after about a week without activity. Open the [Supabase dashboard](https://supabase.com/dashboard), find the project and click **Restore** if it is paused. The tables already exist.

**Creating a new project.** Create a project at [supabase.com](https://supabase.com), then continue with step 4.

## 4. Run the database migrations

Open **SQL Editor** in Supabase and run each file in `supabase/migrations/` **in filename order**:

| File | What it does |
|---|---|
| `20250707000000_base_schema.sql` | Tables, indexes and storage buckets. Does nothing on the original project, where they already exist |
| `20250708000000_profile_display_email.sql` | Adds `display_email` to profiles |
| `20250709000000_profile_social_links.sql` | Adds social link columns to profiles |
| `20260927000000_row_level_security.sql` | **Required.** Turns on row level security so users can only reach their own data |
| `20260927000100_likes.sql` | Likes on feed posts |
| `20260927000200_feedback.sql` | Ratings and feedback from Settings |
| `20260927000300_delete_own_account.sql` | Lets users delete their account |

Every file is safe to run more than once. The row level security file ends with a query that should show `rowsecurity = true` for every table.

## 5. Configure Supabase Auth

In **Authentication → URL Configuration**:

| Setting | Value |
|---|---|
| Site URL | `http://localhost:3000` while developing, your Vercel URL once deployed |
| Redirect URLs | `http://localhost:3000/**` and `https://<your-vercel-domain>/**` |

The password reset email links to `/auth/reset-password`, which only works if that URL is allowed here.

## 6. Create `.env.local`

Copy `.env.example` to a new file named `.env.local` in the project root and fill in the values.
`.env.local` is git-ignored, so it stays on your computer.

| Variable | Where to get it | Sensitive |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key | No, but only safe with row level security on (step 4) |

Never use the `service_role` key in this app. Everything runs in the browser.

## 7. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, confirm your email, and log in.

Before pushing, check that the production build passes:

```bash
npm run build
```

## 8. Deploy to Vercel

1. Sign in to [Vercel](https://vercel.com) with GitHub and click **Add New → Project**.
2. Import `helidastar/Hiraya`. Vercel detects Next.js automatically.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Set the **Production Branch** to `main` (Settings → Git) and deploy.
5. Add the Vercel URL to Supabase Auth (step 5).

Every merge into `main` redeploys production. Other branches get preview deployments.

### Keep Supabase awake

Supabase pauses free projects after one week without activity, and the app stops working until the project is restored from the dashboard. The workflow in `.github/workflows/keep-supabase-awake.yml` prevents this by sending one small read-only query every three days. It needs two repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | same as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | same as `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

To check it works, open the **Actions** tab, pick **Keep Supabase awake** and click **Run workflow**. GitHub turns off scheduled workflows in repositories with no commits for 60 days, so the workflow re-enables itself on every run. If it ever shows as disabled, re-enable it from the same page.

## 9. Contributing

Follow the flow in [DOCUMENTATION.md → Branches](DOCUMENTATION.md#branches):

```bash
git checkout development
git pull
git checkout feat/UI          # or feat/backend, feat/docs
git merge development         # bring the branch up to date
# ...make one change...
git add <files>
git commit -m "fix(ui): short description in lowercase"
git push
```

Rules:

- **One feature or fix per commit**, using conventional commit messages: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `docs: ...`, `chore: ...`.
- Feature branches merge into `development` as merge commits titled `merge(<scope>): <summary>`.
- `development` reaches `main` through a pull request.
- No emojis in the UI, commit messages or docs.
