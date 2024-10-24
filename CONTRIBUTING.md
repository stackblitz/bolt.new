# Contributing to Bolt.new Fork

First off, thank you for considering contributing to Bolt.new! This fork aims to expand the capabilities of the original project by integrating multiple LLM providers and enhancing functionality. Every contribution helps make Bolt.new a better tool for developers worldwide.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### 🐞 Reporting Bugs and Feature Requests
- Check the issue tracker to avoid duplicates
- Use the issue templates when available
- Include as much relevant information as possible
- For bugs, add steps to reproduce the issue

### 🔧 Code Contributions
1. Fork the repository
2. Create a new branch for your feature/fix
3. Write your code
4. Submit a pull request

### ✨ Becoming a Core Contributor
We're looking for dedicated contributors to help maintain and grow this project. If you're interested in becoming a core contributor, please fill out our [Contributor Application Form](https://forms.gle/TBSteXSDCtBDwr5m7).

## Pull Request Guidelines

### 📝 PR Checklist
- [ ] Branch from the main branch
- [ ] Update documentation if needed
- [ ] Manually verify all new functionality works as expected
- [ ] Keep PRs focused and atomic

### 👀 Review Process
1. Manually test the changes
2. At least one maintainer review required
3. Address all review comments
4. Maintain clean commit history

## Coding Standards

### 💻 General Guidelines
- Follow existing code style
- Comment complex logic
- Keep functions focused and small
- Use meaningful variable names

## Development Setup

### 🔄 Initial Setup
1. Clone the repository:
```bash
git clone https://github.com/coleam00/bolt.new-any-llm.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Rename `.env.example` to `.env.local`
   - Add your LLM API keys (only set the ones you plan to use):
```bash
GROQ_API_KEY=XXX
OPENAI_API_KEY=XXX
ANTHROPIC_API_KEY=XXX
...
```
   - Optionally set debug level:
```bash
VITE_LOG_LEVEL=debug
```
**Important**: Never commit your `.env.local` file to version control. It's already included in .gitignore.

### 🚀 Running the Development Server
```bash
pnpm run dev
```

**Note**: You will need Google Chrome Canary to run this locally if you use Chrome! It's an easy install and a good browser for web development anyway.

## Questions?

For any questions about contributing, please:
1. Check existing documentation
2. Search through issues
3. Create a new issue with the question label

Thank you for contributing to Bolt.new! 🚀