<div align="center">

# Hiraya

**A calm space to reflect**

A journaling and mood tracking web app. Write daily entries, log how you feel, see your patterns over time, and share selected reflections with a small community.

[![Status](https://img.shields.io/badge/status-live-brightgreen)](https://hiraya-green.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

**[Live Demo](https://hiraya-green.vercel.app)** · **[Read the Full Documentation](docs/DOCUMENTATION.md)** · **[Developer Setup](docs/ONBOARDING.md)**

<a href="https://hiraya-green.vercel.app">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/landing-dark.jpg">
    <img src="docs/screenshots/landing-light.jpg" alt="Hiraya landing page on desktop: the headline &quot;A journal that remembers how you felt&quot; beside a phone showing the daily mood check-in, over a starry purple sky" width="680">
  </picture>
</a>
<a href="https://hiraya-green.vercel.app">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/mobile-dark.jpg">
    <img src="docs/screenshots/mobile-light.jpg" alt="Hiraya landing page on a phone, with the navigation in a bottom tab bar" width="197">
  </picture>
</a>

</div>

---

## About

*Hiraya* is a Filipino word for the fruit of one's hopes and dreams, as in *hiraya manawari*, "may your heart's wishes come true". The app gives each user a private journal, a daily check-in, a board for their hopes and an analytics view of their mood over time. Entries are private by default. Users can choose to publish an entry to the community feed, where others can like and comment on it.

Hiraya started in July 2025 as the ZAMDevs team project (originally named Reflectly, later Muni). This repository is a fork that renames, fixes and prepares it for deployment.

## Key Features

- **Journal**: create, edit and delete entries with a title, date and mood
- **Daily check-in**: log one mood per day from a set of thirteen moods, with a few optional lines that are saved as a private journal entry
- **Mood calendar and streaks**: see the current month and your logging streak on the dashboard
- **Analytics**: average and most common mood for today, this week, this month and overall
- **Hopes**: drag-and-drop Dreaming, Working on it and Came true columns
- **Community feed**: public entries with likes and comments
- **Account**: profile picture, header image, bio, social links, password change and account deletion
- **Light and dark mode**

## Tech Stack

Next.js 15 (Pages Router) · React 19 · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · Recharts · Framer Motion · Vercel

## Quick Start

```bash
git clone https://github.com/helidastar/Hiraya.git
cd Hiraya
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
    dashboard/   Dashboard, journal, check-in, hopes, analytics, settings, account
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

Hiraya was originally built by the ZAMDevs team in July 2025 ([marshmallowdevz/ZAMDevs-new-repo](https://github.com/marshmallowdevz/ZAMDevs-new-repo)).

| | |
|---|---|
| **School** | Cebu Institute of Technology - University |
| **Course** | CPE340 Modern Systems Analysis and Design |
| **Instructor** | Engr. Mervin John C. Tampus |
| **Team** | ZAMDevs, 2025 |

| Name | GitHub |
|------|--------|
| Charity Ricabo | [@helidastar](https://github.com/helidastar) |
| Aleyah Jose | [@marshmallowdevz](https://github.com/marshmallowdevz) |
| Maria Mhikyla Jayno | [@mhiksNmatch](https://github.com/mhiksNmatch) |
| Zana Capao | [@zanacapao](https://github.com/zanacapao) |
| Raffy Bonilla | [@raffybonilla](https://github.com/raffybonilla) |
