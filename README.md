# Rodando Libre — Artisan Web

Campervan rental website for **Rodando Libre** (Rolling Free in English), based in Toro, Zamora (Spain). The "warm and artisanal" of the three design variants: earth tones, serif display type, Unsplash-free imagery.

Built with Astro 6 and deployed on Netlify.

## Tech Stack

- Astro 6 with server-side rendering (`output: 'server'`)
- `@astrojs/netlify` adapter
- Vanilla CSS with custom properties (no Tailwind)
- Google Fonts: Lora (headings) and Nunito (body)
- i18n: Spanish (default) and English, JSON-based translations
- Optional Google Calendar integration for availability
- Optional Google Places integration for real reviews

## Project Structure

```text
public/
  assets/                  # Real van photos served as static files
  favicon.svg
src/
  i18n/
    es.json                # Spanish translations
    en.json                # English translations
    utils.ts               # getLangFromUrl, useTranslations, route helpers
  layouts/
    Layout.astro           # Base HTML layout, scroll-fade animations, fonts
  components/
    Header.astro           # Sticky header, hamburger menu, language switcher
    Footer.astro           # Brand, WhatsApp CTA, Instagram link
    HeroSection.astro      # Hero with real van photo and CTA
    VanIntro.astro         # Van description, specs cards, interior photo
    Equipment.astro        # 4 categories of equipment (data from van-data.json)
    Gallery.astro          # 4-photo gallery of the real van
    Testimonials.astro     # Reviews block (Google Places or mock data)
    BookingCalendar.astro  # Interactive calendar fetching /api/availability
    PriceInfo.astro        # Seasonal price cards and conditions
    ContactBlock.astro     # WhatsApp + Instagram CTAs
  lib/
    reviews.ts             # Fetches Google Places reviews, falls back to mock
  data/
    van-data.json          # Shared vehicle/equipment/pricing data
  styles/
    global.css             # Tokens, reset, typography, buttons, animations
  pages/
    index.astro            # Redirects to /es/
    es/
      index.astro          # Spanish home
      reservas.astro       # Spanish bookings
    en/
      index.astro          # English home
      bookings.astro       # English bookings
    api/
      availability.ts      # Returns availability + seasonal prices
```

## Design System

"Warm & Artisanal" theme:

| Token             | Value                |
| :---------------- | :------------------- |
| `--color-bg`      | #F5F0E8 (cream)      |
| `--color-text`    | #3D3228 (dark brown) |
| `--color-primary` | #C4653A (terracotta) |
| `--color-accent`  | #D4A843 (mustard)    |
| `--color-sage`    | #8B9E7E (sage green) |
| `--color-surface` | #EDE8DC              |

Fonts: Lora (serif headings), Nunito (sans-serif body). Border-radius 12-16px for cards, 24px for buttons. Mobile-first, breakpoints at 480px / 768px / 1024px.

## Routes

| Path                  | Description              |
| :-------------------- | :----------------------- |
| `/`                   | Redirects to `/es/`      |
| `/es/`                | Spanish home             |
| `/es/reservas`        | Spanish bookings         |
| `/en/`                | English home             |
| `/en/bookings`        | English bookings         |
| `/api/availability`   | JSON availability data   |

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you need.

| Variable                 | Purpose                                                 |
| :----------------------- | :------------------------------------------------------ |
| `GOOGLE_CALENDAR_ID`     | Calendar ID for availability (optional)                 |
| `GOOGLE_API_KEY`         | Public Google Calendar API key (optional)               |
| `GOOGLE_PLACES_API_KEY`  | Places API key for real reviews (optional)              |
| `GOOGLE_PLACE_ID`        | Google Place ID of the business (optional)              |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp number in international format, no "+" or spaces (e.g. `34722185903`) |

Without the Calendar variables, every future date appears as available with the correct seasonal price. Without the Places variables, the reviews section falls back to hardcoded mock testimonials in `src/lib/reviews.ts`.

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start local dev server at localhost:4321  |
| `npm run build`   | Build for production                      |
| `npm run preview` | Preview the production build locally      |

## Deployment

Configured for Netlify via `@astrojs/netlify`. Push to the repository and connect it to Netlify for automatic deployments. Remember to set the environment variables above in the Netlify dashboard.
