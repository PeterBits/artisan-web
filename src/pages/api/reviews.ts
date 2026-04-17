import type { APIRoute } from 'astro';
import { getReviews } from '../../lib/reviews';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'es';

  const data = await getReviews(lang);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Reseñas reales no cambian frecuentemente — 1h de caché, revalidación 2h
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  });
};
