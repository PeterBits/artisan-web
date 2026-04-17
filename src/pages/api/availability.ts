import type { APIRoute } from 'astro';

interface CalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
}

interface CalendarResponse {
  items?: CalendarEvent[];
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') || String(new Date().getMonth() + 1));

  const getPriceForDate = (date: Date): number => {
    const m = date.getMonth() + 1;
    if (m === 7 || m === 8) return 95;
    if (m === 6 || m === 9) return 80;
    return 65;
  };

  try {
    const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
    const apiKey = import.meta.env.GOOGLE_API_KEY;

    let reservedDates: string[] = [];

    if (calendarId && apiKey) {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

      const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`;

      const gcalResponse = await fetch(gcalUrl);
      if (gcalResponse.ok) {
        const gcalData: CalendarResponse = await gcalResponse.json();
        for (const event of gcalData.items || []) {
          const start = new Date(event.start.date || event.start.dateTime || '');
          const end = new Date(event.end.date || event.end.dateTime || '');
          const current = new Date(start);
          while (current < end) {
            reservedDates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        }
      }
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Record<string, { status: 'available' | 'reserved'; price?: number }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dateStr = date.toISOString().split('T')[0];
      const isReserved = reservedDates.includes(dateStr);

      days[dateStr] = {
        status: isReserved ? 'reserved' : 'available',
        price: isReserved ? undefined : getPriceForDate(date),
      };
    }

    return new Response(JSON.stringify({ year, month, days }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch availability' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
