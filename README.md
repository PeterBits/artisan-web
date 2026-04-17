# Lola Camper

Campervan rental website for Lola, a Volkswagen Transporter T5 based in Toro, Zamora (Spain). Built with Astro 6 and deployed on Vercel.

## Tech Stack

- **Astro 6** with server-side rendering (`output: 'server'`)
- **@astrojs/vercel** adapter for Vercel deployment
- **Vanilla CSS** with custom properties (no Tailwind, no CSS libraries)
- **Google Fonts**: Lora (headings) + Nunito (body)
- **i18n**: Spanish (default) + English, file-based with JSON translation files

## Project Structure

```text
src/
  i18n/
    es.json              # Spanish translations
    en.json              # English translations
    utils.ts             # i18n helpers (getLangFromUrl, useTranslations, etc.)
  layouts/
    Layout.astro         # Base HTML layout with header, footer, scroll animations
  components/
    Header.astro         # Sticky header with nav, hamburger menu, language switcher
    Footer.astro         # Footer with brand, WhatsApp, Instagram links
    HeroSection.astro    # Hero with van image, title, CTA
    VanIntro.astro       # Van description + specs grid
    Equipment.astro      # 4-category equipment cards
    Destinations.astro   # Nearby destination cards with images
    Testimonials.astro   # Placeholder for future reviews
    BookingCalendar.astro # Interactive calendar (vanilla JS, fetches /api/availability)
    PriceInfo.astro      # Seasonal price cards + conditions
    ContactBlock.astro   # WhatsApp + Instagram CTA block
  styles/
    global.css           # CSS custom properties, reset, typography, buttons, animations
  pages/
    index.astro          # Redirects to /es/
    es/
      index.astro        # Spanish home page
      reservas.astro     # Spanish bookings page
    en/
      index.astro        # English home page
      bookings.astro     # English bookings page
    api/
      availability.ts    # Server endpoint: returns calendar availability + prices
```

## Design System

"Warm & Artisanal" theme:

| Token             | Value                              |
| :---------------- | :--------------------------------- |
| `--color-bg`      | #F5F0E8 (cream)                    |
| `--color-text`    | #3D3228 (dark brown)               |
| `--color-primary` | #C4653A (terracotta)               |
| `--color-accent`  | #D4A843 (mustard)                  |
| `--color-sage`    | #8B9E7E (sage green)               |
| `--color-surface` | #EDE8DC (card backgrounds)         |

Fonts: Lora (serif headings), Nunito (sans-serif body). Border-radius: 12-16px cards, 24px buttons. Mobile-first responsive design.

## Routes

| Path          | Description               |
| :------------ | :------------------------ |
| `/`           | Redirects to `/es/`       |
| `/es/`        | Spanish home              |
| `/es/reservas`| Spanish bookings          |
| `/en/`        | English home              |
| `/en/bookings`| English bookings          |
| `/api/availability` | JSON availability data |

## Google Calendar Integration

The `/api/availability` endpoint optionally connects to Google Calendar to show reserved dates. Set these environment variables:

```
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_API_KEY=your_api_key
```

Without these, all dates appear as available with correct seasonal pricing.

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start local dev server at localhost:4321  |
| `npm run build`   | Build for production                      |
| `npm run preview` | Preview production build locally          |

## Deployment

Configured for Vercel with `@astrojs/vercel` adapter. Push to your repository and connect to Vercel for automatic deployments.
