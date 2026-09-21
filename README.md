# ESB Brand Suite — Grok Edition

A clean, modern brand studio powered primarily by **Grok** (with Gemini as optional fallback).

Cross-platform Expo app (iOS · Android · Web) + secure Vercel serverless API.

## Features

- Beautiful dark UI for creating brand briefs
- **Grok as the default AI provider**
- Optional Gemini support
- Secure server-side API keys (never exposed to the client)
- Ready for Vercel deployment

## Quick Start

```bash
npm install
cp .env.example .env
npm run web
```

## Environment Variables

### Local (`.env`)
```
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

### Vercel Project Settings
```
XAI_API_KEY=your_xai_key
XAI_MODEL=grok-3-mini
GEMINI_API_KEY=optional_gemini_key
GEMINI_MODEL=gemini-2.0-flash
```

## Deploy to Vercel

1. Import this repo in Vercel
2. Add the environment variables above
3. Deploy — the `/api/ai/brief` endpoint is automatically detected

## AI Endpoint

`POST /api/ai/brief`

```json
{
  "prompt": "A sustainable coffee brand for creative professionals",
  "provider": "grok"
}
```

Returns:
```json
{
  "provider": "grok",
  "text": "..."
}
```

---

Built with Grok · Expo · Vercel
