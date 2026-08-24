# Contributing

## Local Development

BreakMyApp uses Docker Compose to orchestrate local infrastructure.

### Prerequisites
- Docker & Docker Compose
- `uv` for Python dependency management
- Node.js (for the Next.js frontend)

### Setup

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
2. Start the local infrastructure:
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

### Code Standards
- **Python**: Use `ruff` for linting and formatting. Run `make lint` and `make format`.
- **TypeScript**: Use `eslint` and `prettier`.
- **Types**: We enforce strict type checking. Run `make typecheck` (uses `mypy` and `tsc`).

### Submitting PRs
- Ensure all CI checks pass locally (`make test`, `make lint`, `make typecheck`).
- Add tests for any new features.
- Update ADRs if an architectural decision is changed.
