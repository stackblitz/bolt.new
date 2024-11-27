[![Bolt: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.new)

# Bolt Community Edition

## Overview

**Bolt Community Edition** is a community-driven fork of the original Bolt repository, developed to provide more frequent updates and stronger community involvement. The original Bolt repository shifted focus towards a commercial edition, leading to the creation of this fork to maintain an open-source, actively developed alternative.

This edition closely follows the commercial version while encouraging open contributions and innovation from the community.

## Community

Join the discussion and stay updated:
- **Discord**: [https://discord.gg/t9b6Npje](https://discord.gg/t9b6Npje)

## Getting Started

### Prerequisites

- **Git**
- **Docker / Docker Compose** (optional)
- **Node.js / npm** (optional)
- **LLM API Key** (for `.env.local`)

### Installation Steps

1. **Clone the Repository**  
   Open a terminal or command prompt with admin permissions and run:
   ```bash
   git clone https://github.com/Bolt-CE/bolt.git
   ```

2. **Setup Environment File**  
   Rename `env.example` to `.env.local` and add your LLM API key.

3. **Run Bolt**  
   Choose one of the following methods to run Bolt:

#### 4a. Direct Docker Build Commands
Use Docker’s target feature to specify the environment:
   ```bash
   # Development build
   docker build . --target bolt-ai-development
   
   # Production build
   docker build . --target bolt-ai-production
   ```

#### 4b. Docker Compose with Profiles
Run the container with Docker Compose profiles:
   ```bash
   # Development environment
   docker-compose --profile development up
   
   # Production environment
   docker-compose --profile production up
   ```

   **Note**: In development mode, changes to the code will be reflected live in the container (hot reloading).

#### 4c. Using npm
   ```bash
   npm i . && npm run dev
   ```

## AI-Powered Full-Stack Web Development in the Browser

Bolt allows you to prompt, run, edit, and deploy full-stack applications directly from your browser—no local setup required.

### Key Features:
- **Full-Stack in the Browser**: Powered by StackBlitz’s WebContainers, you can:
  - Install and run npm tools (like Vite, Next.js)
  - Run Node.js servers
  - Interact with third-party APIs
  - Deploy directly from chat
  - Share your projects via a URL

- **AI with Environment Control**: Unlike traditional AI code assistants, Bolt provides full control over:
  - Filesystem
  - Node server
  - Package manager
  - Terminal and browser console

This enables Bolt to handle the entire app lifecycle—from creation to deployment.

### What Makes Bolt Different?
Unlike other AI tools (e.g., Claude, v0), Bolt empowers you to:
- Install packages
- Run backend servers
- Edit code within a full-stack environment

## Tips and Tricks

- **Be Specific About Your Stack**: Mention frameworks (e.g., Astro, Tailwind) in your initial prompt for optimal scaffolding.
- **Enhance Prompts**: Use the 'enhance' icon to refine your prompt before submitting.
- **Scaffold Basics First**: Establish the basic structure before adding advanced features.
- **Batch Simple Instructions**: Combine tasks in one prompt to save time and reduce API usage.

---

Bolt Community Edition is designed for developers, PMs, and designers to build production-grade full-stack applications with ease. Explore the [open-source repository](https://github.com/Bolt-CE/bolt) and join the community today!
