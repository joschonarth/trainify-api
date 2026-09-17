<div align="center">

# 💪 Trainify API

*A REST API for the Trainify app to manage workouts, exercises, sessions, metrics and user progress.*

<img src="https://img.shields.io/github/last-commit/joschonarth/trainify-api?style=default&logo=git&logoColor=white&color=0080ff&labelColor=2f363d" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/joschonarth/trainify-api?style=default&color=0080ff&labelColor=2f363d" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/joschonarth/trainify-api?style=default&color=0080ff&labelColor=2f363d" alt="repo-language-count">

---

📃 [About](#-about)&nbsp;&nbsp;•&nbsp;&nbsp;
🛠️ [Tech Stack](#️-tech-stack)&nbsp;&nbsp;•&nbsp;&nbsp;
✨ [Features](#-features)&nbsp;&nbsp;•&nbsp;&nbsp;
🚀 [Getting Started](#-getting-started)&nbsp;&nbsp;•&nbsp;&nbsp;
📖 [API Documentation](#-api-documentation)&nbsp;&nbsp;•&nbsp;&nbsp;
🧪 [Tests](#-tests)

</div>

---

## 📃 About

**Trainify API** is the backend of the Trainify app, responsible for providing a REST layer to register and track workouts. The application allows managing exercises, creating and finishing workout sessions, logging weight, tracking metrics, and consuming progress data through a well-organized modular structure.

The project was built with Fastify, TypeScript, Prisma ORM and PostgreSQL, with a focus on performance, strong typing, hardened security and interactive documentation via Scalar.

---

## 🛠️ Tech Stack

- 🟢 **[Node.js](https://nodejs.org/)** — Server-side JavaScript runtime.
- ⚡ **[Fastify](https://fastify.dev/)** — Fast and efficient web framework.
- 🔷 **[TypeScript](https://www.typescriptlang.org/)** — Static typing and safer development.
- 🗃️ **[Prisma ORM](https://www.prisma.io/)** — Modern, type-safe ORM for relational databases.
- 🐘 **[PostgreSQL](https://www.postgresql.org/)** — Robust relational database.
- 🐳 **[Docker](https://www.docker.com/)** — Containerization of the local database.
- 🔐 **[@fastify/jwt](https://github.com/fastify/fastify-jwt)** — JWT authentication.
- 🍪 **[@fastify/cookie](https://github.com/fastify/fastify-cookie)** — Cookie parsing and management.
- 🌐 **[@fastify/cors](https://github.com/fastify/fastify-cors)** — CORS handling.
- 🛡️ **[@fastify/helmet](https://github.com/fastify/fastify-helmet)** — Security headers for HTTP responses.
- 🚦 **[@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit)** — Request rate limiting.
- 📖 **[@fastify/swagger](https://github.com/fastify/fastify-swagger)** + **[@scalar/fastify-api-reference](https://scalar.com/)** — Interactive API documentation.
- 🔑 **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** — Password hashing.
- 📅 **[dayjs](https://day.js.org/)** — Lightweight date manipulation.
- 🧩 **[Zod](https://zod.dev/)** — Runtime schema validation with full type inference.
- 📦 **[tsup](https://tsup.egoist.dev/)** — Bundler for building the production output.
- 🧪 **[Vitest](https://vitest.dev/)** — Automated testing.
- 🔍 **[Biome](https://biomejs.dev/)** — Fast, opinionated linter and formatter.

---

## ✨ Features

- [x] 🏋️ Exercise management (catalog and custom exercises)
- [x] 🗓️ Workout creation, plans and weekly scheduling
- [x] ⏱️ Starting, pausing and finishing workout sessions
- [x] 📝 Exercise log tracking and session history
- [x] 📊 Performance comparisons (weekly, monthly and per exercise)
- [x] ⚖️ Weight logging, weight goals and analytics
- [x] 📈 Overall user metrics and progress
- [x] 🏆 Gamification module: streaks, badges and achievements
- [x] 🔐 JWT authentication and Google sign-in
- [x] 🛡️ Security hardening with Helmet and rate limiting
- [x] 🧩 Data validation with Zod
- [x] 📖 Interactive API documentation with Scalar
- [x] 🧪 Automated testing with Vitest

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🟩 [Node.js 20+](https://nodejs.org/)
- 📦 [npm](https://www.npmjs.com/)
- 🐳 [Docker](https://www.docker.com/)

### 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/joschonarth/trainify-api.git
   ```

2. Navigate into the project:

   ```bash
   cd trainify-api
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### 🔑 Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Example content:

```env
NODE_ENV=dev
PORT=3333
JWT_SECRET=your_jwt_secret
DATABASE_URL="postgresql://docker:docker@localhost:5432/trainify?schema=public"
```

### 🐳 Database

Start the PostgreSQL container:

```bash
docker compose up -d
```

Run the Prisma migrations:

```bash
npm run migrate
```

Optionally, seed the database with sample data:

```bash
npm run seed
```

### ▶️ Running

Start the server in development mode:

```bash
npm run dev
```

API running at **[http://localhost:3333](http://localhost:3333)**

---

## 📖 API Documentation

With the server running, access the interactive documentation at:

- 📚 **[http://localhost:3333/docs](http://localhost:3333/docs)**

There is also a health check endpoint available at:

- ❤️ **[http://localhost:3333/health](http://localhost:3333/health)**

---

## 🧪 Tests

Tests are run with Vitest and cover the main application flows.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 📁 Project Structure

```txt
src/
  modules/
    exercise/
    gamification/
    metric/
    session/
    user/
    weight/
    workout/
  lib/
  env/
```

---

## ⭐ Contributing

Contributions are welcome. If you'd like to help, open an issue or submit a pull request with your proposed improvements.

If you liked this project, consider leaving a ⭐ on GitHub — it really helps!

---

<div align="center">

Made with ♥ by **[João Otávio Schonarth](https://github.com/joschonarth)**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joschonarth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joschonarth)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:joschonarth@gmail.com)

</div>