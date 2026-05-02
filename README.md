# AniMap

**AniMap** is a full-stack web application designed to help anime and manga enthusiasts visualize complex series relationships. By transforming linear lists into interactive, multi-dimensional graphs, AniMap provides immediate clarity on watch orders, spin-off branches, and shared universes.

---

## 🚀 Key Features

-   **Interactive Graph Visualization:** Explore anime/manga relations (prequels, sequels, spin-offs) using a performant 3D/2D graph canvas powered by `reagraph`.
-   **MyAnimeList (MAL) Integration:** Secure OAuth2 authentication allowing users to sync their personal lists and track progress directly on the graph.
-   **Dynamic Discovery:** Click-to-expand nodes to discover connected series on the fly without losing context.
-   **Intelligent Filtering:** Filter by media type (TV, Movie, OVA, etc.), exclude NSFW content, and search for specific titles within a series cluster.
-   **High-Performance Backend:** A Go-based API server handling secure proxying to the MAL API and managing authentication sessions.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework:** React 18+ with TypeScript
-   **Build Tool:** Vite
-   **State Management:** React Context API (custom providers for Auth, Search, and MAL Integration)
-   **Visualization:** Reagraph (WebGL-based graph rendering)
-   **Styling:** Modern CSS with variables for easy theming

### Backend
-   **Language:** Go (1.25+)
-   **Routing:** Standard library `net/http` (leveraging modern `ServeMux` features)
-   **Security:** OAuth2 flow with PKCE-like security, HTTP-only cookies for session management
-   **Environment:** `godotenv` for configuration

---

## 🏗️ Architecture & Insights

### For Fellow Programmers

-   **Graph Building Algorithm:** The application recursively fetches data from the Jikan API (unoffical MAL API) to build a directed graph. It intelligently handles complex relations and avoids redundant fetches using a queue-based expansion strategy.
-   **Secure Proxying:** To bypass CORS limitations and keep MAL Client Secrets secure, the Go backend acts as a transparent proxy for authenticated MAL API requests.
-   **Hybrid State:** The app manages a complex hybrid of local UI state, cached graph data, and synchronized remote list data from MAL.
-   **Modern Idioms:** The Go backend follows modern Go 1.25 standards, and the frontend utilizes functional components with custom hooks for clean separation of concerns.

---

## 💻 Local Setup

### Prerequisites
-   [Go](https://go.dev/doc/install) (1.25 or later)
-   [Node.js](https://nodejs.org/) (v18+)
-   MyAnimeList API Client ID/Secret (obtainable via [MAL API Panel](https://myanimelist.net/apiconfig))

### 1. Clone the Repository
```bash
git clone https://github.com/braedensmith29/animap.git
cd animap
```

### 2. Backend Configuration
Navigate to the `api` directory and set up your environment:
```bash
cd api
cp .env.dist .env
```
Fill in your `MAL_CLIENT_ID`, `MAL_CLIENT_SECRET`, and `MAL_REDIRECT_URI` in `.env`.

### 3. Start the Backend
```bash
go run main.go
```
The API server will start on `http://localhost:8080`.

### 4. Frontend Configuration & Start
In a new terminal, navigate to the `ui` directory:
```bash
cd ui
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`. Vite is configured to proxy `/api` and `/auth` requests to the Go backend.

---

## 📝 Roadmap / Placeholders

-   [ ] **[FEATURE]** User-defined custom nodes and relations.
-   [ ] **[ENHANCEMENT]** Mobile-responsive UI for the graph canvas.
-   [ ] **[VISUAL]** [Add screenshot of the graph visualization here]
-   [ ] **[LINK]** [Live Demo Link]

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Created by [Your Name/Handle] – feel free to connect!*
