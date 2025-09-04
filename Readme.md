# Data Table Challenge

A full-stack web application with data table functionality, search, sorting, and pagination.

## Live Demo

- **Frontend**: https://data-table-challenge.vercel.app
- **Backend API**: https://data-table-challenge-1.onrender.com

## Tech Stack

**Backend**: Node.js, Express, TypeScript, Joi validation
**Frontend**: React, TypeScript, Vite, Tailwind CSS

## Deployment

**Backend** (Render):
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Root Directory: `Challenge1-data-table/backend`

**Frontend** (Vercel):
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `Challenge1-data-table/frontend`

## Local Development

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/users` - Get paginated users with search and sorting
- `POST /dev/seed` - Generate test data
- `GET /health` - Health check

## Environment Variables

Backend:
```
PORT=3001
COR_ORIGIN=https://data-table-challenge.vercel.app
```

Frontend:
```
VITE_API_BASE_URL=https://data-table-challenge-1.onrender.com
```
