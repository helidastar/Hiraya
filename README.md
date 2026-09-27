<div align="center">

# Hiraya

**A journal that remembers how you felt**

Write daily entries, check in with your mood in one tap, and watch your month fill in from night to sunrise. A calm, private space to reflect, with a small community to share with when you want to.

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

*Hiraya* is a Filipino word for the fruit of one's hopes and dreams, as in *hiraya manawari*, "may your heart's wishes come true".

Most journaling apps are either a blank page or a long form. **Hiraya** keeps it small: pick how you feel, write a few lines if you want to, and let the days add up. Each day gets a mood color, so a month of entries reads at a glance, from deep indigo nights to bright sunrise days. Entries are private by default; you can share one with the community feed when you choose to.

## Key Features

- **Daily check-in**: pick one of thirteen moods in one tap, and add a few lines that are saved as a private journal entry
- **Journal**: write, edit and look back on entries, each with a title, date and mood
- **Mood calendar and streaks**: every day of the month in its mood color, plus your logging streak
- **Hopes**: a board for the things you hope for, from *Dreaming* to *Working on it* to *Came true*
- **Analytics**: average and most common mood for this week, this month and overall, and your mood mix over time
- **Community feed**: read entries others chose to share, and like or comment on them
- **Account**: profile picture, cover image, bio, social links, password change and account deletion

## Design

- **Day and night**: a pink-lavender dusk theme and a deep indigo night theme, with starry skies and frosted glass. It follows your device on first visit and remembers your choice after.
- **Made for phones and desktops**: a bottom tab bar with a raised check-in button on phones, and a floating side rail on tablets and desktops.
- **Gentle motion**: pages and cards ease into place, and all movement turns off for people who ask their device for reduced motion.
- **Private by default**: row level security in the database means entries, moods and hopes can only be read by their owner unless an entry is shared.

## Tech Stack

Next.js 15 (Pages Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Recharts · Supabase (PostgreSQL, Auth, Storage) · Vercel

## Getting Started

```bash
git clone https://github.com/helidastar/Hiraya.git
cd Hiraya
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Full setup, including the database and deployment, is in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Project Structure

```
src/
  pages/         Routes (Next.js Pages Router)
    auth/        Log in, sign up, log out, password reset
    dashboard/   Dashboard, journal, check-in, hopes, analytics, settings, account
  components/    Shared UI: navigation, page layout, starfield, modals, mood list and mood picker
  lib/           Supabase client, profile and mood helpers, local date helpers, motion settings
  styles/        Global CSS and theme colors (Tailwind)
supabase/
  migrations/    Database schema, row level security and functions, in run order
public/          Logo, icons and images
docs/            Documentation and screenshots
```

Work happens on `feat/<area>` branches, which merge into `development` and then `main`. See [Branches](docs/DOCUMENTATION.md#branches).

## Documentation

> **The complete project documentation is in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).**
>
> It covers the features and pages, architecture, data model, row level security, and how moods, journal entries and the feed work.

## Contributors

| Name | GitHub |
|------|--------|
| Charity Ricabo | [@helidastar](https://github.com/helidastar) |
| Aleyah Jose | [@marshmallowdevz](https://github.com/marshmallowdevz) |
| Maria Mhikyla Jayno | [@mhiksNmatch](https://github.com/mhiksNmatch) |
| Zana Capao | [@zanacapao](https://github.com/zanacapao) |
| Raffy Bonilla | [@raffybonilla](https://github.com/raffybonilla) |

<div align="center">

**CPE340 Modern Systems Analysis and Design · Cebu Institute of Technology – University** · Instructor: Engr. Mervin John C. Tampus

Built by Team ZAMDevs, 2025 · Originally [ZAMDevs-new-repo](https://github.com/marshmallowdevz/ZAMDevs-new-repo) (Reflectly, later Muni)

</div>
