# P2P Frontend

This is the React frontend for the P2P energy trading app.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS

## Local Setup

Install dependencies:

```bash
cd /Users/NithyaSathish/Documents/winroom-demo/p2p-frontend/p2p
npm install
```

Create `.env.local`:

```env
VITE_BACKEND_URL=http://localhost:3002
VITE_BAP_URL=http://localhost:8001
VITE_PAYMENT_URL=http://localhost:8003

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Run the app:

```bash
npm run dev
```

Default dev URL:

- `http://localhost:5173`

## Backend Dependencies

The frontend expects these local services:

- BPP at `http://localhost:3002`
- BAP at `http://localhost:8001`
- Payments at `http://localhost:8003`

## Key API Usage

- seller publish and account APIs go through `VITE_BACKEND_URL`
- discovery goes through `VITE_BAP_URL`
- Razorpay order creation goes through `VITE_PAYMENT_URL`
