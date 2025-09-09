# Contributing Guide - Azure Image Studio

Thank you for your interest in contributing to Azure Image Studio! This guide will help you get started with contributing to our community project.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.1

## 🤝 How to Contribute

We welcome contributions from the community! There are many ways to contribute:

- 🐛 **Bug Reports**: Report issues and bugs
- 💡 **Feature Requests**: Suggest new features and improvements
- 📝 **Documentation**: Improve or add documentation
- 🔧 **Code Contributions**: Submit code fixes and new features
- 🧪 **Testing**: Help test new features and report issues
- 🎨 **Design**: Contribute to UI/UX improvements
- 🌍 **Translations**: Help translate the application

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js 18+** installed
- **Git** installed and configured
- **Azure subscription** with AI services access (for testing)
- Basic knowledge of **TypeScript**, **React**, and **Next.js**

### Development Setup

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/azure-image-studio.git
cd azure-image-studio

# Add upstream remote
git remote add upstream https://github.com/DrHazemAli/azure-image-studio.git
```

#### 2. Install Dependencies

```bash
# Install main dependencies
npm install

# Install CLI dependencies
cd cli && npm install && cd ..
```

#### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Add your Azure API key to `.env.local`:

```bash
AZURE_API_KEY=your_azure_api_key_here
```

#### 4. Start Development Server

```bash
# Start the development server
npm run dev

# In another terminal, start CLI development
cd cli && npm run dev
```

## 📋 Development Workflow

### Branch Strategy

We use a simple branching strategy:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Feature branches
- **`bugfix/*`**: Bug fix branches
- **`hotfix/*`**: Critical bug fixes

### Creating a Branch

```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### Making Changes

1. **Make your changes** following our coding standards
2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Commit your changes** with clear messages

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(api): add support for FLUX 1.1 Pro model
fix(ui): resolve canvas zoom issue on mobile
docs(readme): update installation instructions
test(api): add tests for image generation endpoint
```

### Testing Your Changes

#### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check
```

#### Manual Testing

1. **Test the feature** you've implemented
2. **Test edge cases** and error scenarios
3. **Test on different browsers** if UI changes
4. **Test with different Azure models** if applicable

### Submitting Changes

#### 1. Push Your Branch

```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

#### 2. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit the PR

#### 3. PR Template

When creating a PR, please include:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🎯 Areas for Contribution

### High Priority

- 🐛 **Bug Fixes**: Fix reported issues
- 📚 **Documentation**: Improve guides and API docs
- 🧪 **Testing**: Add more test coverage
- 🎨 **UI/UX**: Improve user interface
- ⚡ **Performance**: Optimize application performance

### Medium Priority

- 🔧 **New Features**: Add requested features
- 🌍 **Internationalization**: Add multi-language support
- 📱 **Mobile**: Improve mobile experience
- 🔌 **Integrations**: Add new AI model integrations
- 🛠️ **Developer Tools**: Improve CLI and development tools

### Low Priority

- 🎨 **Themes**: Add new UI themes
- 📊 **Analytics**: Add usage analytics
- 🔐 **Security**: Enhance security features
- 📈 **Monitoring**: Add monitoring and logging

## 📝 Code Standards

### TypeScript

- Use **TypeScript** for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use strict type checking

### React/Next.js

- Use **functional components** with hooks
- Follow **Next.js 13+ App Router** patterns
- Use **Server Components** when appropriate
- Implement proper error boundaries

### Styling

- Use **Tailwind CSS** for styling
- Follow **mobile-first** approach
- Use **CSS modules** for component-specific styles
- Implement **dark mode** support

### File Organization

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── studio/         # Studio-specific components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

### Naming Conventions

- **Files**: kebab-case (`my-component.tsx`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Types/Interfaces**: PascalCase (`MyType`)

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Use **Jest** and **React Testing Library**
- Aim for high test coverage
- Test edge cases and error scenarios

### Integration Tests

- Test API endpoints
- Test component interactions
- Test user workflows

### E2E Tests

- Test critical user journeys
- Use **Playwright** or **Cypress**
- Test on multiple browsers

### Test Structure

```typescript
describe("ComponentName", () => {
  it("should render correctly", () => {
    // Test implementation
  });

  it("should handle user interactions", () => {
    // Test implementation
  });

  it("should handle error states", () => {
    // Test implementation
  });
});
```

## 📚 Documentation Standards

### Code Documentation

- Use **JSDoc** for functions and classes
- Document complex logic and algorithms
- Include examples for public APIs

### README Files

- Keep README files up to date
- Include installation and usage instructions
- Add examples and screenshots

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error codes and messages

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test on latest version** of the application
3. **Check browser console** for errors
4. **Try to reproduce** the issue

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g., Windows 10, macOS 12, Ubuntu 20.04]
- Browser: [e.g., Chrome 91, Firefox 89, Safari 14]
- Node.js version: [e.g., 18.0.0]
- Application version: [e.g., 1.0.1]

## Screenshots

If applicable, add screenshots

## Additional Context

Any other context about the problem
```

## 💡 Feature Requests

### Before Requesting

1. **Search existing issues** to avoid duplicates
2. **Consider the scope** and complexity
3. **Think about use cases** and benefits
4. **Check if it aligns** with project goals

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should this feature work?

## Alternatives Considered

What other solutions have you considered?

## Additional Context

Any other context or screenshots
```

## 🔧 Development Tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **ESLint**
- **GitLens**

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Release notes prepared
- [ ] Tag created

## 🤝 Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md):

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and reviews

### Getting Help

- Check existing documentation first
- Search GitHub issues and discussions
- Ask questions in GitHub Discussions
- Be specific about your problem

## 🏆 Recognition

Contributors are recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub contributors** page
- **Release notes** for major contributions

## 📞 Contact

- **Maintainer**: [Hazem Ali](https://github.com/DrHazemAli)
- **GitHub Issues**: [Report Issues](https://github.com/DrHazemAli/azure-image-studio/issues)
- **GitHub Discussions**: [Join Discussion](https://github.com/DrHazemAli/azure-image-studio/discussions)

## 📚 Additional Resources

### Documentation

- [Installation Guide](installation.md) - Setup instructions
- [Developer Guide](developer-guide.md) - Development setup
- [API Documentation](api-documentation.md) - API reference
- [Architecture Guide](architecture.md) - System design

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🧭 Navigation

<div align="center">

[← Back: CLI Documentation](cli-documentation.md) | [Next: Development Roadmap →](roadmap.md)

</div>

---

**Thank you for contributing to Azure Image Studio! Together, we can build something amazing.** 🚀

Made with ❤️ by the community
