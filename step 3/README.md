# Live Hospital Bed Monitoring Platform

This repository contains a full-stack demo: an Express.js backend using local text files as a database, and a React + Vite frontend for a hospital bed monitoring platform.

Quick start:

1. Server:

```bash
cd server
npm install
cp .env.example .env
# edit .env if needed
npm run seed
npm run dev
```

2. Client:

```bash
cd ../client
npm install
npm run dev
```

The front-end uses simple JWT stored in `localStorage` and connects to `http://localhost:4000` for APIs. All data is saved inside JSON text files in the `server/data/` folder.
