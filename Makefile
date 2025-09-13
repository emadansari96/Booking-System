# Makefile for Booking System

.PHONY: help install build start dev test lint format clean docker-up docker-down docker-build

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  build       - Build the application"
	@echo "  start       - Start the application"
	@echo "  dev         - Start development server"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linter"
	@echo "  format      - Format code"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-up   - Start Docker services"
	@echo "  docker-down - Stop Docker services"
	@echo "  docker-build - Build Docker image"

# Install dependencies
install:
	bun install

# Build application
build:
	bun run build

# Start application
start:
	bun run start:prod

# Development server
dev:
	bun run start:dev

# Run tests
test:
	bun run test

# Run linter
lint:
	bun run lint

# Format code
format:
	bun run format

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

# Full development setup
setup: install docker-up
	@echo "Development environment is ready!"
	@echo "Run 'make dev' to start the development server"

# Production deployment
deploy: build docker-build
	@echo "Application is ready for deployment!"
