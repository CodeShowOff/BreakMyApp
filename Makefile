.PHONY: setup up down test lint typecheck format migrate-up migrate-down build

setup:
	uv sync

up:
	docker-compose up -d

down:
	docker-compose down

test:
	uv run pytest tests/

lint:
	uv run ruff check .
	cd apps/web && npm run lint

typecheck:
	uv run mypy .
	cd apps/web && npm run typecheck

format:
	uv run ruff format .

migrate-up:
	uv run alembic upgrade head

migrate-down:
	uv run alembic downgrade -1

build:
	cd apps/web && npm run build
