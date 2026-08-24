# BreakMyApp

Production-grade SaaS for authorized adversarial testing of web applications.

## Prerequisites
- [uv](https://github.com/astral-sh/uv) (for Python package management)
- Node.js (for Next.js frontend)
- Docker & Docker Compose

## Quickstart

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start the local infrastructure (PostgreSQL, Temporal, MinIO):
   ```bash
   make up
   ```
3. Install dependencies:
   ```bash
   make setup
   ```
4. Run migrations:
   ```bash
   make migrate-up
   ```

## Development
See `CONTRIBUTING.md` for guidelines.
