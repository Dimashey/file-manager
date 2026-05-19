.PHONY: setup start stop build logs

# Setup the environment
setup:
	@if [ ! -f .env ]; then cp .env.example .env; echo ".env created from .env.example"; fi
	cd backend && npm install

# Start the project using docker-compose
start:
	docker-compose up -d postgres minio redis
	@echo "Waiting for database to be ready..."
	@sleep 5
	docker-compose run --rm backend npm run migration:run
	docker-compose up --build backend

# View backend logs
logs:
	docker-compose logs -f backend

# Stop all services
stop:
	docker-compose down

# Rebuild services
build:
	docker-compose build
