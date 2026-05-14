# DermaScan Node Backend

Node.js + Express version of the current Python backend.

## Setup

1. Copy `.env.example` to `.env`
2. Add `GEMINI_API_KEY`
3. Add Firebase Admin service account JSON at the path from `FIREBASE_SERVICE_ACCOUNT`
4. Install dependencies with `npm install`
5. Run `npm run dev`

## Routes

- `GET /`
- `GET /api/auth/me`
- `POST /api/auth/profile`
- `POST /api/scan/analyze`
- `GET /api/scan/history`
- `GET /api/scan/:scanId`
- `POST /api/chat/message`
- `GET /api/products`
- `GET /api/products/recommended`

## Notes

- The API shape follows the Python backend closely so Android can migrate incrementally.
- Firebase Auth still comes from the Android app; this backend verifies the Firebase ID token.
