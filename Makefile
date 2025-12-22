.PHONY: help init up down logs api-shell

help:
	@echo "Targets:"
	@echo "  init      - create local .env from .env.example"
	@echo "  up        - docker-compose up --build -d"
	@echo "  down      - docker-compose down"
	@echo "  logs      - docker-compose logs -f --tail=200"
	@echo "  api-shell - docker-compose exec api sh"

init:
	@cp -n .env.example .env 2>/dev/null || true
	@echo ".env ready"

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f --tail=200

api-shell:
	docker-compose exec api sh
