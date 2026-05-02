<h1 style="color: #eef1f7; font-size: 2.5rem">Ani<span style="color: #8ca8ff">Map</span></h1>

Visualize anime series, watch order, and spin-off relationships.

**[Try it Live!](https://animap.itsbraeden.dev)**

---

## 💬 Description

AniMap is a full-stack web application designed to help anime and manga enthusiasts visualize complex series relationships. By transforming linear lists into interactive, multi-dimensional graphs, AniMap provides immediate clarity on watch orders, spin-off branches, and shared universes.

---

## ✨ Features

**Interactive Graph Visualization:** Explore anime/manga relations (prequels, sequels, spin-offs) using a performant 2D graph canvas powered by `reagraph`.

**MyAnimeList Integration:** Secure OAuth2 authentication allowing users to sync their personal lists and track progress directly on the graph.

**Filtering:** Filter by category (anime or manga) or media type (TV, Movie, OVA, etc.), and NSFW content.

**Smart Graph Trimming:** Detects and defers loading of nodes likely to be outside the series, shortening load times and giving users more control.

**Local Cache:** Local caching shortens revisit load times by 99%+, allowing users to explore and refresh without waiting for third-party API rate limits.

**High-Performance Backend:** A Go-based API server handling secure proxying to the MAL API and managing authentication sessions.

---

## 🛠️ Tech Stack

React was chosen for the powerful Reagraph library, while Go was chosen for its performance and ease of deployment, especially with thin APIs.

### Frontend
-   **Framework:** React/TypeScript
-   **Visualization:** Reagraph (WebGL-based graph rendering)
-   **Styling:** Raw CSS with variables for easy theming
-   **Build Tool:** Vite

### Backend
-   **Language:** Go
-   **Routing:** Standard library `net/http` (leveraging modern `ServeMux` features)

---

## ⚙️ Architecture & Insights

The application recursively fetches data from the Jikan API (unofficial MAL API) to build a directed graph. It intelligently handles complex relations and avoids redundant fetches using a queue-based expansion strategy. In rate-limit downtime, the proxy is used to fetch node images from MyAnimeList and load them into textures for Reagraph.

Two notable engineering challenges:

**Secure Proxying:** To bypass CORS limitations and keep MAL Client Secrets secure, the Go backend acts as a transparent proxy for authenticated MAL API requests.

**Rate Limiting and Queueing:** Rate limiting and queueing on the frontend allows users to avoid third-party rate limits on large graphs.

---

## 💻 Local Setup

### Prerequisites
-   [Go](https://go.dev/doc/install) (1.25 or later)
-   [Node.js](https://nodejs.org/) (v24+)
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
go run .
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
