<div align="center">

# Muni

**A calm space to reflect**

A journaling and mood tracking web app. Write daily entries, log how you feel, see your patterns over time, and share selected reflections with a small community.

![Status](https://img.shields.io/badge/status-in%20testing-blue)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

**[Read the Full Documentation](docs/DOCUMENTATION.md)** · **[Developer Setup](docs/ONBOARDING.md)**

</div>

---

## About

*Muni* comes from the Filipino *muni-muni*, to reflect or ponder. The app gives each user a private journal, a daily mood log, a simple task board and an analytics view of their mood over time. Entries are private by default. Users can choose to publish an entry to the community feed, where others can like and comment on it.

Muni started in July 2025 as the ZAMDevs team project (originally named Reflectly). This repository is a fork that renames, fixes and prepares it for deployment.

## Key Features

- **Journal**: create, edit and delete entries with a title, date and mood
- **Mood tracker**: log one mood per day from a set of thirteen moods
- **Mood calendar and streaks**: see the current month and your logging streak on the dashboard
- **Analytics**: average and most common mood for today, this week, this month and overall
- **Task board**: drag-and-drop To Do, In Progress and Done columns
- **Community feed**: public entries with likes and comments
- **Account**: profile picture, header image, bio, social links, password change and account deletion
- **Light and dark mode**

## Tech Stack

Next.js 15 (Pages Router) · React 19 · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · Recharts · Framer Motion · Vercel

## Quick Start

```bash
git clone https://github.com/helidastar/Muni.git
cd Muni
git checkout development
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Full setup, including the database, is in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Project Structure

```
src/
  pages/         Routes (Next.js Pages Router)
    auth/        Login, signup, logout, password reset
    dashboard/   Dashboard, journal, mood, tasks, analytics, settings, account
  components/    Shared UI: sidebar, modals, mood list and mood picker
  lib/           Supabase client, local date helpers, mood logging
  styles/        Global CSS (Tailwind)
supabase/
  migrations/    Database schema, row level security and functions, in run order
public/          Images and icons
docs/            Documentation
```

## Branches

`feat/<area>` → `development` → `main`. See [Branches](docs/DOCUMENTATION.md#branches) for details.

## Contributors

Muni was originally built by the ZAMDevs team in July 2025 ([marshmallowdevz/ZAMDevs-new-repo](https://github.com/marshmallowdevz/ZAMDevs-new-repo)).

| Name | GitHub |
|------|--------|
| Charity Ricabo | [@helidastar](https://github.com/helidastar) |
| Aleyah Jose | [@marshmallowdevz](https://github.com/marshmallowdevz) |
| Maria Mhikyla Jayno | [@mhiksNmatch](https://github.com/mhiksNmatch) |
| Zana Capao | [@zanacapao](https://github.com/zanacapao) |
| Raffy Bonilla | [@raffybonilla](https://github.com/raffybonilla) |
