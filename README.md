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

**Deep Relationship Exploration:** Recursively crawls the Tenrai API to build comprehensive series maps, uncovering distant spin-offs and shared universes.

**Smart Deferred Loading:** Automatically detects and defers loading of "border" nodes (like character crossovers or minor references), preventing graph clutter and optimizing load times.

**Local Cache:** Local caching shortens revisit load times by 99%+, allowing users to explore and refresh without waiting for third-party API rate limits.

**Filtering:** Filter by category (anime or manga) or media type (TV, Movie, OVA, etc.), and NSFW content.

---

## 🛠️ Tech Stack

React was chosen for the powerful Reagraph library, while Go was chosen for its performance and ease of deployment, especially with thin APIs.

### Frontend
-   **Framework:** React/TypeScript
-   **Visualization:** [Reagraph](https://reagraph.dev/) (WebGL graph engine)
-   **Styling:** Raw CSS with variables for easy theming
-   **Build Tool:** Vite

### Backend
-   **Language:** Go
-   **Routing:** Standard library `net/http`

### Infrastructure & Deployment
-   **Containerization:** Docker & Docker Compose
-   **Reverse Proxy:** Caddy (Automated HTTPS/SSL via Let's Encrypt)

---

## ⚙️ Interesting Engineering Challenges

### 1. Navigating Rate Limits
The Tenrai API has strict rate limits. To provide a seamless experience when building large graphs, the frontend implements a **global request queue**.
-   **Sequential Processing:** All Tenrai requests are funneled through a singleton runner that enforces a 1-second delay between calls.
-   **Retry logic:** If a `429 Too Many Requests` is encountered, the request is automatically pushed back to the front of the queue for immediate retry after the next delay.
-   **Abortable Requests:** React's `AbortController` is integrated throughout the graph building process, ensuring that if a user navigates away or starts a new search, all pending background requests are immediately cancelled.

### 2. Preventing "Graph Explosion" (Lazy Loading)
Anime series can have hundreds of loose relations (e.g., a character appearing in a minor spin-off). For some shows, especially older ones, this can result in massive graphs. Instead, the graph only eagerly loads media that are probably in the core series and the user must choose to extend beyond that.
-   **Likely Crossover Detection:** Relationships marked as "Character" or "Other" are treated as "border" nodes.
-   **Deferred Loading:** Instead of fetching these nodes immediately, AniMap renders them as simplified "placeholder" nodes.
-   **Manual Expansion:** Users can click these border nodes to explicitly trigger a fetch, giving them control over the graph's depth and focus.

### 3. High-Performance Texture Loading
Loading all the node images into the graph at the same time overwhelms the browser's request queue and is prohibitively slow. Instead, textures are fetched and loaded asynchronously in a queue which the browser can handle much more easily.

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

---

## 🚀 Deployment

The application is containerized and ready for deployment using Docker Compose and Cloudflare Tunnels.

### 1. Prerequisites
-   [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
-   [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)

### 2. Configuration
Navigate to the `deploy` directory:
```bash
cd deploy
cp .env.dist .env
```
Update the `.env` file with your production values, specifically `SITE_DOMAIN`, `TUNNEL_TOKEN`, and your MyAnimeList credentials.

### 3. Launch
Start the containers in detached mode:
```bash
docker compose up -d
```
Cloudflare will handle all the TLS termination and routing for you.
