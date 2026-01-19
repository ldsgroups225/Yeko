# Makefile for Yeko Project Docker Development Environment
# Provides convenient commands for managing Docker services

.PHONY: help docker-up docker-down docker-logs docker-rebuild docker-clean docker-build docker-prod-up docker-prod-down docker-status

# Default target
help: ## Show this help message
	@echo "Yeko Docker Development Environment"
	@echo "==================================="
	@echo ""
	@echo "Development Commands:"
	@echo "  docker-up      Start all development services"
	@echo "  docker-down    Stop all development services"
	@echo "  docker-logs    View logs from all services"
	@echo "  docker-rebuild Rebuild and restart all services"
	@echo "  docker-build   Build all Docker images"
	@echo "  docker-clean   Clean containers and images"
	@echo "  docker-status  Show status of all services"
	@echo ""
	@echo "Production Commands:"
	@echo "  docker-prod-up     Start all production services"
	@echo "  docker-prod-down   Stop all production services"
	@echo "  docker-prod-build  Build all production images"
	@echo ""
	@echo "Service-specific Commands:"
	@echo "  core-up        Start only yeko-core service"
	@echo "  school-up      Start only yeko-school service"
	@echo "  teacher-up     Start only yeko-teacher service"
	@echo "  data-up        Start only data-service"
	@echo "  worker-up      Start only queue-worker"
	@echo ""
	@echo "Utility Commands:"
	@echo "  shell-core     Open shell in yeko-core container"
	@echo "  shell-school   Open shell in yeko-school container"
	@echo "  shell-teacher  Open shell in yeko-teacher container"
	@echo "  shell-data     Open shell in data-service container"
	@echo "  shell-worker   Open shell in queue-worker container"

# Development Commands
docker-up: ## Start all development services
	docker compose up -d
	@echo "✅ All development services started"
	@echo "🌐 yeko-core: http://localhost:3000"
	@echo "🌐 yeko-school: http://localhost:3001"
	@echo "🌐 yeko-teacher: http://localhost:3002"
	@echo "🌐 data-service: http://localhost:8787"

docker-down: ## Stop all development services
	docker compose down
	@echo "🛑 All development services stopped"

docker-logs: ## View logs from all services
	docker compose logs -f

docker-rebuild: ## Rebuild and restart all services
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "🔄 All services rebuilt and restarted"

docker-build: ## Build all Docker images
	docker compose build
	@echo "🏗️ All Docker images built"

docker-clean: ## Clean containers and images
	docker compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "🧹 Docker containers and images cleaned"

docker-status: ## Show status of all services
	docker compose ps

# Production Commands
docker-prod-up: ## Start all production services
	docker compose -f docker-compose.prod.yml up -d
	@echo "✅ All production services started"

docker-prod-down: ## Stop all production services
	docker compose -f docker-compose.prod.yml down
	@echo "🛑 All production services stopped"

docker-prod-build: ## Build all production images
	docker compose -f docker-compose.prod.yml build
	@echo "🏗️ All production Docker images built"

# Service-specific Development Commands
core-up: ## Start only yeko-core service
	docker compose up -d yeko-core
	@echo "✅ yeko-core started: http://localhost:3000"

school-up: ## Start only yeko-school service
	docker compose up -d yeko-school
	@echo "✅ yeko-school started: http://localhost:3001"

teacher-up: ## Start only yeko-teacher service
	docker compose up -d yeko-teacher
	@echo "✅ yeko-teacher started: http://localhost:3002"

data-up: ## Start only data-service
	docker compose up -d data-service
	@echo "✅ data-service started: http://localhost:8787"

worker-up: ## Start only queue-worker
	docker compose up -d queue-worker
	@echo "✅ queue-worker started"

# Utility Commands
shell-core: ## Open shell in yeko-core container
	docker compose exec yeko-core sh

shell-school: ## Open shell in yeko-school container
	docker compose exec yeko-school sh

shell-teacher: ## Open shell in yeko-teacher container
	docker compose exec yeko-teacher sh

shell-data: ## Open shell in data-service container
	docker compose exec data-service sh

shell-worker: ## Open shell in queue-worker container
	docker compose exec queue-worker sh

# Development workflow shortcuts
dev: docker-up ## Alias for docker-up
stop: docker-down ## Alias for docker-down
logs: docker-logs ## Alias for docker-logs
rebuild: docker-rebuild ## Alias for docker-rebuild
clean: docker-clean ## Alias for docker-clean

# Production workflow shortcuts
prod: docker-prod-up ## Alias for docker-prod-up
prod-stop: docker-prod-down ## Alias for docker-prod-down
prod-build: docker-prod-build ## Alias for docker-prod-build

# Advanced Commands
docker-pull: ## Pull latest base images
	docker pull node:22-alpine
	docker pull nginx:alpine
	@echo "📥 Latest base images pulled"

docker-backup: ## Backup important volumes
	docker run --rm -v yeko_postgres_data:/data -v $(PWD):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
	@echo "💾 Database backed up"

docker-restore: ## Restore from backup
	docker run --rm -v yeko_postgres_data:/data -v $(PWD):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
	@echo "📂 Database restored"

# Health check
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Network info
network: ## Show network information
	docker network ls | grep yeko
	docker network inspect yeko_yeko-network
