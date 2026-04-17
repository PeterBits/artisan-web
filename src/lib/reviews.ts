/**
 * Reviews — lógica compartida entre el endpoint /api/reviews
 * y el componente Testimonials (SSR, sin fetch interno).
 *
 * Fuente real: Google Places API (Places Details endpoint).
 * Fuente mock: datos hardcodeados, activa cuando faltan credenciales.
 *
 * Variables de entorno necesarias para modo real:
 *   GOOGLE_PLACES_API_KEY  — clave con Places API habilitada
 *   GOOGLE_PLACE_ID        — ID del negocio (busca en: maps.google.com → tu negocio → "Compartir" → "Place ID")
 */

export interface Review {
  author: string;
  initials: string;
  rating: number;       // 1–5
  text: string;
  relativeTime: string; // tal como lo devuelve Google: "hace 2 semanas"
}

export interface ReviewsResult {
  reviews: Review[];
  avgRating?: number;  // media global (solo en modo real)
  totalCount?: number; // nº total de reseñas (solo en modo real)
  source: 'google' | 'mock';
}

// ─── Mock ──────────────────────────────────────────────────────────────────────

const MOCK_REVIEWS: Review[] = [
  {
    author: 'María González',
    initials: 'MG',
    rating: 5,
    text: 'Experiencia increíble de principio a fin. La furgo está impecable, todo funciona a la perfección y los dueños son encantadores. Nos dieron mil consejos de rutas. Sin duda repetiremos.',
    relativeTime: 'hace 2 semanas',
  },
  {
    author: 'Carlos & Lucía',
    initials: 'CL',
    rating: 5,
    text: 'Alquilamos Lola para un fin de semana por los Arribes del Duero y fue mágico. La cama es comodísima, la cocina tiene todo lo necesario y la ducha exterior es un lujazo. 100% recomendable.',
    relativeTime: 'hace 1 mes',
  },
  {
    author: 'Tomás Reyes',
    initials: 'TR',
    rating: 5,
    text: 'Todo tal y como lo describen. Trato cercano, furgo en perfectas condiciones y un proceso de entrega muy tranquilo. Se nota que la cuidan mucho. Muy buena experiencia.',
    relativeTime: 'hace 2 meses',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toInitials(name: string): string {
  return name
    .split(/[\s&]+/)
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Google Places API ─────────────────────────────────────────────────────────

interface GoogleReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

interface GooglePlacesResponse {
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
  };
  status?: string;
}

async function fetchFromGoogle(lang: string): Promise<ReviewsResult | null> {
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  const placeId = import.meta.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return null;

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=reviews,rating,user_ratings_total` +
    `&reviews_sort=newest` +
    `&language=${lang}` +
    `&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data: GooglePlacesResponse = await res.json();
  if (data.status !== 'OK' || !data.result?.reviews?.length) return null;

  const reviews: Review[] = data.result.reviews
    .filter((r) => r.text && r.text.length > 20)
    .slice(0, 6)
    .map((r) => ({
      author: r.author_name,
      initials: toInitials(r.author_name),
      rating: r.rating,
      text: r.text,
      relativeTime: r.relative_time_description,
    }));

  return {
    reviews,
    avgRating: data.result.rating,
    totalCount: data.result.user_ratings_total,
    source: 'google',
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getReviews(lang = 'es'): Promise<ReviewsResult> {
  try {
    const real = await fetchFromGoogle(lang);
    if (real) return real;
  } catch {
    // Fall through to mock silently
  }

  return { reviews: MOCK_REVIEWS, source: 'mock' };
}
