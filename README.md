# File Manager Project

A simple service for storing files with hierarchical management and sharing capabilities.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/) (optional, but recommended)

## Setup and Start

The easiest way to start the project is using the provided `Makefile`.

### 1. Initial Setup
This will create your `.env` file and install backend dependencies.
```bash
make setup
```

### 2. Start the Project
This will start the infrastructure (Postgres, MinIO, Redis) and the backend in Docker containers.
```bash
make start
```

Once started, the API will be available at `http://localhost:3001`.
The **Swagger Documentation** can be accessed at: `http://localhost:3001/api/docs`.

### 3. Stop the Project
```bash
make stop
```

## Manual Setup (without Make)

If you don't have `make` installed, follow these steps:

1. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start the services:
   ```bash
   docker-compose up -d --build
   ```

---
*Developed using Gemini CLI*
