# TODO: Migrar autenticación de Google Calendar a Service Account (Authorization Bearer)

## Contexto

Actualmente `src/pages/api/availability.ts` autentica contra Google Calendar API pasando la API Key como query param en la URL:

```ts
const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/${...}/events?key=${apiKey}&...`;
const gcalResponse = await fetch(gcalUrl);
```

**Problema**: la key viaja en la URL. Aunque el fetch se hace server-side (Netlify Function), la URL puede acabar en:
- Logs de Netlify Functions (si se añade `console.log` o un logger)
- Stack traces de errores de red
- Logs de Google o proxies intermedios

**Alternativa más robusta**: usar un Service Account y enviar la credencial como `Authorization: Bearer <token>` en un header. Así la credencial no aparece nunca en la URL. Es el mismo enfoque que ya usa el proyecto MINIMALISTA.

## Objetivo

Sustituir el patrón `?key=API_KEY` por autenticación con Service Account + header `Authorization: Bearer <access_token>` en el endpoint de disponibilidad de CERCANA Y ARTESANAL.

## Tareas

### 1. Crear Service Account en Google Cloud
- [ ] Ir a https://console.cloud.google.com/ → IAM & Admin → Service Accounts
- [ ] Crear nuevo Service Account (nombre sugerido: `cercana-calendar-reader`)
- [ ] Generar clave JSON y descargarla
- [ ] Compartir el Google Calendar con el email del Service Account (permiso "Ver todos los detalles del evento")

### 2. Configurar env vars nuevas
- [ ] Añadir a `.env.example`:
  ```
  GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  ```
- [ ] Añadir las mismas variables en el dashboard de Netlify (Site settings → Environment variables)
- [ ] **IMPORTANTE**: la `GOOGLE_PRIVATE_KEY` debe mantener los `\n` literales escapados
- [ ] Mantener temporalmente `GOOGLE_CALENDAR_ID` (sigue siendo necesario)
- [ ] Eliminar `GOOGLE_API_KEY` **solo después** de verificar que la nueva auth funciona

### 3. Instalar dependencia
- [ ] `npm install googleapis` (misma lib que usa MINIMALISTA)

### 4. Refactorizar `src/pages/api/availability.ts`
- [ ] Replicar el patrón de `MINIMALISTA/src/pages/api/availability.ts:21-47`:
  ```ts
  const { google } = await import('googleapis');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId,
    timeMin: startDate,
    timeMax: endDate,
    singleEvents: true,
    orderBy: 'startTime',
  });
  ```
- [ ] Eliminar el fetch manual con API key en URL
- [ ] Mantener el mismo formato de respuesta JSON (`{ year, month, days }`) para no romper el frontend

### 5. Probar localmente
- [ ] `npm run dev` y verificar que `/api/availability?year=2026&month=5` devuelve datos reales
- [ ] `npm run build` sin errores
- [ ] Verificar que el bundle de la function no supera 50 MB (límite Netlify)

### 6. Deploy y verificación en Netlify
- [ ] Push a GitHub, esperar deploy
- [ ] Probar en producción: calendario de `/es/reservas` marca días ocupados correctamente
- [ ] Revisar logs de Netlify Functions por si hay errores de auth

### 7. Limpieza final
- [ ] Eliminar `GOOGLE_API_KEY` del dashboard de Netlify
- [ ] Eliminar `GOOGLE_API_KEY` de `.env.example`
- [ ] **Borrar la API Key antigua** en Google Cloud Console (o al menos rotarla)

### 8. (Opcional) Aplicar el mismo patrón a `/api/reviews`
- [ ] `src/lib/reviews.ts:89-95` también usa `?key=${apiKey}` en la URL de Places API
- [ ] Considerar si merece la pena — Places API **no soporta Service Account auth**, así que habría que mover a OAuth2 o dejarlo con restricciones estrictas de API key en Google Cloud Console

## Criterios de éxito

- La API key de Google Calendar ya no aparece en ninguna URL del código
- El endpoint `/api/availability` funciona igual que antes desde la perspectiva del frontend
- La credencial del Service Account solo se transmite en el header `Authorization: Bearer <token>` (gestionado internamente por `googleapis`)
- `GOOGLE_API_KEY` ya no existe ni en código, ni en env vars, ni en Google Cloud

## Referencias

- Implementación de referencia: `../MINIMALISTA/src/pages/api/availability.ts`
- Docs de `googleapis`: https://github.com/googleapis/google-api-nodejs-client
- Google Service Accounts: https://cloud.google.com/iam/docs/service-account-overview
