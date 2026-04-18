# Sahej

Sahej is a hackathon project with two apps:

- `frontend-sahej` (Expo Router + React Native + TypeScript)
- `backend-api` (Node.js + TypeScript + Express)

## Core Demo Flow

Home -> Reflect -> Result

- User enters a thought on Home.
- Reflect runs a 3-second stillness lock.
- If stillness is maintained, app calls backend `POST /reflect`.
- Result shows emotional mirror response with haptics/theme behavior.

## Calm Intervention Note

If the **"Calm down"** screen appears, it means the phone movement crossed the stillness threshold (for example, shaking from hand trembling).  
This is intentional: Sahej resets the countdown to help the user pause and regain stillness before continuing.

## Backend Setup (`backend-api`)

```bash
cd backend-api
npm install
npm run dev
```

Default API runs on:

- `http://localhost:3001`

Required endpoints:

- `GET /health`
- `POST /reflect`

## Frontend Setup (`frontend-sahej`)

```bash
cd frontend-sahej
npm install
npx expo start
```

Make sure frontend `.env` points to backend root origin (no route suffix):

```env
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LOCAL_IP>:3001
```

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.5.45:3001
```

## Demo Reliability

- Reflection has deterministic fallback behavior when external AI enrichment is unavailable.
- Journal/history, notes, graph, and emotion views are local-first for demo stability.
