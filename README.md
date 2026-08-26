# Full-Stack Typing Speed Game Application

**Burdenoff Product Engineering Intern: Take-Home Project**

An interactive, high-performance full-stack web application designed to evaluate and improve typing speed and accuracy by completing randomized 20-character alphabet sequences under real-time constraints with configurable penalty calculations.

---

## Technical Stack and Architecture

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                 Next.js 14+ SPA (Frontend)                  │
 │ ┌───────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
 │ │ Keyboard Focus    │ │ 20-Character    │ │ LocalStorage  │ │
 │ │ Listener Engine   │ │ Game Interface  │ │ PB Cache      │ │
 │ └───────────────────┘ └─────────────────┘ └───────────────┘ │
 └──────────────────────────────┬──────────────────────────────┘
                                │ GraphQL HTTP API + JWT Bearer
 ┌──────────────────────────────▼──────────────────────────────┐
 │              Bun + GraphQL Yoga Backend Server              │
 │ ┌───────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
 │ │ JWT and bcrypt    │ │ Game Logic      │ │ Leaderboard   │ │
 │ │ Authentication   │ │ and Validation  │ │ Resolvers     │ │
 │ └───────────────────┘ └─────────────────┘ └───────────────┘ │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Prisma ORM
 ┌──────────────────────────────▼──────────────────────────────┐
 │                    PostgreSQL 16 Database                   │
 └─────────────────────────────────────────────────────────────┘
```

### Frontend

* React and Next.js with TypeScript
* Tailwind CSS with a glassmorphism-based interface
* Keyboard event handling and focus management
* Real-time game timer
* Client-side personal-best caching using `localStorage`

### Backend

* Bun and TypeScript
* GraphQL Yoga API server
* JWT-based authentication
* bcrypt password hashing
* Input validation and game-state validation

### Database and ORM

* PostgreSQL 16
* Prisma ORM
* Relational `User` and `GameResult` models
* One-to-many relationship between users and game results
* Cascade deletion for associated game results

### Infrastructure

* Docker and Docker Compose
* Multi-service containerized deployment

---

## Game Lifecycle and Mechanics

1. **Initialization**
   The user authenticates and opens the dashboard. The client retrieves the personal-best score from `localStorage` and the backend.

2. **Game Start**
   The user selects **Start Game**. The system generates a sequence of 20 random lowercase alphabetic characters, initializes the timer at `0.00s`, and programmatically establishes keyboard focus.

3. **Gameplay Loop**
   Each keyboard input is validated against the currently active target character.

   * A correct key advances the cursor to the next character.
   * An incorrect key adds a `0.5s` penalty to the final score, increments the wrong-attempt counter, and keeps the game focused on the current target character.

4. **Completion and Scoring**
   After the 20th character is entered, the timer stops and the final score is calculated as:

   \(\text{Final Score} = \text{Raw Duration (seconds)} + (\text{Wrong Attempts} \times 0.5\text{s})\)

5. **Evaluation and Persistence**
   The final score is compared against the user's personal best. The interface displays either **Success (New Record!)** or **Try Again** and asynchronously submits the result through the `saveGameResult` GraphQL mutation.

---

## GraphQL API Specification

| Operation | Name                    | Description                                                              |
| --------- | ----------------------- | ------------------------------------------------------------------------ |
| Mutation  | `register(input)`       | Registers a new user and returns a JWT token and user profile.           |
| Mutation  | `login(input)`          | Authenticates user credentials and returns a JWT token and user profile. |
| Mutation  | `saveGameResult(input)` | Persists game statistics including `rawDuration` and `wrongAttempts`.    |
| Query     | `me`                    | Retrieves the authenticated user's profile.                              |
| Query     | `getUserGameHistory`    | Returns the authenticated user's historical game results.                |
| Query     | `getUserBestScore`      | Returns the user's best recorded score.                                  |
| Query     | `getLeaderboard`        | Returns the global leaderboard ranked by ascending final score.          |

---

## Quick Start and Setup

### Prerequisites

* [Docker and Docker Compose](https://www.docker.com/) installed
* [Bun](https://bun.sh/) or [Node.js 18+](https://nodejs.org/) installed

### Option A: Docker Compose

```bash
# 1. Clone the repository
git clone <repository-url>
cd typing-speed-game

# 2. Start PostgreSQL and backend services
docker-compose up --build -d

# 3. Apply Prisma migrations
docker-compose exec backend bunx prisma migrate dev --name init

# 4. Start the frontend
cd frontend
npm install
npm run dev
```

The services will be available at:

* Frontend application: `http://localhost:3000`
* GraphQL Yoga API and GraphiQL: `http://localhost:4000/graphql`
* PostgreSQL database: `localhost:5432`

### Option B: Local Development

```bash
# 1. Set up the backend
cd backend
npm install   # or bun install

cp .env.example .env

# Generate Prisma client and apply migrations
npx prisma generate
npx prisma migrate dev --name init

# Start the GraphQL Yoga backend
npm run dev   # or bun run start:dev

# 2. Start the frontend in a new terminal
cd ../frontend
npm install
npm run dev
```

---

## Testing Strategy

The test suite covers core game logic, score calculation, keyboard interaction, and authentication.

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

Key test areas include:

* Random sequence generation
* Keyboard focus management
* Correct and incorrect key handling
* `0.5s` penalty calculation per incorrect attempt
* Final score calculation
* JWT authentication
* Game-result persistence
* Frontend and backend integration
