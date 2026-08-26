# Full-Stack Typing Speed Game Application

> **Burdenoff Product Engineering Intern Take-Home Project**  
> *Author:* Software Engineer | *Date:* August 2026

An interactive, high-performance full-stack web application designed to evaluate and improve typing dexterity by completing 20-character randomized alphabet sequences under real-time constraints with penalty calculations.

---

## 🚀 Technical Stack & Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                 Next.js 14+ SPA (Frontend)                  │
 │ ┌───────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
 │ │ Keyboard Focus    │ │ 20-Char Game    │ │ LocalStorage  │ │
 │ │ Listener Engine   │ │ Canvas          │ │ PB Cache      │ │
 │ └───────────────────┘ └─────────────────┘ └───────────────┘ │
 └──────────────────────────────┬──────────────────────────────┘
                                │ GraphQL HTTP API + JWT Bearer
 ┌──────────────────────────────▼──────────────────────────────┐
 │              Bun + GraphQL Yoga Backend Server              │
 │ ┌───────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
 │ │ JWT & bcrypt      │ │ Game Logic      │ │ Leaderboard   │ │
 │ │ Auth Resolvers    │ │ Validation      │ │ Resolvers     │ │
 │ └───────────────────┘ └─────────────────┘ └───────────────┘ │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Prisma ORM
 ┌──────────────────────────────▼──────────────────────────────┐
 │                    PostgreSQL 16 Database                   │
 └─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React / Next.js (TypeScript), Tailwind CSS with glassmorphism aesthetics, keyboard listeners, real-time timer, and local caching.
- **Backend**: Bun + TypeScript, GraphQL Yoga server, JWT authentication, and input validation.
- **Database & ORM**: PostgreSQL 16 + Prisma ORM (Relational `User` and `GameResult` entities with 1-to-N cascade deletion).
- **Infrastructure**: Docker & Docker Compose containerized multi-service deployment.

---

## 🎮 Game Lifecycle & Mechanics

1. **Initialization**: User authenticates and opens dashboard. Client retrieves Personal Best score from `localStorage` and backend.
2. **Game Start**: User clicks **Start Game**. System generates 20 random alphabets `[a-z]`, initializes timer at `0.00s`, and programmatically locks keyboard focus.
3. **Gameplay Loop**: System validates pressed keys against active target character.
   - **Correct key**: Advances cursor pointer (`10/20`).
   - **Incorrect key**: Incurs an immediate **+0.5s penalty** added to total score, increments wrong attempt counter, and holds focus until the correct target key is pressed.
4. **Completion & Scoring**: Upon completing the 20th character, the timer stops.  
   $$\text{Final Score} = \text{Raw Duration (seconds)} + (\text{Wrong Attempts} \times 0.5\text{s})$$
5. **Evaluation & Persistence**: Compares final score with local PB. Displays **Success (New Record!)** or **Try Again** banner. Transmits result asynchronously to GraphQL `saveGameResult` mutation.

---

## 📋 GraphQL API Specification

| Operation | Name | Description |
|---|---|---|
| Mutation | `register(input)` | Registers new user; returns JWT token + user. |
| Mutation | `login(input)` | Authenticates credentials; returns JWT token + user. |
| Mutation | `saveGameResult(input)` | Records game statistics (`rawDuration`, `wrongAttempts`). |
| Query | `me` | Retrieves active user profile details. |
| Query | `getUserGameHistory` | Returns historical game results for active user. |
| Query | `getUserBestScore` | Returns user's top personal score. |
| Query | `getLeaderboard` | Returns global leaderboard ranked ascending by total score. |

---

## 🛠️ Quick Start & Setup Instructions

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) installed
- [Bun](https://bun.sh/) or [Node.js v18+](https://nodejs.org/) installed

### Option A: Running via Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd typing-speed-game

# 2. Start PostgreSQL and Backend services
docker-compose up --build -d

# 3. Apply Prisma migrations inside backend container
docker-compose exec backend bunx prisma migrate dev --name init

# 4. Start Frontend
cd frontend
npm install
npm run dev
```

The services will be accessible at:
- **Frontend App**: `http://localhost:3000`
- **GraphQL Yoga API & GraphiQL Explorer**: `http://localhost:4000/graphql`
- **PostgreSQL Database**: `localhost:5432`

---

### Option B: Local Development Setup (Manual)

```bash
# 1. Setup Backend
cd backend
npm install   # or bun install
cp .env.example .env

# Run Prisma schema generation and migrations
npx prisma generate
npx prisma migrate dev --name init

# Start GraphQL Yoga Backend
npm run dev   # or bun run start:dev

# 2. Setup Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testing Strategy

Run unit & integration test suites verifying sequence generation, focus locks, score penalty arithmetic (+0.5s per error), and JWT authentication:

```bash
# Run Backend Tests (Score arithmetic & JWT auth)
cd backend
npm test

# Run Frontend Tests (Sequence generator & score math)
cd frontend
npm test
```

---

## 📄 Deliverables

- `SRS_Implementation_Summary.pdf`: PDF report detailing exact SRS requirement mapping.
- `typing-speed-game.zip`: Downloadable project archive containing all source files.
"# typing-speed-game" 
