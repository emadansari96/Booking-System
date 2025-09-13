# Contributing to Booking System

Thank you for your interest in contributing to the Booking System! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun 1.0+
- Docker & Docker Compose
- Git

### Setup
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Booking-System.git
cd Booking-System

# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Start services
docker-compose up -d

# Run tests
bun run test
```

## 🔧 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow coding standards
- Add tests for new features
- Update documentation

### 3. Test Changes
```bash
# Run unit tests
bun run test

# Run integration tests
bun run test:e2e

# Check code quality
bun run lint
bun run format
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## 📝 Code Standards

### TypeScript
- Use strict typing
- Avoid `any` type
- Use interfaces for contracts
- Use enums for constants

### Naming Conventions
- **Classes**: PascalCase (`UserController`)
- **Files**: kebab-case (`user.controller.ts`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY`)

### Code Style
- Use ESLint rules
- Use Prettier formatting
- Use meaningful names
- Add comments for complex logic

## 🧪 Testing

### Unit Tests
```typescript
describe('UserService', () => {
  it('should create user', async () => {
    const dto = { email: 'test@example.com' };
    const result = await service.createUser(dto);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('UserController (e2e)', () => {
  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com' })
      .expect(201);
  });
});
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments
- Document complex functions
- Explain business logic
- Update README if needed

### API Documentation
- Use Swagger decorators
- Document all endpoints
- Add examples
- Update API docs

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Search documentation
3. Try to reproduce
4. Check logs

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Node.js: [e.g., 18.17.0]
- Bun: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

### Before Requesting
1. Check existing features
2. Search discussions
3. Consider alternatives
4. Think about implementation

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives
What other solutions were considered?

## Additional Context
Any other relevant information
```

## 🔍 Code Review

### Review Checklist
- [ ] Code follows standards
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No breaking changes
- [ ] Performance is considered
- [ ] Security is addressed

### Review Process
1. Automated checks pass
2. Code review by maintainers
3. Address feedback
4. Merge when approved

## 🏗️ Architecture

### Domain Structure
```
src/domains/
├── user-management/     # User Domain
├── booking/            # Booking Domain (planned)
├── resource/           # Resource Domain (planned)
├── payment/            # Payment Domain (planned)
└── notification/       # Notification Domain (planned)
```

### Adding New Domain
1. Create domain directory
2. Add commands/queries/events
3. Create handlers
4. Add buses
5. Create controller
6. Add module
7. Update app module

## 🚀 Release Process

### Versioning
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

### Release Steps
1. Update version
2. Update changelog
3. Create release notes
4. Tag release
5. Deploy

## 📞 Support

### Getting Help
- Check documentation
- Search issues
- Ask in discussions
- Contact maintainers

### Communication
- Be respectful
- Be constructive
- Be patient
- Be helpful

## 🎯 Contribution Areas

### High Priority
- Bug fixes
- Performance improvements
- Security enhancements
- Documentation updates

### Medium Priority
- New features
- Code refactoring
- Test improvements
- Tooling updates

### Low Priority
- UI improvements
- Additional examples
- Minor optimizations
- Cosmetic changes

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tests added/updated
```

## 🎉 Recognition

### Contributors
- All contributors are recognized
- Names added to README
- GitHub contributors page
- Release notes

### Types of Contributions
- Code contributions
- Documentation
- Bug reports
- Feature requests
- Code reviews
- Testing

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge
- Be respectful
- Be inclusive
- Be collaborative
- Be constructive

### Our Standards
- Use welcoming language
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the community

## 📞 Contact

- **Maintainer**: Emad Ansari
- **Email**: emad@booking-system.com
- **GitHub**: @emadansari96
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

Thank you for contributing to the Booking System! 🎉
