.PHONY: help init up down restart status logs server-shell web-shell clean

help:
	@echo "Targets:"
	@echo "  init         - create local .env from .env.example"
	@echo "  up           - docker-compose up --build -d"
	@echo "  down         - docker-compose down"
	@echo "  restart      - docker-compose restart"
	@echo "  status       - docker-compose ps"
	@echo "  logs         - docker-compose logs -f --tail=200"
	@echo "  server-shell - docker-compose exec rhserver sh"
	@echo "  web-shell    - docker-compose exec web-admin sh"
	@echo "  clean        - docker-compose down -v --rmi local --remove-orphans"

init:
	@cp -n .env.example .env 2>/dev/null || true
	@echo ".env ready"

up:
	docker-compose up --build -d

down:
	docker-compose down

restart:
	docker-compose restart

status:
	docker-compose ps

logs:
	docker-compose logs -f --tail=200

server-shell:
	docker-compose exec rhserver sh

web-shell:
	docker-compose exec web-admin sh

clean:
	docker-compose down -v --rmi local --remove-orphans
