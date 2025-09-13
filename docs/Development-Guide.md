# Development Guide - Booking System

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/emadansari96/Booking-System.git
cd Booking-System
bun install
cp .env.example .env

# Start services
docker-compose up -d
bun run dev
```

## 🏗️ Project Structure

```
src/
├── domains/user-management/     # User Domain
│   ├── commands/               # Commands
│   ├── queries/                # Queries
│   ├── events/                 # Events
│   ├── cqrs/                   # CQRS Buses
│   ├── controllers/            # Controllers
│   ├── services/               # Services
│   └── dtos/                   # DTOs
├── shared/                     # Shared Infrastructure
│   ├── domain/                 # Domain Base
│   └── infrastructure/         # Infrastructure
└── config/                     # Configuration
```

## 🔧 Commands

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build app
bun run test         # Run tests
bun run lint         # Lint code
bun run format       # Format code

# Docker
bun run docker:up    # Start services
bun run docker:down  # Stop services

# Database
bun run migration:run    # Run migrations
bun run migration:revert # Revert migration
```

## 🧪 Testing

```typescript
// Unit test example
describe('UserController', () => {
  it('should create user', async () => {
    const dto = { email: 'test@example.com' };
    const result = await controller.createUser(dto);
    expect(result).toBeDefined();
  });
});
```

## 📝 Code Style

- **Classes**: PascalCase (`UserController`)
- **Files**: kebab-case (`user.controller.ts`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY`)

## 🚀 Adding New Domain

1. Create domain structure
2. Add commands/queries/events
3. Create handlers
4. Add buses
5. Create controller
6. Add module

## 🔍 Debugging

```typescript
// Enable logging
private readonly logger = new Logger(ServiceName);

// Debug with VS Code
// Use .vscode/launch.json configuration
```

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [Redis Docs](https://redis.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Create PR
5. Review and merge

## 📞 Support

- Check documentation
- Search issues
- Create new issue
- Contact team
