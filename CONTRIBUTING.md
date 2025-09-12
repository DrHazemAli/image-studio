# Contributing to Image Studio

Thank you for your interest in contributing to Image Studio! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions from developers of all skill levels. There are many ways to contribute:

- 🐛 **Bug Reports**: Report issues and bugs
- 💡 **Feature Requests**: Suggest new features and improvements
- 📝 **Documentation**: Improve or add documentation
- 🔧 **Code Contributions**: Fix bugs or implement features
- 🧪 **Testing**: Help test new features and report issues
- 🎨 **Design**: Improve UI/UX and visual design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- A GitHub account
- Basic knowledge of React, TypeScript, and Next.js

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/image-studio.git
   cd image-studio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good examples
feat: add support for FLUX 1.1 Pro model
fix: resolve canvas zoom issue on mobile
docs: update API documentation
style: improve button hover animations
refactor: simplify Azure provider configuration

# Bad examples
fix stuff
update
changes
```

### Pull Request Process

1. **Create a Pull Request**
   - Use a descriptive title
   - Reference any related issues
   - Provide a clear description of changes

2. **Ensure Quality**
   - All tests pass (if applicable)
   - Code follows project style guidelines
   - Documentation is updated if needed
   - No console errors or warnings

3. **Request Review**
   - Request review from maintainers
   - Address feedback promptly
   - Keep the PR focused and manageable

## 🎯 Areas for Contribution

### High Priority

- **Bug Fixes**: Fix reported issues
- **Performance**: Optimize image generation and rendering
- **Accessibility**: Improve accessibility features
- **Mobile**: Enhance mobile experience
- **Documentation**: Improve and expand documentation

### Feature Development

- **New AI Models**: Add support for additional models
- **Advanced Tools**: Implement new editing tools
- **Collaboration**: Add real-time collaboration features
- **Export Options**: Add more export formats
- **Templates**: Create image templates and presets

### Documentation

- **User Guides**: Improve user documentation
- **API Docs**: Enhance technical documentation
- **Examples**: Add code examples and tutorials
- **Translations**: Help translate documentation

## 🐛 Reporting Issues

### Before Reporting

1. Check if the issue already exists
2. Try the latest version
3. Check the documentation
4. Search closed issues for solutions

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**

- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Requesting

1. Check if the feature already exists
2. Search existing feature requests
3. Consider if it aligns with project goals

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Test edge cases and error conditions
- Maintain good test coverage
- Use descriptive test names

## 📝 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up to date
- Follow the existing documentation style

### Types of Documentation

- **README**: Project overview and quick start
- **User Guides**: How to use features
- **API Docs**: Technical reference
- **Architecture**: System design and structure
- **Contributing**: This file and related guides

## 🔧 Development Workflow

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring
- `test/description`: Test improvements

### Code Review Process

1. **Self Review**: Review your own code before submitting
2. **Automated Checks**: Ensure all checks pass
3. **Peer Review**: Request review from team members
4. **Address Feedback**: Make requested changes
5. **Final Review**: Maintainer approval and merge

## 🎨 Design Guidelines

### UI/UX Principles

- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure accessibility standards
- **Responsiveness**: Work on all device sizes
- **Performance**: Optimize for speed and efficiency

### Component Guidelines

- Use existing Radix UI components when possible
- Follow the established component structure
- Maintain consistent styling with Tailwind CSS
- Add proper TypeScript types

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Changelog is updated
- [ ] Version number is incremented
- [ ] Release notes are prepared

## 🤔 Questions?

If you have questions about contributing:

- **GitHub Discussions**: Use the Discussions tab for general questions
- **Issues**: Create an issue for specific problems
- **LinkedIn**: Contact [LinkedIn](https://www.linkedin.com/in/drhazemali/)

## 🙏 Recognition

Contributors will be recognized in:

- **README**: Listed as contributors
- **Release Notes**: Mentioned in relevant releases
- **GitHub**: Appear in the contributors list

## 📄 License

By contributing to Image Studio, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Image Studio! Your efforts help make this project better for everyone. 🎉
