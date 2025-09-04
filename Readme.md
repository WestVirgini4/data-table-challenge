### Backend Setup

```bash
cd backend
npm init -y
npm install express cors helmet express-rate-limit compression joi
npm install -D nodemon typescript @types/node @types/express ts-node jest @types/jest eslint prettier

# Create tsconfig.json, .env.example
# Add to package.json scripts:
"dev": "nodemon --exec ts-node server.ts"
"test": "jest"
"lint": "eslint . --ext .ts"
```

### Frontend Setup

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom vitest jsdom eslint prettier

# Add to package.json scripts:
"dev": "vite"
"build": "vite build"
"test": "vitest"
"lint": "eslint . --ext .ts,.tsx"
```

### Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📦 Additional Files Required

- `.env.example` (backend and frontend)
- `tsconfig.json` (backend and frontend)
- `.editorconfig`
- `eslint.config.js`
- `prettier.config.js`
- `postman-collection.json` or `openapi.yaml`
- Unit test files with Jest/Vitest
- GitHub Actions CI script
