# Geo Object Mapper — Frontend

Interactive geographic object and polygon management SPA built as a **React 19 + TypeScript + Vite modular monolith** using **MUI v7** (Flexbox + theme tokens, zero custom `.css` files), **Zustand v5**, **React Router v7**, **Axios**, and **Leaflet / React-Leaflet**.

---

## Architecture & Vertical Slices

Every business domain lives under `src/modules/<domain>/` with the same one-way layers: `view → hook → provider → repository → api`.

```text
src/
├── main.tsx                        Bootstrap and stale-chunk guard
├── App.tsx                         Theme, router and snackbar
├── config/
│   ├── env/                        Sole reader of import.meta.env
│   ├── theme/                      Light and dark MUI themes and map tokens
│   ├── store/                      @stores barrel and createEntityStore factory
│   └── router/                     Data router, RootGuard and RouteError
└── modules/
    ├── shared/                     BaseRepository, BaseCrudProvider, httpClient and shared UI
    ├── polygons/                   Panel 2: drawing, store, repository and CRUD hook
    ├── objects/                    Panel 3: symbols, store, repository and CRUD hook
    └── map/                        Panel 1 (map), Panel 4 (Map Data) and workspace layout
```

---

## Backend contract

`httpClient` calls the API at `VITE_API_BASE_URL`, which defaults to `http://localhost:5000/api`. See `.env.example` for the available settings and the root README for the endpoints.

---

## Scripts

```bash
npm run dev          # Start Vite dev server
npm run type-check   # Strict TypeScript check
npm run lint         # ESLint check
npm test             # Vitest unit and component tests
npm run build        # Production bundle
```
